var _ = require('lodash');
var path = require('path');
var suspend = require('suspend');

var fetch = function (parameters) {
	return {
		title: "Kitchen Sink",
		string: 'string',
		number: 10.00,
		numberNegative: -10.00,
		groups: [
			{
				name: "Group 1",
				items: [
					{"name": "Item A"},
					{"name": "Item B"}
				]
			},
			{
				name: "Group 2",
				items: [
					{"name": "Item A"},
					{"name": "Item B"},
					{"name": "Item C"}
				]
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
	template: './template.html', // (optional) Path || String
	helpers: {
		remoteHelperEmbedded: function () {return 'Remote Helper Embedded';},
		remoteHelperImported: './helper.js'
		// Server helpers (automatically loaded, can be overridden)
	},
	partials: {
		main: './main.html',
		remotePartialEmbedded: 'Remote Partial Embedded',
		remotePartialImported: './partial.html'
		// Server helpers(automatically loaded, can be overridden)
	},
	charts: {
		chart: function (data) {
			// Restructuring logic here
			// NOTE: all processing logic should be done in process()
			var columns = _.map(data.groups, function (group) {
				return [group.name, group.items.length];
			});
			return {
				data: {
					columns: columns,
					type: 'donut'
				}
			};
		}
	}
};
