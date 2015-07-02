var fs = require('fs');
var datauri = require('datauri');
var _ = require('lodash');
var suspend = require('suspend');
var sql = require('../../../common/sql-internal');
var helpers = require('../../../common/helpers');
var partials = require('../../../common/partials');

var fetch = suspend.promise(function * (parameters) {
	var script = "" +
		"SELECT id, name, count(clientId) AS 'count'" +
		"FROM Manager" +
		"LEFT OUTER JOIN Client ON Client.managerId = Manager.id" +
		"GROUP BY id, name";
	return yield sql.execute(script, parameters.report);
});
var process = function (data) {
	return {
		date: new Date(),
		managers: data[0]
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
			logo: datauri('../../../common/assets/images/panoLogo.png')
		}
	),
	charts: {
		clientsByManager: function (data) {
			var columns = _.map(data.managers, function (manager) {
				return [manager.name, manager.count];
			});
			return {
				data: {
					columns: columns,
					type: 'pie'
				},
				size: {
					width: 320,
					height: 320
				}
			};
		}
	}
};
