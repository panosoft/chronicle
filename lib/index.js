var _ = require('lodash');
var suspend = require('suspend');
var FileLoader = require('./file-loader');
var Report = require('./report');
var TemplateEngine = require('./template-engine');

var create = function (options) {
	options = _.defaults(options || {}, {
		license: '',	// TODO add to config
		fileroot: '',	// TODO add to config
		cacheMax: 500,	// TODO add to config // max number of report definitions to cache // lru removed after that
		renderer: null
	});

	var renderer = options.renderer;
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
	 *    - absolute file path
	 *    - fully qualified url
	 *    - report definition
	 * @param {Object} [parameters]
	 * @param {Object} [parameters.renderer]
	 * @param {Object} [parameters.report]
	 */
	var run = suspend.promise(function * (definition, parameters) {
		if (!initialized) throw new Error('Not initialized');
		definition = (_.isString(definition) ? yield fileLoader.load(definition) : definition);
		parameters = _.defaults(parameters || {}, {
			renderer: {},
			report:{}
		});
		var report = Report.create(definition);
		var data = (_.isFunction(report.data) ? yield report.data(parameters.report) : report.data);
		var html = yield templateEngine.generate(report, data);
		return yield renderer.render(html, parameters.renderer);
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