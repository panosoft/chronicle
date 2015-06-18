var _ = require('lodash');
var path = require('path');
var suspend = require('suspend');

var fetch = function (parameters) {
	return {
		"checks" : [
			{ "payorFirst": "Maite", "payorLast": "Marquez", "checkNumber": 10000, "amount": 135, "payee": "Vulputate Ullamcorper Magna Ltd" },
			{ "payorFirst": "Inga", "payorLast": "Hester", "checkNumber": 10001, "amount": 300, "payee": "In Company" },
			{ "payorFirst": "Renee", "payorLast": "Mooney", "checkNumber": 10002, "amount": 372, "payee": "Ridiculus Mus Ltd" }
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
	getData: getData
};
