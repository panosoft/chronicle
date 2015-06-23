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
	var load = suspend.promise(function * (definition) {

		// TODO consider // simplify and don't use fileLoader?
		// just need to request file, cache file, and requireString()
		if (_.isString(definition)) {
			definition = yield fileLoader.load(definition);
		}
		return Report.create(definition);
	});
	return {
		load: load
	};
};
module.exports = {
	create: create
};