var _ = require('lodash');
var fs = require('fs');
var suspend = require('suspend');
var resume = suspend.resume;
var fork = suspend.fork;
var join = suspend.join;
var url = require('url');
var path = require('path');
var validator = require('../validator');
var requireString = require('../require-string');
var callsite = require('callsite');
var request = require('request');

// TODO consider // throttle how many files are loaded at once
// fs reads relative paths relative to process.cwd()
// require reads relative paths relative to the module __dirname

// returns dirname of first file in stack that is not: current __dirname, native, or suspend
var getCallerDirname = function () {
	var stack = callsite();
	var site = _.find(stack, function (site) {
		var filename = site.getFileName();
		return (
			path.dirname(site.getFileName()) !== __dirname
			&& !site.isNative()
			&& !/suspend/ig.test(filename)
		);
	});
	return path.dirname(site.getFileName());
};
var isJs = function (filePath) {
	return path.extname(filePath) === '.js';
};
/**
 * Resolves relative local and remote paths
 *
 * @param {Object} paths
 *    {name: path} where path can be an url, absolute, or relative
 * @param {String} basePath
 *    local path or url
 *
 * @returns {Object} paths
 */
var resolvePaths = function (paths, basePath) {
	return _.mapValues(paths, function (filePath) {
		if (validator.isRelativePath(filePath)) {
			filePath = (validator.isURL(basePath) ? url : path).resolve(basePath, filePath);
		}
		return filePath;
	});
};
/**
 * Load files from path(s)
 *    if local absolute path
 *        if js file or directory, load with require()
 *        else load with fs.readFile()
 *    if remote url
 *        if directory, look for index.js
 *        load files with request
 *        load js files with requireString
 *
 * @params {String[]} paths
 *    Resolved paths of files to load
 *
 * @returns {Object.<String, String>} files
 *    {path: contents}
 */
var loadFiles = suspend.promise(function * (paths) {
	_.forEach(paths, function (path) {
		if (validator.isURL(path)) {
			loadRemoteFile(path, fork());
		}
		else {
			fs.readFile(path, 'utf8', fork());
		}
	});
	var contents = yield join();
	return _.zipObject(paths, contents);
});
var loadRemoteFile = suspend(function * (path, callback) {
	var result = yield request(path, suspend.resumeRaw());
	var error = result[0];
	var response = result[1];
	var body = result[2];
	// if response 200, there is a body
	// cache file
	// if response 304, no body -> use cached version (have to send special type of request though so that server knows our version
	return (error ? callback(error) : callback(null, body));
});
/**
 * Compile modules from strings.
 *
 * @param {Object} files
 *    {path: content}
 * @param {Object} options
 * @param {String} options.dirname
 *    Directory to use to override the modules default directory
 *
 * @returns {Object} files
 *    {path: file | module}
 */
var loadModules = function (files, options) {
	return _.mapValues(files, function (content, filePath) {
		if (isJs(filePath)) {
			var dirname = options.dirname || (validator.isURL(filePath) ? options.callerDirname : path.dirname(filePath));
			var filename = path.join(dirname, path.basename(filePath));
			content = requireString(content, filename);
		}
		return content;
	});
};
/**
 * Loads file contents and js modules from both remote and local paths.
 * Shallow search (i.e. only top level properties of an object are scanned)
 *
 * @param {String|Object} manifest
 *    path | {name: path | *}
 *    paths can be any one of the following:
 *    - fully qualified uri
 *    - absolute path (i.e. starting with /)
 *    - prefixed relative path (i.e. starting with ./ or ../)
 *    Note: Relative paths with no prefix (i.e. 'local/test.txt') are not supported because they can not be
 *     differentiated from a standard string
 * @param {Object} [options]
 * @param {String} [options.basePath]
 *    Base path used to resolve relative paths
 *    Defaults to the calling modules __dirname
 * @param {String} [options.dirname]
 *    Directory used to set __dirname for modules.
 *    For remote files, this defaults to the calling modules __dirname
 *    For local files, this defaults to the dirname of the local file
 *
 * @returns {String|Object} manifest
 *    file | {name: file}
 */
var load = suspend.promise(function * (manifest, options) {
	var callerDirname = getCallerDirname(); // TODO consider removing // doesn't feel very robust ... // could use cwd instead ...
	// Set defaults
	manifest = _.isPlainObject(manifest) ? manifest : {path: manifest};
	options = _.defaults(options || {}, {
		basePath: callerDirname || '',
		callerDirname: callerDirname
	});

	var namePaths = _.pick(manifest, validator.isPath);
	namePaths = resolvePaths(namePaths, options.basePath);

	var paths = _.values(namePaths);
	var pathFiles = yield loadFiles(paths);
	pathFiles = loadModules(pathFiles, options);

	var nameFiles = _.mapValues(namePaths, function (path) {
		return pathFiles[path];
	});

	// Return loaded object
	_.assign(manifest, nameFiles);
	return (_.size(manifest) === 1) ? manifest.path : manifest;
});

module.exports = {
	load: load
};