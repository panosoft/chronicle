var utils = require('../../../../common/utils');

utils.testReport({
	url: 'http://localhost/App/reports/sink/bundle.js',
	parameters: {
		renderer: {
			// userPassword: 'pass' // --user-password=pass
		},
		report: {}
	},
	mock: true,
	resultSets: [
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
	]
});
