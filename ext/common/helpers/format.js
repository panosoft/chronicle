var R = require('ramda');
var is = require('is_js');
var writtenNumber = require('written-number');
var moment = require('moment');
var numeral = require('numeral');

var defaults = R.flip(R.merge);
var words = function (value) {
	value = value.toString();
	// number = [integer, decimal]
	var number = value.replace(/[^\d\.]/g, '').match(/\d+/g);
	var result = writtenNumber(number[0]);
	result += ' and ' + number[1] + '/' + Math.pow(10, number[1].length);
	return result;
};

module.exports = {
	formatString: function (value, type) {
		var properCase = s => R.toUpper(s[0]) + R.toLower(R.slice(1, s.length, s));
		var formatters = {
			upperCase: R.toUpper,
			lowerCase: R.toLower,
			properCase: R.compose(R.join(' '), R.map(properCase), R.split(' '))
		};
		return formatters[type](value);
	},
	formatNumber: function (value, type, options) {
		options = defaults(options || {}, {
			hash: {}
		});
		if (options.hash.blankOnNull && !value) return '';
		type = (is.string(type) ? type : '');
		return (type === 'words') ? words(value) : numeral(value).format(type);
	},
	formatDate: function (value, type) {
		// type param might be options object => must check before passing to format
		type = (is.string(type) ? type : '');
		return moment(value).format(type);
	}
};
