var Prince = require('../../../../lib/prince');
var Chronicle = require('../../../../lib');
var fs = require('fs');
var url = require('url');
var path = require('path');
var nock = require('nock');
var ip = require('ip');
var suspend = require('suspend');


suspend(function * () {
	try {
		// nock bundle.js and sql-internal api call
		// appUrl, reportPath, resultSets, api flag
		var appUrl = 'http://test.com/App/';
		var reportPath = 'reports/sink/bundle.js';
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

		var filePath = path.resolve(__dirname, '../bundle.js');
		var authToken = '1';
		var sqlCmd = [
			"SELECT name," +
			"	string AS 'items.string', number AS 'items.number', date AS 'items.date'" +
			"FROM Group" +
			"LEFT OUTER JOIN Item ON Item.groupName = Group.name"
		].join(';');
		var bundle = nock(appUrl)
			.get('/' + reportPath)
			.replyWithFile(200, filePath);
		var api = nock(appUrl)
			.post('/SQLInternal', {
				authToken: authToken,
				sqlCmd: sqlCmd,
				ipAddress: ip.address()
			})
			.reply(200, {resultSets: resultSets});

		// Setup
		var chronicle = Chronicle.create({
			renderer: Prince.create()
		});
		yield chronicle.initialize();

		// Run report
		var reportUrl = url.resolve(appUrl, reportPath);
		var parameters = {
			renderer: {
//				userPassword: 'pass' // --user-password=pass
			},
			report: {
				authToken: authToken,
				appUrl: appUrl
			}
		};
		console.time('Run');
		var pdf = yield chronicle.run(reportUrl, parameters);
		console.timeEnd('Run');

		// Capture output
		fs.writeFileSync(path.join(__dirname, './test.pdf'), pdf);
		// Cleanup
		chronicle.shutdown();
	}
	catch (error) {
		console.error('Error:\n', error);
		console.trace(error);
	}
})();
