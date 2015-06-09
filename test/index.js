var fs = require('fs');
var path = require('path');
var suspend = require('suspend');
var Chronicle = require('../');

suspend(function * () {
	try {
		// Setup
		var url = path.resolve('./remote/reports/sink/');
		var parameters = {};


		// Run report
		var chronicle = Chronicle.create({
			fileroot: path.join(__dirname, 'local'),
			license: path.join(__dirname, 'local/princeLicense.dat')
		});
		yield chronicle.initialize();
		console.time('Run');
		var pdf = yield chronicle.run(url, parameters);
		console.timeEnd('Run');
		chronicle.shutdown();


		// Capture output
		fs.writeFileSync(path.join(__dirname, './test.pdf'), pdf);
		console.log('Report generated');
	}
	catch (error) {
		console.trace(error);
	}
})();
