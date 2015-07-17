var report = require('../');
var Chronicle = require('chronicle');
var Prince = require('chronicle-prince');
var fs = require('fs');

var prince = Prince.create();
var chronicle = Chronicle.create();
chronicle.initialize()
	.then(function () {
		return chronicle.run(report);
	})
	.then(function (html) {
		fs.writeFileSync('./test.html', html);
		chronicle.shutdown();
		return prince.render(html);
	})
	.then(function (pdf) {
		fs.writeFileSync('./test.pdf', pdf);
	})
	.catch(console.error);
