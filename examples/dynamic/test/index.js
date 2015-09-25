var co = require('co');
var chronicle = require('@panosoft/chronicle');
var fs = require('fs');
var path = require('path');
var prince = require('prince-promise');

var report = require('../lib');
var parameters = { sort: 'stars' };

co(function * () {
	try {

		var press = chronicle.Press.create();
		yield press.initialize();

		// Run and render report
		var html = yield press.run(report, parameters);
		var pdf = yield prince(html);

		// Save output
		fs.writeFileSync(path.resolve(__dirname,'./test.html'), html);
		fs.writeFileSync(path.resolve(__dirname,'./test.pdf'), pdf);

	}
	catch (error) {
		console.error(error.stack);
	}
	finally {
		press.shutdown();
	}
});
