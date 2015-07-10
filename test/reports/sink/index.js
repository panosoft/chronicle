var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var suspend = require('suspend');
var datauri = require('datauri');
var common = require('common');

var data = suspend.promise(function * (parameters) {
	return {
		title: "Kitchen Sink",
		string: 'A string',
		number: 4321.1234,
		numberNegative: -4321.1234,
		date: new Date(),
		groups: [
			{
				name: 'Group 1',
				items: [
					{string: 'a', number: 1, date: new Date('1/1/2015 00:00:00')},
					{string: 'b', number: 2, date: new Date('2/1/2015 00:00:00')}
				]
			},
			{
				name: 'Group 2',
				items: [
					{string: 'c', number: 3, date: new Date('3/1/2015 00:00:00')},
					{string: 'd', number: 4, date: new Date('4/1/2015 00:00:00')},
					{string: 'e', number: 5, date: new Date('5/1/2015 00:00:00')}
				]
			}
		]
	};
});

module.exports = {
	data: data,
	template: fs.readFileSync(path.resolve(__dirname, './assets/template.html'), 'utf8'),
	helpers: _.assign(
		common.helpers,
		{
			embedded: function () {return 'Embedded Helper';},
			imported: require('./assets/helper.js')
		}
	),
	partials: _.assign(
		common.partials,
		{
			embedded: 'Embedded Partial',
			// text asset
			importedText: fs.readFileSync(path.resolve(__dirname, './assets/partial.html'), 'utf8'),
			// binary assets
			importedFont: datauri(__dirname + '/assets/PrecisionID MICR.ttf'),
			importedImage: datauri(__dirname + '/assets/person.png')
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
