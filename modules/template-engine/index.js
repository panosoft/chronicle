var _ = require('lodash');
var suspend = require('suspend');
var Handlebars = require('handlebars');
var ChartEngine = require('../chart-engine');
var less = require('less');
var cheerio = require('cheerio');

var createEnvironment = function (config) {
    var environment = Handlebars.create();
    _.forEach(config.partials, function (partial, name) {
        environment.registerPartial(name, partial);
    });
    _.forEach(config.helpers, function (helper, name) {
        environment.registerHelper(name, helper);
    });
    return environment;
};
var renderInlineLess = suspend.promise(function * (html) {
	var output;
	var $ = cheerio.load(html);
	var styles = $('style');
	for (var i = 0; i < styles.length; i++) {
		var style = styles.eq(i);
		var css = style.text();
		css = (yield less.render(css)).css;
		style.text(css);
	}
	output = $.html();
	return output;
});
var create = function (config) {
	config = _.defaults(config || {}, {
		helpers: {},
		partials: {}
	});
	var environment = createEnvironment(config);
	var chartEngine = ChartEngine.create();
	var initialized;
	var initialize = suspend.promise(function * () {
		if (initialized) throw new Error('Already initialized');
		yield chartEngine.initialize();
		initialized = true;
	});
	var shutdown = function () {
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
		var chartPartials = yield generateChartPartials(report.charts, data);
		var template = environment.compile(report.template);
		var options = {
			helpers: report.helpers,
			partials: _.assign({}, report.partials, chartPartials)
		};
		var html = template(data, options);
		html = renderInlineLess(html);
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
