var Chronicle = require('../../../../lib');
var co = require('co');
var fs = require('fs');
var nock = require('nock');
var path = require('path');
var Prince = require('prince-promise');
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
		var bundle = nock(baseUrl)
			.get(reportPath)
			.replyWithFile(200, filePath);

		// Run report
		var chronicle = Chronicle.create();
		yield chronicle.initialize();
		var html = yield chronicle.run(reportUrl, parameters.report);
		chronicle.shutdown();

		// Render PDF
		var prince = Prince.create();
		var pdf = yield prince.render(html, parameters.renderer);

		// Capture output
		fs.writeFileSync(path.join(__dirname, './test.html'), html);
		fs.writeFileSync(path.join(__dirname, './test.pdf'), pdf);
	}
	catch (error) {
		console.error('Error:\n', error);
		console.trace(error);
	}
});
