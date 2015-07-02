var utils = require('../../../../common/utils');

utils.testReport({
	url: 'http://localhost:8080/App/reports/case-load/bundle.js',
	parameters: {
		renderer: {
			// userPassword: 'pass' // --user-password=pass
		},
		report: {
			ids: [1,2]
		}
	},
	mock: true,
	resultSets: [
		// Managers
		{
			fields: ['id', 'name'],
			types: ['bigint', 'varchar'],
			rows: [
				['2', 'Charles'],
				['1', 'Alex']
			]
		},
		// Clients
		{
			fields: ['id', 'managerId', 'firstName', 'checking', 'savings', 'street', 'city', 'state', 'zip', 'modified'],
			types: ['bigint', 'bigint', 'varchar', 'money', 'money', 'varchar', 'varchar', 'varchar', 'varchar', 'date'],
			rows: [
				['1', '1', 'Jim', '30.00', '20.00', '9124 Through St.', 'Irvine', 'Ca', '92620', '2015-06-03'],
				['2', '1', 'Jane', '-20.00', '10.00', '2752 Ocean Blvd.', 'Irvine', 'Ca', '92620', '2015-06-05'],
				['3', '1', 'John', '10.00', '40.00', '7298 Beach Blvd.', 'Irvine', 'Ca', '92620', '2015-06-01'],
				['4', '2', 'Jim', '10.00', '10.00', '9124 Through St.', 'Irvine', 'Ca', '92620', '2015-06-06'],
				['5', '2', 'Jane', '-10.00', '30.00', '2752 Ocean Blvd.', 'Irvine', 'Ca', '92620', '2015-06-02'],
				['6', '2', 'John', '50.00', '20.00', '7298 Beach Blvd.', 'Irvine', 'Ca', '92620', '2015-06-04']
			]
		}
	]
});
