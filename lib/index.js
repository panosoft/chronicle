var _ = require('lodash');
var suspend = require('suspend');
var FileLoader = require('./file-loader');
var ReportLoader = require('./report-loader');
var TemplateEngine = require('./template-engine');

var create = function (options) {
	options = _.defaults(options || {}, {
		license: '',	// TODO add to config
		fileroot: '',	// TODO add to config
		cacheMax: 500,	// TODO add to config // max number of report definitions to cache // lru removed after that
		helpers: {},
		partials: {},
		template: null,
		renderer: null
	});

	var renderer = options.renderer;
	var helpers = require('./helpers');
	var partials = require('./partials');
	_.assign(helpers, options.helpers);
	_.assign(partials, options.partials);
	var templateEngine = TemplateEngine.create({
		helpers: helpers,
		partials: partials
	});
	var fileLoader = FileLoader.create({
		max: options.cacheMax
	});
	var reportLoader = ReportLoader.create({
		fileLoader: fileLoader
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
	 */
	var run = suspend.promise(function * (definition, parameters) {
		if (!initialized) throw new Error('Not initialized');
		parameters = _.defaults(parameters || {}, {
			renderer: {}
		});
		var report = yield reportLoader.load(definition);
		var data = yield report.getData(parameters);
		var html = yield templateEngine.generate(report, data); // htmlGenerator (report -> html)
		return yield renderer.render(html, parameters.renderer); // pdfGenerator (html -> pdf)
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