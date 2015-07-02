var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var suspend = require('suspend');
var datauri = require('datauri');
var sql = require('../../../common/sql-internal');
var helpers = require('../../../common/helpers');
var partials = require('../../../common/partials');

var fetch = suspend.promise(function * (parameters) {
	// Build Sql script(s)
	var ids = parameters.report.ids;
	var scripts = [
		"SELECT id, name" +
		"FROM Managers" +
		"WHERE id IN (" + ids.join(',') + ")",
		"SELECT id, managerId, firstName, checking, savings, street, city, state, zip, image, modified" +
		"FROM Clients" +
		"WHERE managerId IN (" + ids.join(',') + ")"
	];

	// Execute script(s)
	return yield sql.execute(scripts, parameters.report);
});
var process = function (data) {
	var managers = data[0];
	var clients = data[1];

	_.forEach(clients, function (client) {
		client.total = client.checking + client.savings;
	});
	clients = _.sortByOrder(clients, 'modified', false);
	clients = _.groupBy(clients, 'managerId');

	_.forEach(managers, function (manager) {
		manager.clients = clients[manager.id];
		manager.clientCount = manager.clients.length;
		manager.clientTotal = _.reduce(manager.clients, function (total, client) {
			return total + client.total;
		}, 0);
	});
	managers = _.sortByOrder(managers, 'name', true);

	return {
		title: 'Case Load Report',
		date: new Date(),
		managers: managers
	};
};
var getData = suspend.promise(function * (parameters) {
	var data = yield fetch(parameters);
	data = process(data);
	return data;
});

module.exports = {
	getData: getData,
	template: fs.readFileSync('../assets/template.html', 'utf8'),
	helpers: helpers,
	partials: _.assign(
		partials,
		{
			main: fs.readFileSync('./assets/main.html', 'utf8'),
			address: fs.readFileSync('./assets/address.html', 'utf8'),
			person: datauri('./assets/person.png'),
			logo: datauri('../../../common/assets/images/panoLogo.png')
		}
	)
};
