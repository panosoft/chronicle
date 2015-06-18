var _ = require('lodash');
var suspend = require('suspend');
var fs = require('fs');

var fetch = function (parameters) {
	return {
		title: "Kitchen Sink",
		string: 'A string',
		number: 4321.1234,
		numberNegative: -4321.1234,
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
	template: fs.readFileSync('./template.html', 'utf8'), // (optional) Path || String
	helpers: {
		remoteHelperEmbedded: function () {return 'Remote Helper Embedded';},
		remoteHelperImported: require('./helper.js')
		// Server helpers (automatically loaded, can be overridden)
	},
	partials: {
		main: fs.readFileSync('./main.html', 'utf8'),
		remotePartialEmbedded: 'Remote Partial Embedded',
		remotePartialImported: fs.readFileSync('./partial.html', 'utf8')
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
