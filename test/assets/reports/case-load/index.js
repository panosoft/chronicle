var _ = require('lodash');
var path = require('path');
var suspend = require('suspend');


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
