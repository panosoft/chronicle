const co = require('co');
const fs = require('mz/fs');
const got = require('got');
const is = require('is_js');
const path = require('path');
const R = require('ramda');
const requireString = require('@panosoft/require-string');
const url = require('url');

const isUrl = path => !!url.parse(path).hostname;
const resolvePath = filePath => isUrl(filePath) ?
	filePath:
	path.resolve(filePath);
const loadUrl = url => got(url).then(R.prop('body'));
const loadFile = path => isUrl(path) ?
	loadUrl(path):
	fs.readFile(path, 'utf8');
const loadModule = (content, resolvedPath) => {
	const filename = isUrl(resolvedPath) ? path.resolve(path.basename(resolvedPath)) : resolvedPath;
	return requireString(content, filename);
};
/**
 * Loads a js module from a local or remote path.
 *
 * @param {String} path
 *    - fully qualified uri (i.e. http://test.com/file.txt)
 *    - absolute path (i.e. /path/to/module.js)
 *    - relative path (i.e. starting with ./ or ../ or path/)
 * @returns {*} module exports
 */
const load = co.wrap(function * (path) {
	if (!is.string(path)) throw new TypeError('path: must be a string.');
	const resolvedPath = resolvePath(path);
	const contents = yield loadFile(resolvedPath);
	return loadModule(contents, resolvedPath);
});

module.exports = { load };
