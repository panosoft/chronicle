var co = require('co');
var FileLoader = require('./file-loader');
var is = require('is_js');
var isLocalPath = require('is-local-path');
var path = require('path');
var R = require('ramda');
var Ru = require('@panosoft/ramda-utils');

var validate = (report) => {
	if(!is.function(report)) throw new TypeError('report is not a Function');
};
/**
 * Creates a Press instance.
 *
 * @param {Object} options
 * @param {Number} options.cacheMax
 * 	Maximum number of report bundles to cache. Once the limit is reached, the
 * 	least recently used is removed as each new request is completed.
 *
 * @returns {{ run: Function }}
 */
var create = function (options) {
	options = Ru.defaults({ cacheMax: 500 }, options || {});

	var fileLoader = FileLoader.create({
		max: options.cacheMax
	});

	var load = co.wrap(function * (report) {
		if (is.string(report)) {
			// handle case where report is a non-prefixed relative path
			// (i.e. `index.js` vs `./index.js`) by resolving it to an absolute
			// path since fileLoader does not handle non-prefixed relative
			// paths
			if (isLocalPath(report)) report = path.resolve(report);
			report = yield fileLoader.load(report);
		}
		validate(report);
		return report;
	});
	/**
	 * Run a report from a path or function
	 *
	 * @param {String | Function} report
	 *    - fully qualified url to bundled module
	 *    - file path to module
	 *    - report function
	 *    		ordinary and yieldable functions supported
	 * @param {*} [parameters = {}]
	 */
	var run = co.wrap(function * (report, parameters) {
		if (!report) throw new TypeError('report must be defined');
		parameters = parameters || {};
		report = yield load(report);
		return report(parameters);
	});
	return { run };
};
module.exports = { create };
