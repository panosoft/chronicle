var _ = require('lodash');
var path = require('path');
var suspend = require('suspend');
var fileLoader = require('./modules/file-loader');

var Prince = require('./modules/prince');
var ReportLoader = require('./modules/report-loader');
var TemplateEngine = require('./modules/template-engine');


var initialized;
var defaults;
// Module always loads sensible defaults
var initialize = suspend.promise(function * (options) {
	options = _.defaults(options || {}, {
		license: '',
		fileroot: ''
	});
	yield ReportLoader.initialize({
		fileLoader: fileLoader // default this in the loader?
		// data library
		// inject dependencies and other libraries that reports may use?
	});
	yield TemplateEngine.initialize();
	defaults = {
		htmlRenderer: Prince.create({
			licenseFile: options.license, // TODO add to config
			fileroot: options.fileroot // TODO add to config
		}),
		reportLoader: ReportLoader.create(),
		templateEngine: TemplateEngine.create()
	};
	initialized = true;
});
// Instances can override certain defaults
var create = function (config) {
	if (!initialized) throw new Error('Module not initialized.');
	config = config || {};
	var htmlRenderer = config.htmlRenderer || defaults.htmlRenderer;
	var reportLoader = config.reportLoader || defaults.reportLoader;
	var templateEngine = config.templateEngine || defaults.templateEngine;

	/**
	 * Run a remote report
	 *
	 * @param {String} location
	 *    file path | url
	 * @param {Object} parameters
	 */
	var run = suspend.promise(function * (location, parameters) {
		var report = yield reportLoader.load(location); // charts: {name:fn}
		var data = yield report.getData(parameters);
		var html = yield templateEngine.generate(report, data); // htmlGenerator (report -> html)
		return yield htmlRenderer.render(html); // pdfGenerator (html -> pdf)
	});
	return {
		run: run
	};
};
module.exports = {
	initialize: initialize,
	create: create
};