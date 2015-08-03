var _ = require('lodash');
var suspend = require('suspend');
var Handlebars = require('handlebars');
var ChartEngine = require('../chart-engine');
var cheerio = require('cheerio');

var create = function () {
	var chartEngine = ChartEngine.create();
	var initialized;
	var initialize = suspend.promise(function * () {
		if (initialized) throw new Error('Already initialized');
		yield chartEngine.initialize();
		initialized = true;
	});
	var shutdown = function () {
		if (!initialized) throw new Error('Not initialized');
		chartEngine.shutdown();
	};
	var generateChartPartials = suspend.promise(function * (charts, data) {
		var partials = {};
		for (var name in charts) {
			var definition = charts[name](data);
			partials['charts.' + name] = yield chartEngine.generate(definition);
		}
		return partials;
	});
	var generate = suspend.promise(function * (report, data) {
		if (!initialized) throw new Error('Not initialized');
		// Pre-process
		var chartPartials = yield generateChartPartials(report.charts, data);
		// Process
		var template = Handlebars.compile(report.template);
		var options = {
			helpers: report.helpers,
			partials: _.assign({}, report.partials, chartPartials)
		};
		var html = template(data, options);
		// Post-process
		return html;
	});
	return {
		initialize: initialize,
		shutdown: shutdown,
		generate: generate
	}
};
module.exports = {
    create: create
};
