var fs = require('fs');
var path = require('path');
var suspend = require('suspend');
var Prince = require('../');

suspend(function * () {
	try {
		var prince = Prince.create();
		var pdf = yield prince.render('Good Afternoon, Alex.');
		fs.writeFileSync(path.join(__dirname, './test.pdf'), pdf);
		console.log('generated pdf');
	}
	catch (error) {
		console.error(error);
	}
})();