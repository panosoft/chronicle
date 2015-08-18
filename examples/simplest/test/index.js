var chronicle = require('@panosoft/chronicle');
var fs = require('fs');
var prince = require('prince-promise');
var report = require('../lib');

var press = chronicle.Press.create();
press.initialize()
	.then(function () {
		// Run report
		return press.run(report);
	})
	.then(function (html) {
		press.shutdown();
		fs.writeFileSync('./test.html', html);
		// Render HTML as PDF
		return prince(html);
	})
	.then(function (pdf) {
		fs.writeFileSync('./test.pdf', pdf);
	})
	.catch(console.error);
