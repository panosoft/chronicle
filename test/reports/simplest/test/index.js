var report = require('../');
var Chronicle = require('../../../../lib');
var fs = require('fs');
var Prince = require('prince-promise');

var chronicle = Chronicle.create();
chronicle.initialize()
	.then(function () {
		// Run report
		return chronicle.run(report);
	})
	.then(function (html) {
		chronicle.shutdown();
		fs.writeFileSync('./test.html', html);
		// Render PDF
		var prince = Prince.create();
		return prince.render(html);
	})
	.then(function (pdf) {
		fs.writeFileSync('./test.pdf', pdf);
	})
	.catch(console.error);
