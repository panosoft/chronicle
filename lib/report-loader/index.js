var _ = require('lodash');
var path = require('path');
var suspend = require('suspend');
var Report = require('./report');

/**
 * Create Report Loader
 *
 * @param config
 * @param config.fileLoader
 *
 * @returns reportLoader
 */
var create = function (config) {
	var fileLoader = config.fileLoader;
	var load = suspend.promise(function * (reportUrl) {

		// TODO consider // simplify and don't use fileLoader?
		// just need to request file, cache file, and requireString()
		var definition = yield fileLoader.load(reportUrl, {dirname: __dirname});
		return Report.create(definition);
	});
	return {
		load: load
	};
};
module.exports = {
	create: create
};