var _ = require('lodash');
var path = require('path');
var suspend = require('suspend');


// Lib fn's belong in sql call adapter lib
// resultSets = [{fields: [], types: [], rows:[[]]}]
// Deserialize string to data type (string, number, date)
// Convert string of sql data type to js data type
var convert = function(value, type, options) {
	if (type.match(/bit|boolean/) && isNaN(value)) {
		return (value.toLowerCase() === 'true');
	}
	if (type.match(/bit|int|money|decimal|numeric|float|real|double|currency|year|big|serial/)) {
		return Number(value);
	}
	if (type.match(/date|timestamp/)) {
		// if ends in a number (implies no timezone included) then apply the default timeZone
		if (!isNaN(value[value.length - 1]))
			value += options.timeZone;
		return new Date(value);
	}
	return value;
};
// Normalize from [{fields: [], types: [], rows:[[]]}] -> [[{field: value}]]
var normalize = function(resultSets, options) {
	options = _.defaults(options || {}, {
		convert: convert,
		timeZone: 'PDT'
	});
	var normalizedSets = [];
	resultSets.forEach(function(resultSet) {
		var normalizedSet = [];
		resultSet.rows.forEach(function(row) {
			var normalizedRow = {};
			row.forEach(function(value, index) {
				var convertOptions =  _.assign({}, options, {defaultConvert: convert});
				normalizedRow[resultSet.fields[index]] = options.convert(value, resultSet.types[index], convertOptions);
			});
			normalizedSet.push(normalizedRow);
		});
		normalizedSets.push(normalizedSet);
	});
	return normalizedSets;
};



var fetch = function (parameters) {
	var result;
	// SQLInternal call using parameters
	var resultSets = [
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
			fields: ['id', 'managerId', 'firstName', 'checking', 'savings', 'street', 'city', 'state', 'zip', 'image', 'modified'],
			types: ['bigint', 'bigint', 'varchar', 'money', 'money', 'varchar', 'varchar', 'varchar', 'varchar', 'varchar', 'date'],
			rows: [
				['1', '1', 'Jim', '10.00', '10.00', '9124 Through St.', 'Irvine', 'Ca', '92620', '/images/person.png', '2015-06-03'],
				['2', '1', 'Jane', '-20.00', '10.00', '2752 Ocean Blvd.', 'Irvine', 'Ca', '92620', '/images/person.png', '2015-06-05'],
				['3', '1', 'John', '30.00', '30.00', '7298 Beach Blvd.', 'Irvine', 'Ca', '92620', '/images/person.png', '2015-06-01'],
				['4', '2', 'Jim', '10.00', '10.00', '9124 Through St.', 'Irvine', 'Ca', '92620', '/images/person.png', '2015-06-06'],
				['5', '2', 'Jane', '-20.00', '10.00', '2752 Ocean Blvd.', 'Irvine', 'Ca', '92620', '/images/person.png', '2015-06-02'],
				['6', '2', 'John', '30.00', '30.00', '7298 Beach Blvd.', 'Irvine', 'Ca', '92620', '/images/person.png', '2015-06-04']
			]
		}
	];
	// Normalize
	result = normalize(resultSets);
	return result;
};
var process = function (data) {
	// deflatten

	var managers = data[0];
	var clients = data[1];

	// Sort // TODO
	// name (string)
	managers = _.sortByOrder(managers, 'name', true);
	// checking (number)
	clients = _.sortByOrder(clients, 'checking', true);
	// modified (date)
	clients = _.sortByOrder(clients, 'modified', false);

	// Join
	// [{id, managerId, ...}] -> {managerId: [{id, managerId, ...}]}
	clients = _.groupBy(clients, function (client) {
		return client.managerId;
	});
	// [{id, name}] -> [{id, name, clients: []}]
	managers = _.map(managers, function (manager) {
		manager.clients = clients[manager.id];
		return manager;
	});

	// Aggregate
	managers = _.map(managers, function (manager) {
		// total for client
		manager.clients = _.map(manager.clients, function (client) {
			client.total = client.checking + client.savings;
			return client;
		});
		// client total for manager
		manager.clientTotal = _.reduce(manager.clients, function (total, client) {
			return total + client.total;
		}, 0);
		// client count for manager
		manager.clientCount = manager.clients.length;
		return manager;
	});

	return {
		title: 'Case Load Report',
		date: new Date(),
		managers: managers
	};
};
var getData = suspend.promise(function * (parameters) {
	var data = fetch(parameters);
	data = process(data);
	return data;
});

module.exports = {
	getData: getData,
	helpers: {
		formatMoney: './formatMoney.js',
		isNegative: function (value) {
			return (value < 0) ? 'negative' : '';
		}
	},
	partials: {
		address: './address.html'
	}
};
