var Chronicle = require('chronicle');
var Prince = require('chronicle-prince');
var fs = require('fs');
var url = require('url');
var path = require('path');
var nock = require('nock');
var suspend = require('suspend');

suspend(function * () {
	try {
		var baseUrl = 'http://www.test.com';
		var reportPath = '/report/bundle.js';
		var filePath = path.resolve(__dirname, '../bundle.js');

		// Mock Network
		var bundle = nock(baseUrl)
			.get(reportPath)
			.replyWithFile(200, filePath);

		// Setup
		var chronicle = Chronicle.create({
			renderer: Prince.create()
		});
		yield chronicle.initialize();
		// Run report
		var reportUrl = url.resolve(baseUrl, reportPath);
		var parameters = {
			renderer: {},
			report: {}
		};
		console.time('Run');
		var pdf = yield chronicle.run(reportUrl, parameters);
		console.timeEnd('Run');
		// Cleanup
		chronicle.shutdown();

		// Capture output
		fs.writeFileSync(path.join(__dirname, './test.pdf'), pdf);
	}
	catch (error) {
		console.error('Error:\n', error);
		console.trace(error);
	}
})();
