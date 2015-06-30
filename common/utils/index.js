var _ = require('lodash');
var Prince = require('../../lib/prince');
var Chronicle = require('../../lib');
var fs = require('fs');
var url = require('url');
var path = require('path');
var nock = require('nock');
var suspend = require('suspend');

var testReport = suspend.promise(function * (options) {
	options = _.defaults(options || {}, {
		url: null,
		parameters: {},
		mock: true,
		resultSets: []
	});
	var bundlePath = '../bundle.js';
	var apiPath = '/SQLInternal';
	var pdfPath = './test.pdf';

	// Parse url
	var reportUrl = url.parse(options.url);
	var appPath = reportUrl.path.match(/(^\/[^\/]*\/)/)[1];
	var reportPath = reportUrl.path.match(/(^\/[^\/]*)(.*)/)[2];
	var appUrl = url.format({
		protocol: reportUrl.protocol,
		host: reportUrl.host,
		pathname: appPath
	});

	var parameters = _.defaults(options.parameters || {}, {
		report: {}
	});
	_.assign(parameters.report, {
		authToken: null,
		appUrl: appUrl
	});

	// Initialize mock environment
	if (options.mock) {
		var bundle = nock(appUrl)
			.get(reportPath)
			.replyWithFile(200, bundlePath);
		var api = nock(appUrl)
			.post(apiPath)
			.reply(200, {resultSets: options.resultSets});
	}

	// Start
	var renderer = Prince.create();
	var chronicle = Chronicle.create({
		renderer: renderer
	});
	yield chronicle.initialize();

	// Run
	try {
		console.time('Run');
		var pdf = yield chronicle.run(url.format(reportUrl), parameters);
		console.timeEnd('Run');
		if (options.mock) {
			bundle.done();
			api.done();
		}
		fs.writeFileSync(pdfPath, pdf);
	}
	catch (error) {
		console.error('Error:\n', error);
		console.trace(error);
	}

	// Stop
	chronicle.shutdown();
});

module.exports = {
	testReport: testReport
};