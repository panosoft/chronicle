var _ = require('lodash');
var fs = require('fs');
var suspend = require('suspend');
var resume = suspend.resume;
var fork = suspend.fork;
var join = suspend.join;
var validator = require('../validator');
var path = require('path');
var requireString = require('../require-string');


// TODO consider // throttle how many files are loaded at once


var isJs = function (filePath) {
	return path.extname(filePath) === '.js';
};
/**
 * Joins and Resolves relative paths
 *
 * @param {Object} paths
 * @param {String} basePath
 *
 * @returns {Object} paths
 */
var resolvePaths = function (paths, basePath) {
	return _.mapValues(paths, function (filePath) {
		if (validator.isRelativePath(filePath)) {
			filePath = path.resolve(path.join(basePath, filePath));
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
 * @params {Object.<String, String>} manifest
 * 	{name: path}
 *
 * @returns {Object.<String, *>} manifest
 * 	{name: file contents | module exports}
 */
var loadFiles = suspend.promise(function * (manifest, moduleDirname) {
	var paths = _.values(manifest);

	// Load paths
	_.forEach(paths, function (path) {
		fs.readFile(path, 'utf8', fork());
	});
	var files = yield join();

	// Load modules
	files = _.map(files, function (content, index) {
		if (isJs(paths[index])) {
			var filename = path.join(moduleDirname, path.basename(paths[index]));
			content = requireString(content, filename);
		}
		return content;
	});

	// Return result
	return _.mapValues(manifest, function (filePath) {
		var index = paths.indexOf(filePath);
		return files[index];
	});
});
/**
 * Finds object properties with a path value and loads them.
 * Shallow search (i.e. only top level properties are scanned)
 *
 * @param {String} base Base for relative paths
 * @param {String|Object} manifest // TODO add support for array manifest [path]
 *    path {name: path}
 *
 * @returns {String|Object} manifest
 *    file {name: file}
 */
var load = suspend.promise(function * (manifest, options) {
	// Set defaults
	manifest = _.isPlainObject(manifest) ? manifest : {path: manifest};
	options = options || {};
	var basePath = options.basePath || ''; // TODO refactor into config.basePath
	var moduleDirname = options.moduleDirname || ''; // TODO consider // what should the default value of this be?
													 // fileLoader __dirname? basePath?

	// Prepare paths
	var paths = _.pick(manifest, validator.isPath);
	paths = resolvePaths(paths, basePath);

	// Load files from paths
	var files = yield loadFiles(paths, moduleDirname); // {name: path} -> {name: content | module exports}


	// Return loaded object
	_.assign(manifest, files); // TODO consider // Should we modify manifest or return a new object?
	return (_.size(manifest) === 1) ? manifest.path : manifest;
});

module.exports = {
	load: load
};