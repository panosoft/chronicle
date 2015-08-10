var R = require('ramda');
var is = require('is_js');
var isPlainObject = require('is-plain-object');

var validateDefinitionPart = (part, partName, test, testName) => {
	if (part) {
		if (!isPlainObject(part))
			throw new TypeError(`Report: Definition: ${partName} is not an Object.`);
		var invalidParts = R.filter(k => k, R.map(k => test(part[k]) ? false : k, R.keys(part)));
		if (invalidParts.length)
			throw new TypeError(`Report: Definition: The following ${partName} are not ${testName}: ${R.join(', ', invalidParts)}`);
	}
};
var validate = function (definition) {
	// template: String
	if (!is.string(definition.template)) {
		throw new TypeError('Report: Definition: template is not a String.');
	}

	// data [optional]: *

	// charts [optional]: {} AND {name: Function}
	validateDefinitionPart(definition.charts, 'Charts', is.function, 'Functions');

	// helpers [optional]: {} AND {name: function}
	validateDefinitionPart(definition.helpers, 'Helpers', is.function, 'Functions');

	// partials [optional]: {} AND {name: source}
	validateDefinitionPart(definition.partials, 'Partials', is.string, 'Strings');
};
/**
 * Create report
 *
 * @param {Object} definition
 * @param {String} definition.template
 *    Template source to compile and execute
 * @param {*|Function} [definition.data]
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
	var report = R.clone(definition);
	return report;
};

module.exports = {
	create: create
};
