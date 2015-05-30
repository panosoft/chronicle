var _ = require('lodash');
var suspend = require('suspend');

var fetch = function (parameters) {
	return {
		"title": "Clients by Manager",
		"managers": [
			{
				"name": "Alex",
				"clientCount": 2
			},
			{
				"name": "Charles",
				"clientCount": 5
			}
		]
	};
};
var process = function (data) {
	data.date = new Date();
	return data;
};
var getData = suspend.promise(function * (parameters) {
	var data = fetch(parameters);
	data = process(data);
	return data;
});

module.exports = {
	getData: getData,
	charts: {
		clientsByManager: function (data) {
			var columns = _.map(data.managers, function (manager) {
				return [manager.name, manager.clientCount];
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
