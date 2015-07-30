var _ = require('lodash');
var co = require('co');
var Definition = require('report-definition');
var inline = require('inline-html');
var path = require('path');

var data = co.wrap(function * (parameters) {
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

var definition = co.wrap(function * (parameters) {
	return yield Definition.create({
		data: data,
		template: yield inline(path.resolve(__dirname, './assets/template.html')),
		helpers: {
			embedded: function () { return 'Embedded Helper'; },
			imported: require('./assets/helper.js')
		},
		partials: {
			embedded: 'Embedded Partial',
			imported: yield inline(path.resolve(__dirname, './assets/partial.html'))
		},
		charts: {
			chart: function (data) {
				var columns = _.map(data.groups, function (group) {
					return [group.name, group.items.length];
				});
				return { data: { columns: columns, type: 'donut'}};
			}
		}
	})
});

module.exports = definition;
