var fs = require('fs');
var path = require('path');
var suspend = require('suspend');
var Chronicle = require('../lib');

suspend(function * () {
	try {
		// use nock to serve up remote files


		// Setup
		var url = path.resolve('./assets/reports/sink/bundle.js');
		var parameters = {};


		// Run report
		var chronicle = Chronicle.create({
			fileroot: path.join(__dirname, 'assets'),
			license: path.join(__dirname, 'assets/princeLicense.dat'),
			helpers: require('./assets/helpers'),
			partials: require('./assets/partials')
		});
		yield chronicle.initialize();
		console.time('Run');
		var pdf = yield chronicle.run(url, parameters); // TODO (path | url | def, param)
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
