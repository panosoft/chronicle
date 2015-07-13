var report = require('../');
var Chronicle = require('chronicle');
var Prince = require('chronicle-prince');
var fs = require('fs');

var chronicle = Chronicle.create({
	renderer: Prince.create()
});
chronicle.initialize()
	.then(function () {
		return chronicle.run(report);
	})
	.then(function (pdf) {
		fs.writeFileSync('./test.pdf', pdf);
		chronicle.shutdown();
	})
	.catch(console.error);
