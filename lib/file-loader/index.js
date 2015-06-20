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
var Cache = require('lru-cache');
var status = require('statuses');

// TODO consider // throttle how many files are loaded at once
// fs reads relative paths relative to process.cwd()
// require reads relative paths relative to the module __dirname


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
 * Compile modules from file content strings.
 *
 * @param {Object} files
 *    {path: content}
 *    path is a fully qualified uri or absolute path
 * @param {Object} [options]
 * @param {String} [options.dirname]
 *    Directory to use to override the modules default directory
 *
 * @returns {Object} files
 *    {path: file | module}
 */
var loadModules = function (files, options) {
	return _.mapValues(files, function (content, filePath) {
		if (isJs(filePath)) {
			var dirname = options.dirname || (validator.isURL(filePath) ? path.resolve() : path.dirname(filePath));
			var filename = path.join(dirname, path.basename(filePath));
			content = requireString(content, filename);
		}
		return content;
	});
};

/**
 * Create a new File Loader
 *
 * @param [options]
 * @param [options.max]
 * 	Maximum cache size. Calculated using sum of the results from `options.length` function on each item in the cache
 * @param [options.length]
 * 	Function used to calculate length of each item in cache
 *
 * @returns {{load}}
 */
var create = function (options) {
	options = _.defaults(options || {}, {
		max: 500,
		length: function (value) {
			return 1;
		}
	});
	var cache = new Cache({
		max: options.max,
		length: options.length
	});
	var loadRemoteFile = suspend(function * (path, callback) {
		var cachedFile = cache.get(path); // cached file item: path: {etag, lastmodified, contents}
		var headers = {};
		if (cachedFile) {
			headers = {
				'if-modified-since': cachedFile.lastModified,
				'if-none-match': cachedFile.eTag
			};
		}
		var result = yield request({
			url: path,
			headers: headers
		}, suspend.resumeRaw());
		var error = result[0];
		var response = result[1];
		var body = result[2];
		if (error) {
			return callback(error);
		}
		else if (response.statusCode === 200) {
			cache.set(path, {
				eTag: response.headers.etag,
				lastModified: response.headers['last-modified'],
				contents: body
			});
		}
		else if (response.statusCode === 304) {
			body = cachedFile.contents;
		}
		else {
			return callback(new Error('Unrecognized statusCode: ' + response.statusCode + ': ' + status[response.statusCode]));
		}
		return callback(null, body);
	});
	/**
	 * Load files from path(s)
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
	/**
	 * Loads file contents and js modules from both remote and local paths.
	 * Shallow search (i.e. only top level properties of an object are scanned)
	 *
	 * @param {String|Object} manifest
	 *    path | {name: path | *}
	 *    paths can be any one of the following:
	 *    - fully qualified uri (i.e. http://test.com/file.txt)
	 *    - absolute path (i.e. starting with /)
	 *    - prefixed relative path (i.e. starting with ./ or ../)
	 * @param {Object} [options]
	 * @param {String} [options.basePath]
	 *    Base path used to resolve relative paths
	 *    Defaults to the current working directory
	 * @param {String} [options.dirname]
	 *    Directory used to set __dirname for modules.
	 *    For remote files: defaults to the current working directory
	 *    For local files: defaults to the dirname of the file
	 *
	 * @returns {String|Object} manifest
	 *    file | {name: file contents | module export | *}
	 */
	var load = suspend.promise(function * (manifest, options) {
		// Set defaults
		manifest = _.isPlainObject(manifest) ? manifest : {path: manifest};
		options = _.defaults(options || {}, {
			basePath: '',
			dirname: null
		});

		var namePaths = _.pick(manifest, validator.isPath);
		namePaths = resolvePaths(namePaths, options.basePath);
		var paths = _.values(namePaths);
		var pathFiles = yield loadFiles(paths);
		pathFiles = loadModules(pathFiles, options);
		var nameFiles = _.mapValues(namePaths, function (path) {
			return pathFiles[path];
		});

		_.assign(manifest, nameFiles);
		return (_.size(manifest) === 1) ? manifest.path : manifest;
	});

	return {
		load: load
	};
};

module.exports = {
	create: create
};