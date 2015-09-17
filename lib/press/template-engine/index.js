var ChartEngine = require('../chart-engine');
var cheerio = require('cheerio');
var co = require('co');
var Handlebars = require('handlebars');
var R = require('ramda');

var create = function () {
	var chartEngine = ChartEngine.create();
	var initialized;
	var initialize = co.wrap(function * () {
		if (initialized) throw new Error('Already initialized');
		yield chartEngine.initialize();
		initialized = true;
	});
	var shutdown = function () {
		if (!initialized) throw new Error('Not initialized');
		chartEngine.shutdown();
	};
	var generateChartPartials = co.wrap(function * (charts, data) {
		var partials = {};
		for (var name in charts) {
			var definition = charts[name](data);
			partials['charts.' + name] = yield chartEngine.generate(definition);
		}
		return partials;
	});
	var generate = co.wrap(function * (report, data) {
		if (!initialized) throw new Error('Not initialized');
		// Pre-process
		var chartPartials = yield generateChartPartials(report.charts, data);
		// Process
		var template = Handlebars.compile(report.template);
		var options = {
			helpers: report.helpers,
			partials: R.merge(report.partials, chartPartials)
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
