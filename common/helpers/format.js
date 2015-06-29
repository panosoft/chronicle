var _ = require('lodash');
var writtenNumber = require('written-number');
var moment = require('moment');
var numeral = require('numeral');

var words = function (value) {
	value = _(value).toString();
	// number = [integer, decimal]
	var number = value.replace(/[^\d\.]/g, '').match(/\d+/g);
	var result = writtenNumber(number[0]);
	result += ' and ' + number[1] + '/' + Math.pow(10, number[1].length);
	return result;
};

module.exports = {
	formatString: function (value, type) {
		switch (type) {
			case 'upperCase':
				value = value.toUpperCase();
				break;
		}
		return value;
	},
	formatNumber: function (value, type) {
		type = (_.isString(type) ? type : '');
		return (type === 'words') ? words(value) : numeral(value).format(type);
	},
	formatDate: function (value, type) {
		// type param might be options object => must check before passing to format
		type = (_.isString(type) ? type : '');
		return moment(value).format(type);
	}
};