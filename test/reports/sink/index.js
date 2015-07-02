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

	// Execute script(s)
	return yield sql.execute(script, parameters);
});
var process = function (data) {
	return {
		title: "Kitchen Sink",
		string: 'A string',
		number: 4321.1234,
		numberNegative: -4321.1234,
		date: new Date(),
		groups: data[0]
	};
};
var data = suspend.promise(function * (parameters) {
	var data = yield fetch(parameters);
	data = process(data);
	return data;
});

module.exports = {
	data: data,
	template: fs.readFileSync('./assets/template.html', 'utf8'),
	helpers: _.assign(
		helpers,
		{
			embedded: function () {return 'Embedded Helper';},
			imported: require('./assets/helper.js')
		}
	),
	partials: _.assign(
		partials,
		{
			embedded: 'Embedded Partial',
			importedText: fs.readFileSync('./assets/partial.html', 'utf8'), // text asset
			importedFont: datauri('./assets/PrecisionID MICR.ttf'), // binary asset
			importedImage: datauri('./assets/person.png'), // binary asset
			logo: datauri('../../../common/assets/images/panoLogo.png') // binary asset
		}
	),
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
