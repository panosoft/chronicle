var chronicle = require('@panosoft/chronicle');
var co = require('co');
var fs = require('fs');
var nock = require('nock');
var open = require('open');
var path = require('path');
var prince = require('prince-promise');
var url = require('url');

co(function * () {
	try {
		var baseUrl = 'http://www.test.com';
		var reportPath = '/report/bundle.js';
		var filePath = path.resolve(__dirname, '../bundle.js');

		var reportUrl = url.resolve(baseUrl, reportPath);
		var parameters = {
			renderer: {},
			report: {}
		};

		// Mock Network
		nock(baseUrl)
			.get(reportPath)
			.replyWithFile(200, filePath);

		// Run report
		var press = chronicle.Press.create();
		yield press.initialize();
		var html = yield press.run(reportUrl, parameters.report);
		press.shutdown();

		// Render HTML as PDF
		var pdf = yield prince(html, parameters.renderer);

		// Capture output
		fs.writeFileSync(path.join(__dirname, './test.html'), html);
		fs.writeFileSync(path.join(__dirname, './test.pdf'), pdf);

		open(path.join(__dirname, './test.pdf'));
	}
	catch (error) {
		console.trace(error.stack);
	}
});
