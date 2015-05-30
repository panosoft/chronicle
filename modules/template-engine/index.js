var _ = require('lodash');
var suspend = require('suspend');
var Handlebars = require('handlebars');
var ChartEngine = require('../chart-engine');
var less = require('less');
var cheerio = require('cheerio');

var initialized;
var chartEngine;
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
var generateChartPartials = suspend.promise(function * (charts, data) {
	var partials = {};
	for (var name in charts) {
		var definition = charts[name](data);
		partials['charts.' + name] = yield chartEngine.generate(definition);
	}
	return partials;
});
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
var generate = suspend.promise(function * (report, data) {
	var chartPartials = yield generateChartPartials(report.charts, data);
	var partials = _.assign({}, report.partials, chartPartials);
	var environment = createEnvironment({
		helpers: report.helpers,
		partials: partials
	});
	var template = environment.compile(report.template);
	var html = template(data);
	html = renderInlineLess(html);
	return html;
});
var initialize = suspend.promise(function * () {
	chartEngine = yield ChartEngine.create();
	initialized = true;
});
var create = function () {
	if (!initialized) throw new Error('Module not initialized.');
	return {
		generate: generate
	}
};
module.exports = {
	initialize: initialize,
    create: create
};
