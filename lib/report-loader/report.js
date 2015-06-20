var _ = require('lodash');

var validate = function (report) {
	// getData: function
	if (!_.isFunction(report.getData)) {
		throw new TypeError('ReportConfig: getData is not a Function.');
	}

	// charts: {} AND {name: Function}
	if (!_.isPlainObject(report.charts)) {
		throw new TypeError('ReportConfig: charts is not an Object.');
	}
	var allChartsValid = _.every(report.charts, function (chart) {
		return (_.isFunction(chart));
	});
	if (!allChartsValid) {
		throw new TypeError('ReportConfig: chart is not a Function.');
	}

	// helpers: {} AND {name: function}
	if (!_.isPlainObject(report.helpers)) {
		throw new TypeError('ReportConfig: helpers is not an object.');
	}
	var allHelpersValid = _.every(report.helpers, function (helper) {
		return (_.isFunction(helper));
	});
	if (!allHelpersValid) {
		throw new TypeError('ReportConfig: helper is not a Function');
	}

	// partials: {} AND {name: source}
	if (!_.isPlainObject(report.partials)) {
		throw new TypeError('ReportConfig: partials is not an Object.');
	}
	var allPartialsValid = _.every(report.partials, function (partial) {
		return (_.isString(partial));
	});
	if (!allPartialsValid) {
		throw new TypeError('ReportConfig: partial is not a Partial Source');
	}

	// template: String
	if (!_.isString(report.template)) {
		throw new TypeError('ReportConfig: template is not a String.');
	}
};
/**
 * Create report
 *
 * @param {Object} config
 * @param {Function} config.getData
 * @param {Object.<String, Function>} config.charts
 *    {name: function}
 * @param {Object.<String, Function>} config.helpers
 *    {name: function}
 * @param {Object.<String, String>} config.partials
 *    {name: partial}
 *
 * @returns {Object} report
 */
var create = function (config) {
	var report = _.clone(config);
	validate(report);
	return report;
};

module.exports = {
	create: create
};
