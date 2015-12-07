const Cache = require('lru-cache');
const co = require('co');
const fs = require('mz/fs');
const got = require('got');
const is = require('is_js');
const path = require('path');
const R = require('ramda');
const Ru = require('@panosoft/ramda-utils');
const requireString = require('@panosoft/require-string');
const url = require('url');
const validator = require('../validator');

// TODO consider // throttle how many files are loaded at once
// fs reads relative paths relative to process.cwd()
// require reads relative paths relative to the module __dirname

const isJs = filePath => path.extname(filePath) === '.js';
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
const resolvePath = R.curry((basePath, filePath) => validator.isRelativePath(filePath) ?
	(validator.isURL(basePath) ? url : path).resolve(basePath, filePath):
	filePath
);
const resolvePaths = R.curry((basePath, paths) => R.mapObj(resolvePath(basePath), paths));
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
const loadModules = (files, options) => R.mapObjIndexed((content, filePath) => {
	if (isJs(filePath)) {
		var dirname = options.dirname || (validator.isURL(filePath) ? path.resolve() : path.dirname(filePath));
		var filename = path.join(dirname, path.basename(filePath));
		content = requireString(content, filename);
	}
	return content;
}, files);

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
var create = options => {
	options = Ru.defaults({
		max: 500,
		length: () => 1
	}, options || {});
	var cache = new Cache(options);
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
			var response = yield got(path, { headers });
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
	const loadFiles = co.wrap(function * (paths) {
		const loadPath = path => validator.isURL(path) ? loadRemoteFile(path) : fs.readFile(path, 'utf8');
		const contents = yield R.map(loadPath, paths);
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
	const load = co.wrap(function * (manifest, options) {
		// Set defaults
		manifest = is.object(manifest) ? manifest : {path: manifest};
		options = Ru.defaults({
			basePath: '',
			dirname: null
		}, options || {});

		const namePaths = R.pipe(
			R.pickBy(validator.isPath),
			resolvePaths(options.basePath)
		)(manifest);
		const paths = R.values(namePaths);
		var pathFiles = yield loadFiles(paths);
		pathFiles = loadModules(pathFiles, options);
		const nameFiles = R.mapObj(path => pathFiles[path], namePaths);

		manifest = R.merge(manifest, nameFiles);
		return (R.keys(manifest).length === 1) ? manifest.path : manifest;
	});

	return { load };
};

module.exports = { create };
