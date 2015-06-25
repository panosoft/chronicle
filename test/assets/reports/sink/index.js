var _ = require('lodash');
var suspend = require('suspend');
var fs = require('fs');
var sql = require('../../../../lib/sql-internal');
var Tree = require('treeize');

var fetch = suspend.promise(function * (parameters) {
	// Build Sql script(s)
	var script = "" +
		"SELECT name," +
		"	string AS 'items.string', number AS 'items.number', date AS 'items.date'" +
		"FROM Group" +
		"LEFT OUTER JOIN Item ON Item.groupName = Group.name";

	// Execute script on appropriate server with proper auth
	var resultSets = yield sql.execute(script, {
		baseUrl: parameters.report.baseUrl, // base url of app to call SqlInternal on
		callerId: parameters.report.callerId // auth token to use for call
	});

	return resultSets;
});
var process = function (data) {
	// Unflatten data
	var tree = new Tree({input: {delimiter: '.'}});
	tree.grow(data[0]);
	var groups = tree.getData();

	// Construct result
	var result = {
		title: "Kitchen Sink",
		string: 'A string',
		number: 4321.1234,
		numberNegative: -4321.1234,
		date: new Date(),
		groups: groups
	};

	return result;
};
var getData = suspend.promise(function * (parameters) {
	var data = yield fetch(parameters);
	data = process(data);
	return data;
});

module.exports = {
	getData: getData,
	template: fs.readFileSync('./template.html', 'utf8'), // (optional) String
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
