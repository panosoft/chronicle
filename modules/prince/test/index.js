var fs = require('fs');
var path = require('path');
var suspend = require('suspend');
var prince = require('../index.js');

suspend(function * () {
	var pdf = yield prince('Good Afternoon, Alex.');
	fs.writeFileSync(path.join(__dirname, './test.pdf'), pdf);
	console.log('generated pdf');
})();