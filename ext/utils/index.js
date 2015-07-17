var fs = require('fs');
var url = require('url');
var path = require('path');
var Chronicle = require('chronicle');
var Prince = require('chronicle-prince');
var _ = require('lodash');
var nock = require('nock');
var suspend = require('suspend');

var definitionPath = path.resolve('../index.js');
var bundlePath = path.resolve('../bundle.js');
var pdfPath = './test.pdf';
var htmlPath = './test.html';
var apiPath = '/SQLInternal';
var splitUrl = function (reportUrl) {
	reportUrl = url.parse(reportUrl);
	var appPath = reportUrl.path.match(/(^\/[^\/]*\/)/)[1];
	var reportPath = reportUrl.path.match(/(^\/[^\/]*)(.*)/)[2];
	var appUrl = url.format({
		protocol: reportUrl.protocol,
		host: reportUrl.host,
		pathname: appPath
	});
	return {
		appUrl: appUrl,
		reportPath: reportPath
	}
};
var buildParameters = function (options) {
	var appUrl = splitUrl(options.url).appUrl;
	var parameters = _.defaults(options.parameters || {}, {
		report: {}
	});
	_.assign(parameters.report, {
		authToken: null,
		appUrl: appUrl
	});
	return parameters;
};
var mockNetwork = function (options) {
	var appUrl = splitUrl(options.url).appUrl;
	var reportPath = splitUrl(options.url).reportPath;
	var scope = nock(appUrl, {
			// Allow unmocked requests on this domain to pass through
			allowUnmocked: true
		})
		// Note: allowUnmocked option is only active if scope is active
		// => persist() must be called so that an unmocked requests can pass
		// through after scopes initial intercept
		.persist()
		.log(console.log)
		.get(reportPath)
		.replyWithFile(200, bundlePath);
	if (options.mockData) {
		scope.post(apiPath)
			.reply(200, options.resultSets);
	}
};
var testData = suspend.promise(function * (parameters) {
	var definition = require(definitionPath);
	var data = definition.data;
	console.time('Data');
	var results = (_.isFunction(data) ? yield data(parameters.report) : data);
	console.timeEnd('Data');
	return results;
});
var testReport = suspend.promise(function * (url, parameters) {
	var prince = Prince.create();
	var chronicle = Chronicle.create();
	yield chronicle.initialize();
	console.time('Report');
	var html = yield chronicle.run(url, parameters.report);
	var pdf = yield prince.render(html, parameters.renderer);
	console.timeEnd('Report');
	chronicle.shutdown();
	return {
		pdf: pdf,
		html: html
	};
});
/**
 *
 */
var test = suspend.promise(function * (options) {
	options = _.defaults(options || {}, {
		url: null,
		parameters: {},
		mockData: true,
		resultSets: []
	});
	var parameters = buildParameters(options);
	mockNetwork(options);
	try {
		var data = yield testData(parameters);
		var result = yield testReport(options.url, parameters);
		fs.writeFileSync(htmlPath, result.html);
		fs.writeFileSync(pdfPath, result.pdf);
	}
	catch (error) {
		console.error('Error:\n', error);
		console.trace(error);
	}
});

module.exports = {
	test: test
};