var co = require('co');
var FileLoader = require('./file-loader');
var is = require('is_js');
var isLocalPath = require('is-local-path');
var path = require('path');
var R = require('ramda');
var Ru = require('@panosoft/ramda-utils');
var TemplateEngine = require('./template-engine');

var validatePart = (part, partName, test, testName) => {
	if (part) {
		if (!is.object(part)) {
			throw new TypeError(`Report: Definition: ${partName} is not an Object.`);
		}
		var invalidParts = R.filter(key => key, R.map(key => test(part[key]) ? false : key, R.keys(part)));
		if (invalidParts.length) {
			throw new TypeError(`Report: Definition: The following ${partName} are not ${testName}: ${R.join(', ', invalidParts)}`);
		}
	}
};
/**
 * Validate report definition. Throws if invalid.
 *
 * @param {Object} definition
 * @param {String} definition.template
 *    Template source to compile and execute
 * @param {*|Function} [definition.context]
 * @param {Object.<String, Function>} [definition.charts]
 *    {name: function}
 * @param {Object.<String, Function>} [definition.helpers]
 *    {name: function}
 * @param {Object.<String, String>} [definition.partials]
 *    {name: partial}
 */
var validate = function (definition) {
	// template: String
	if (!is.string(definition.template)) {
		throw new TypeError('Report: Definition: template is not a String.');
	}
	// context [optional]: *
	// charts [optional]: {} AND {name: Function}
	validatePart(definition.charts, 'Charts', is.function, 'Functions');
	// helpers [optional]: {} AND {name: function}
	validatePart(definition.helpers, 'Helpers', is.function, 'Functions');
	// partials [optional]: {} AND {name: source}
	validatePart(definition.partials, 'Partials', is.string, 'Strings');
};
/**
 * Creates a Press instance.
 *
 * @param {Object} options
 * @param {Number} options.cacheMax
 * 	Maximum number of report bundles to cache. Once the limit is reached, the
 * 	least recently used is removed as each new request is completed.
 *
 * @returns {{initialize: Function, run: Function, shutdown: Function}}
 */
var create = function (options) {
	options = Ru.defaults({
		cacheMax: 500
	}, options || {});

	var templateEngine = TemplateEngine.create();
	var fileLoader = FileLoader.create({
		max: options.cacheMax
	});

	var initialized;
	var initialize = co.wrap(function * () {
		if (initialized) throw new Error('Already initialized');
		yield templateEngine.initialize();
		initialized = true;
	});
	var shutdown = function () {
		if (!initialized) throw new Error('Not initialized');
		templateEngine.shutdown();
		initialized = false;
	};
	var loadDefinition = co.wrap(function * (report, parameters) {
		var definition;
		if (is.string(report)) {
			// handle case where report is a non-prefixed relative path
			// (i.e. `index.js` vs `./index.js`) by resolving it to an absolute
			// path since fileLoader does not handle non-prefixed relative
			// paths
			if (isLocalPath(report)) report = path.resolve(report);
			definition = yield fileLoader.load(report);
		}
		else {
			definition = report;
		}
		if (is.function(definition)) definition = yield definition(parameters);
		validate(definition);
		return definition;
	});
	var loadContext = co.wrap(function * (definition, parameters) {
		var context = definition.context;
		if(is.function(context)) context = yield context(parameters);
		return context;
	});
	/**
	 * Run a report from a path or definition
	 *
	 * @param {String | Object} report
	 *    - fully qualified url to bundled module
	 *    - file path to module
	 *    - report definition
	 * @param {Object} [parameters]
	 */
	var run = co.wrap(function * (report, parameters) {
		if (!initialized) throw new Error('Not initialized');
		if (!report) throw new TypeError('report must be defined');
		parameters = parameters || {};
		var definition = yield loadDefinition(report, parameters);
		var context = yield loadContext(definition, parameters);
		return yield templateEngine.generate(definition, context);
	});
	return {
		initialize,
		run,
		shutdown
	};
};
module.exports = {
	create
};
