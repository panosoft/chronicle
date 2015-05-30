var _ = require('lodash');
var path = require('path');
var suspend = require('suspend');

var fetch = function (parameters) {
	return {
		"title": "Case Load Report",
		"agencyName": "County Agency",
		"address": "523 Willow St.",
		"phone": "1 (328) 785-2349",
		"managers": [
			{
				"name": "Alex",
				"clients": [
					{"first": "Jim", "last": "Smith", "checking": 10.00, "savings": 10.00, "total": 20.00, "street": "9124 Through St.", "city": "Irvine", "state": "Ca", "zip": 92620, imageUrl: '/images/person.png'},
					{"first": "Jane", "last": "Doe", "checking": -20.00, "savings": 10.00, "total": -10.00, "street": "2752 Ocean Blvd.", "city": "Irvine", "state": "Ca", "zip": 92620, imageUrl: '/images/person.png'},
					{"first": "John", "last": "Doe", "checking": 30.00, "savings": 30.00, "total": 60.00, "street": "7298 Beach Blvd.", "city": "Irvine", "state": "Ca", "zip": 92620, imageUrl: '/images/person.png'}
				],
				"clientCount": 3,
				"clientTotal": 80.00
			},
			{
				"name": "Charles",
				"clients": [
					{"first": "Jim", "last": "Smith", "checking": 10.00, "savings": 10.00, "total": 20.00, "street": "9124 Through St.", "city": "Irvine", "state": "Ca", "zip": 92620, imageUrl: '/images/person.png'},
					{"first": "Jane", "last": "Doe", "checking": -20.00, "savings": 10.00, "total": -10.00, "street": "2752 Ocean Blvd.", "city": "Irvine", "state": "Ca", "zip": 92620, imageUrl: '/images/person.png'},
					{"first": "John", "last": "Doe", "checking": 30.00, "savings": 30.00, "total": 60.00, "street": "7298 Beach Blvd.", "city": "Irvine", "state": "Ca", "zip": 92620, imageUrl: '/images/person.png'}
				],
				"clientCount": 3,
				"clientTotal": 120.00
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
	helpers: {
		formatMoney: './formatMoney.js',
		isNegative: function (value) {
			return (value < 0) ? 'negative' : '';
		}
	},
	partials: {
		address: './address.html'
	}
};
