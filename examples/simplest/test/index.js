var report = require('../');
var chronicle = require('../../../lib');
var fs = require('fs');
var Prince = require('prince-promise');

var press = chronicle.Press.create();
press.initialize()
	.then(function () {
		// Run report
		return press.run(report);
	})
	.then(function (html) {
		press.shutdown();
		fs.writeFileSync('./test.html', html);
		// Render PDF
		var prince = Prince.create();
		return prince.render(html);
	})
	.then(function (pdf) {
		fs.writeFileSync('./test.pdf', pdf);
	})
	.catch(console.error);
