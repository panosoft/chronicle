var _ = require('lodash');
var FileLoader = require('./file-loader');
var Report = require('./report');
var suspend = require('suspend');
var TemplateEngine = require('./template-engine');

var create = function (options) {
	options = _.defaults(options || {}, {
		cacheMax: 500	// TODO add to config // max number of report definitions
					  // to cache // lru removed after that
	});

	var templateEngine = TemplateEngine.create();
	var fileLoader = FileLoader.create({
		max: options.cacheMax
	});

	var initialized;
	var initialize = suspend.promise(function * () {
		if (initialized) throw new Error('Already initialized');
		yield templateEngine.initialize();
		initialized = true;
	});
	var shutdown = function () {
		if (!initialized) throw new Error('Not initialized');
		templateEngine.shutdown();
	};
	/**
	 * Run a report from a path or definition
	 *
	 * @param {String | Object} definition
	 *    - fully qualified url
	 *    - absolute file path
	 *    - report definition
	 * @param {Object} [parameters]
	 */
	var run = suspend.promise(function * (definition, parameters) {
		if (!initialized) throw new Error('Not initialized');
		if (_.isString(definition)) definition = yield fileLoader.load(definition);
		if (_.isFunction(definition)) definition = yield definition(parameters);
		parameters = _.defaults(parameters || {});
		var report = Report.create(definition);
		var data = (_.isFunction(report.data) ? yield report.data(parameters) : report.data);
		return yield templateEngine.generate(report, data);
	});
	return {
		initialize: initialize,
		shutdown: shutdown,
		run: run
	};
};
module.exports = {
	create: create
};