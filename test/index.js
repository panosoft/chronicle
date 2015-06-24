var Chronicle = require('../lib');
var fs = require('fs');
var url = require('url');
var path = require('path');
var nock = require('nock');
var suspend = require('suspend');

suspend(function * () {
	try {
		// nock bundle.js and sql-internal api call
		var baseUrl = 'http://test.com/App/';
		var reportPath = 'reports/sink/bundle.js';
		var filePath = path.resolve(__dirname, './assets/reports/sink/bundle.js');
		var callerId = '1';
		var sqlCmd = [
			"SELECT name," +
			"	string AS 'items.string', number AS 'items.number', date AS 'items.date'" +
			"FROM Group" +
			"LEFT OUTER JOIN Item ON Item.groupName = Group.name"
		].join(';');
		var resultSets = [
			{
				fields: ['name', 'items.string', 'items.number', 'items.date'],
				types: ['varchar', 'varchar', 'bigint', 'date'],
				rows: [
					['Group 1', 'a', '1', '1/1/2015 00:00:00'],
					['Group 1', 'b', '2', '2/1/2015 00:00:00'],
					['Group 2', 'c', '3', '3/1/2015 00:00:00'],
					['Group 2', 'd', '4', '4/1/2015 00:00:00'],
					['Group 2', 'e', '5', '5/1/2015 00:00:00']
				]
			}
		];
		var bundle = nock(baseUrl)
			.get('/' + reportPath)
			.replyWithFile(200, filePath);
		var api = nock(baseUrl)
			.post('/SQLInternal', {
				callerId: callerId,
				sqlCmd: sqlCmd
			})
			.reply(200, {resultSets: resultSets});


		// Setup
		var chronicle = Chronicle.create({
			fileroot: path.join(__dirname, 'assets'),
			license: path.join(__dirname, 'assets/princeLicense.dat'),
			helpers: require('./assets/helpers'),
			partials: require('./assets/partials')
		});
		yield chronicle.initialize();


		// Run report
		var reportUrl = url.resolve(baseUrl, reportPath);
		var parameters = {
			report: {
				callerId: callerId,
				baseUrl: baseUrl
			}
		};
		console.time('Run');
		var pdf = yield chronicle.run(reportUrl, parameters); // TODO (path | url | def, param)
		console.timeEnd('Run');


		// Cleanup
		chronicle.shutdown();


		// Capture output
		fs.writeFileSync(path.join(__dirname, './test.pdf'), pdf);
		console.log('Report generated');
	}
	catch (error) {
		console.trace(error);
	}
})();
