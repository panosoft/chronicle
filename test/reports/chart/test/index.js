var utils = require('../../../../common/utils');

utils.testReport({
	url: 'http://localhost:8080/App/reports/chart/bundle.js',
	parameters: {
		renderer: {},
		report: {}
	},
	mockData: true,
	resultSets: [
		{
			fields: ['id', 'name', 'count'],
			types: ['bigint', 'varchar', 'int'],
			rows: [
				['1', 'Alex', '2'],
				['2', 'Charles', '5']
			]
		}
	]
});
