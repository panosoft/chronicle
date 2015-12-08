const co = require('co');
const loader = require('./loader');
const is = require('is_js');

/**
 * Run a report from a path or function
 *
 * @param {String | Function} report
 *    - fully qualified url to bundled module
 *    - file path to module (absolute or relative)
 *    - report function (ordinary or yieldable)
 * @param {*} [parameters = {}]
 */
const run = co.wrap(function * (report, parameters) {
	if (!report) throw new TypeError('report: must be defined');
	parameters = parameters || {};
	if (is.string(report)) report = yield loader.load(report);
	if(!is.function(report)) throw new TypeError('report: must be a Function');
	return report(parameters);
});
module.exports = run;
