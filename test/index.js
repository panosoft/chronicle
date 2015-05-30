var fs = require('fs');
var path = require('path');
var suspend = require('suspend');
var ReportRunner = require('../');

suspend(function * () {
	try {
		// Setup
		var url = path.resolve('./remote/reports/sink/');
		var parameters = {};


		// Run report
		yield ReportRunner.initialize({
			fileroot: path.join(__dirname, 'local'),
			license: path.join(__dirname, 'local/princeLicense.dat')
		});
		var reportRunner = ReportRunner.create();
		console.time('Run');
		var pdf = yield reportRunner.run(url, parameters);
		console.timeEnd('Run');


		// Capture output
		fs.writeFileSync(path.join(__dirname, './test.pdf'), pdf);
		console.log('Report generated');
	}
	catch (error) {
		console.trace(error);
	}
})();
