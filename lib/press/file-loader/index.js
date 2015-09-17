var Cache = require('lru-cache');
var co = require('co');
var fs = require('mz/fs');
var got = require('got');
var is = require('is_js');
var path = require('path');
var R = require('ramda');
var Ru = require('@panosoft/ramda-utils');
var requireString = require('@panosoft/require-string');
var url = require('url');
var validator = require('../validator');

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
 *    {name: resolved path}
 */
var resolvePaths = function (paths, basePath) {
	return R.mapObj(function (filePath) {
		if (validator.isRelativePath(filePath)) {
			filePath = (validator.isURL(basePath) ? url : path).resolve(basePath, filePath);
		}
		return filePath;
	}, paths);
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
	return R.mapObjIndexed(function (content, filePath) {
		if (isJs(filePath)) {
			var dirname = options.dirname || (validator.isURL(filePath) ? path.resolve() : path.dirname(filePath));
			var filename = path.join(dirname, path.basename(filePath));
			content = requireString(content, filename);
		}
		return content;
	}, files);
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
	options = Ru.defaults({
		max: 500,
		length: function (value) {
			return 1;
		}
	}, options || {});
	var cache = new Cache({
		max: options.max,
		length: options.length
	});
	var loadRemoteFile = co.wrap(function * (path) {
		var cachedFile = cache.get(path); // cached file item: path: {etag, lastmodified, contents}
		var headers = {};
		if (cachedFile) {
			headers = {
				'if-modified-since': cachedFile.lastModified,
				'if-none-match': cachedFile.eTag
			};
		}
		var body;
		try {
			var response = yield got(path, {headers: headers});
			body = response.body;
			cache.set(path, {
				eTag: response.headers.etag,
				lastModified: response.headers['last-modified'],
				contents: body
			});
		}
		catch (error) {
			// HTTPError thrown if statusCode !== 2xx
			if (error instanceof got.HTTPError) {
				if (error.statusCode === 304) body = cachedFile.contents;
				else throw error;
			}
			else throw error;
		}
		return body;
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
	var loadFiles = co.wrap(function * (paths) {
		var contents = [];
		paths.forEach(function (path) {
			contents.push(validator.isURL(path) ? loadRemoteFile(path) : fs.readFile(path, 'utf8'));
		});
		contents = yield contents;
		return R.zipObj(paths, contents);
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
	var load = co.wrap(function * (manifest, options) {
		// Set defaults
		manifest = is.object(manifest) ? manifest : {path: manifest};
		options = Ru.defaults({
			basePath: '',
			dirname: null
		}, options || {});

		var namePaths = R.pickBy(validator.isPath, manifest);
		namePaths = resolvePaths(namePaths, options.basePath);
		var paths = R.values(namePaths);
		var pathFiles = yield loadFiles(paths);
		pathFiles = loadModules(pathFiles, options);
		var nameFiles = R.mapObj(function (path) {
			return pathFiles[path];
		}, namePaths);

		manifest = R.merge(manifest, nameFiles);
		return (R.keys(manifest).length === 1) ? manifest.path : manifest;
	});

	return {
		load: load
	};
};

module.exports = {
	create: create
};
