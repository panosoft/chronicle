var _ = require('lodash');
var path = require('path');
var suspend = require('suspend');
var fileLoader = require('./modules/file-loader');

var Prince = require('./modules/prince');
var ReportLoader = require('./modules/report-loader');
var TemplateEngine = require('./modules/template-engine');

var create = function (options) {
	options = _.defaults(options || {}, {
		license: '',
		fileroot: ''
	});
	var initialized;
	var templateEngine;
	var htmlRenderer;
	var reportLoader;
	var initialize = suspend.promise(function * () {
		if (initialized) throw new Error('Already initialized');
		templateEngine = TemplateEngine.create();
		yield templateEngine.initialize();

		htmlRenderer = Prince.create({
			licenseFile: options.license, // TODO add to config
			fileroot: options.fileroot // TODO add to config
		});

		yield ReportLoader.initialize({
			fileLoader: fileLoader // default this in the loader?
			// data library
			// inject dependencies and other libraries that reports may use?
		});
		reportLoader = ReportLoader.create();

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