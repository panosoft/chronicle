var _ = require('lodash');

var validate = function (definition) {
	// template: String
	if (!_.isString(definition.template)) {
		throw new TypeError('Report: Definition: template is not a String.');
	}

	// getData [optional]: function
	if (definition.getData) {
		if (!_.isFunction(definition.getData)) {
			throw new TypeError('Report: Definition: getData is not a Function.');
		}
	}

	// charts [optional]: {} AND {name: Function}
	if (definition.charts) {
		if (!_.isPlainObject(definition.charts)) {
			throw new TypeError('Report: Definition: charts is not an Object.');
		}
		var allChartsValid = _.every(definition.charts, function (chart) {
			return (_.isFunction(chart));
		});
		if (!allChartsValid) {
			throw new TypeError('Report: Definition: chart is not a Function.');
		}
	}

	// helpers [optional]: {} AND {name: function}
	if (definition.helpers) {
		if (!_.isPlainObject(definition.helpers)) {
			throw new TypeError('Report: Definition: helpers is not an object.');
		}
		var allHelpersValid = _.every(definition.helpers, function (helper) {
			return (_.isFunction(helper));
		});
		if (!allHelpersValid) {
			throw new TypeError('Report: Definition: helper is not a Function');
		}
	}

	// partials [optional]: {} AND {name: source}
	if (definition.partials) {
		if (!_.isPlainObject(definition.partials)) {
			throw new TypeError('Report: Definition: partials is not an Object.');
		}
		var allPartialsValid = _.every(definition.partials, function (partial) {
			return (_.isString(partial));
		});
		if (!allPartialsValid) {
			throw new TypeError('Report: Definition: partial is not a Partial Source');
		}
	}
};
/**
 * Create report
 *
 * @param {Object} definition
 * @param {String} definition.template
 *    Template source to compile and execute
 * @param {Function} [definition.getData]
 * @param {Object.<String, Function>} [definition.charts]
 *    {name: function}
 * @param {Object.<String, Function>} [definition.helpers]
 *    {name: function}
 * @param {Object.<String, String>} [definition.partials]
 *    {name: partial}
 *
 * @returns {Object} report
 */
var create = function (definition) {
	validate(definition);
	var report = _.clone(definition);
	return report;
};

module.exports = {
	create: create
};
