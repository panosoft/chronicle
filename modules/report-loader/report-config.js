var _ = require('lodash');
var validator = require('../validator');

var defaults = {
	charts: {},
	helpers: {},
	partials: {},
	template: ''
};
var normalize = function (config) {
	_.defaults(config, defaults);
	_.defaults(config.helpers, defaults.charts);
	_.defaults(config.helpers, defaults.helpers);
	_.defaults(config.partials, defaults.partials, {
		main: './main.html'
	});
};
var validate = function (config) {
	// getData: function
	if (!_.isFunction(config.getData)) {
		throw new TypeError('ReportConfig: getData is not a Function.');
	}

	// charts: {} AND {name: Function || Path}
	if (!_.isPlainObject(config.charts)) {
		throw new TypeError('ReportConfig: charts is not an Object.');
	}
	var allChartsValid = _.every(config.charts, function (chart) {
		return (validator.isPath(chart) || _.isFunction(chart));
	});
	if (!allChartsValid) {
		throw new TypeError('ReportConfig: chart is not a Function or Path.');
	}

	// helpers: {} AND {name: function || path}
	if (!_.isPlainObject(config.helpers)) {
		throw new TypeError('ReportConfig: helpers is not an Object.');
	}
	var allHelpersValid = _.every(config.helpers, function (helper) {
		return (validator.isPath(helper) || _.isFunction(helper));
	});
	if (!allHelpersValid) {
		throw new TypeError('ReportConfig: helper is not a Function or Path.');
	}

	// partials: {} AND {name: source || path}
	if (!_.isPlainObject(config.partials)) {
		throw new TypeError('ReportConfig: partials is not an Object.');
	}
	var allPartialsValid = _.every(config.partials, function (partial) {
		return (validator.isPath(partial) || _.isString(partial));
	});
	if (!allPartialsValid) {
		throw new TypeError('ReportConfig: partial is not a Partial Source or Path.');
	}

	// template: String
	if(!_.isString(config.template)) {
		throw new TypeError('ReportConfig: template is not a String.');
	}
};
var create = function (definition) {
	var config = _.clone(definition);
	normalize(config);
	validate(config);
	return config;
};

module.exports = {
	create: create,
	set defaults (value) {
		if (!_.isPlainObject(value)) throw new TypeError('defaults is not an Object.');
		value = _.clone(value); // Decouples value and internal defaults object // offers some but not complete protection
		defaults = _.defaults(value, {
			charts: {},
			helpers: {},
			partials: {},
			template: ''
		});
	}
};