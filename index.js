var _ = require('lodash');
var path = require('path');
var suspend = require('suspend');
var FileLoader = require('./modules/file-loader');

var Prince = require('./modules/prince');
var ReportLoader = require('./modules/report-loader');
var TemplateEngine = require('./modules/template-engine');

var create = function (options) {
	options = _.defaults(options || {}, {
		license: '',	// TODO add to config
		fileroot: '',	// TODO add to config
		max: 500,		// TODO add to config // max number of report definitions to cache // lru removed after that
		helpers: {},
		partials: {},
		template: null
		// ?renderers (like charts?)
	});

	// Combine/override builtin default helpers/partials with those passed in
	var helpers = require('./modules/helpers');
	var partials = require('./modules/partials');
	_.assign(helpers, options.helpers);
	_.assign(partials, options.partials);
	var templateEngine = TemplateEngine.create({
		helpers: helpers,
		partials: partials
	});

	var htmlRenderer = Prince.create({
		licenseFile: options.license,
		fileroot: options.fileroot
	});

	var fileLoader = FileLoader.create({
		max: options.max
	});
	var reportLoader = ReportLoader.create({
		fileLoader: fileLoader // default this in the loader? // TODO remove after refactoring into TE
	});

	var initialized;
	var initialize = suspend.promise(function * () {
		if (initialized) throw new Error('Already initialized');
		yield templateEngine.initialize();
		initialized = true;
	});
	var shutdown = function () {
		templateEngine.shutdown();
	};
	/**
	 * Run a remote report
	 *
	 * @param {String} location
	 *    file path | url
	 * @param {Object} parameters
	 */
	var run = suspend.promise(function * (location, parameters) {
		if (!initialized) throw new Error('Not initialized');
		var report = yield reportLoader.load(location); // charts: {name:fn}
		var data = yield report.getData(parameters);
		var html = yield templateEngine.generate(report, data); // htmlGenerator (report -> html)
		return yield htmlRenderer.render(html); // pdfGenerator (html -> pdf)
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