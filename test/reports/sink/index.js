var _ = require('lodash');
var suspend = require('suspend');
var fs = require('fs');
var datauri = require('datauri');
var sql = require('../../../common/sql-internal');
var helpers = require('../../../common/helpers');
var partials = require('../../../common/partials');

var fetch = suspend.promise(function * (parameters) {
	// Build Sql script(s)
	var script = "" +
		"SELECT name," +
		"	string AS 'items.string', number AS 'items.number', date AS 'items.date'" +
		"FROM Group" +
		"LEFT OUTER JOIN Item ON Item.groupName = Group.name";

	// Execute script on appropriate server with proper auth
	var resultSets = yield sql.execute(script, {
		appUrl: parameters.report.appUrl,
		authToken: parameters.report.authToken
	});

	return resultSets;
});
var process = function (data) {
	var groups = data[0];

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
	template: fs.readFileSync('./template.html', 'utf8'),
	helpers: _.assign(helpers, {
		embedded: function () {return 'Embedded Helper';},
		imported: require('./helper.js')
	}),
	partials: _.assign(partials, {
		embedded: 'Embedded Partial',
		importedText: fs.readFileSync('./partial.html', 'utf8'), // text asset
		importedFont: datauri('./assets/PrecisionID MICR.ttf'), // binary asset
		importedImage: datauri('./assets/person.png'), // binary asset
		logo: datauri('../../../common/assets/images/panoLogo.png') // binary asset
	}),
	charts: {
		chart: function (data) {
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
