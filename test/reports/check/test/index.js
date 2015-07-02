var utils = require('../../../../common/utils');

utils.testReport({
	url: 'http://localhost:8080/App/reports/check/bundle.js',
	parameters: {
		renderer: {},
		report: {}
	},
	mock: true,
	resultSets: [
		{
			fields: ['payor', 'payee', 'number', 'amount'],
			types: ['varchar', 'varchar', 'bigint', 'money'],
			rows: [
				['Maite Marquez', 'Vulputate Ullamcorper Magna Ltd', '10000', '135'],
				['Inga Hester', 'In Company', '10001', '300'],
				['Renee Mooney', 'Ridiculus Mus Ltd', '10002', '372']
			]
		}
	]
});
