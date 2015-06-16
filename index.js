var _ = require('lodash');
var path = require('path');
var suspend = require('suspend');
var FileLoader = require('./modules/file-loader');

var Prince = require('./modules/prince');
var ReportLoader = require('./modules/report-loader');
var TemplateEngine = require('./modules/template-engine');

var create = function (options) {
	options = _.defaults(options || {}, {
		license: '',  // TODO add to config
		fileroot: '', // TODO add to config
		max: 500 // TODO add to config // maximum number of remote report definitions to cache // lru removed after that
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
			licenseFile: options.license,
			fileroot: options.fileroot
		});

		var fileLoader = FileLoader.create({
			max: options.max
		});
		yield ReportLoader.initialize({
			fileLoader: fileLoader // default this in the loader?
			// data library // maybe broswerify instead of passed in here
			// inject dependencies and other libraries that reports may use? // maybe broswerify instead of passed in here
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