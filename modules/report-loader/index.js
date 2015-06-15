var _ = require('lodash');
var path = require('path');
var suspend = require('suspend');
var ReportConfig = require('./report-config');
var Report = require('./report');

// Configs
var helpersPath = path.join(__dirname, './helpers');
var partialsPath = path.join(__dirname, './partials'); // TODO use resolve
var templatePath = path.join(__dirname, './template.html');
var reportMainPath = './index.js'; // TODO consider // default value can be overridden by reports `package.json:main`
								   // property // would have to check for a package.json first, load main specified if
								   // found, otherwise look for index.js

var fileLoader;
var helpers;
var partials;
var template;
var initialized;
/**
 *
 * @param config
 * @param config.fileLoader
 */
var initialize = suspend.promise(function * (config) {
	fileLoader = config.fileLoader;

	// Load resources (load defaults once on init)
	helpers = require(helpersPath); // {name: function | path}
	partials = require(partialsPath); // {name: partial | path}
	yield fileLoader.load(helpers, {basePath: helpersPath}); // {name: function}
	yield fileLoader.load(partials, {basePath: partialsPath}); // {name: partial}
	template = yield fileLoader.load(templatePath);

	// Set defaults
	ReportConfig.defaults = {
		helpers: helpers,
		partials: partials,
		template: template
	};

	initialized = true;
});
var create = function () {
	if (!initialized) throw new Error('Module not initialized');
	var load = suspend.promise(function * (reportUrl) {
		var definition = yield fileLoader.load(reportMainPath, {basePath: reportUrl, dirname: __dirname});
		var config = ReportConfig.create(definition);
		// Deep load report object ... // TODO consider generalizing to automatically handle deep loading
		yield fileLoader.load(config.charts, {basePath: reportUrl, dirname: __dirname});
		yield fileLoader.load(config.helpers, {basePath: reportUrl, dirname: __dirname});
		yield fileLoader.load(config.partials, {basePath: reportUrl, dirname: __dirname});
		config.template = yield fileLoader.load(config.template, {basePath: reportUrl, dirname: __dirname});
		return Report.create(config);
	});
	return {
		load: load
	};
};
module.exports = {
	initialize: initialize,
	create: create,
	get helpers () {
		return _.clone(helpers);
	},
	get partials () {
		return _.clone(partials);
	}
};