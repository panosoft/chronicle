var _ = require('lodash');
var writtenNumber = require('written-number');

// Formatting
var formats = {
	number: {
		currency: {
			style: 'currency',
			currency: 'USD',
			currencyDisplay: 'symbol',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		},
		percent: {
			style: 'percent'
		}
	},
	date: {
		long: {
			month: 'long',
			day: 'numeric',
			year: 'numeric'
		}
	},
	time: {
		hhmm: {
			hour: 'numeric',
			minute: 'numeric'
		},
		hhmmss: {
			hour: 'numeric',
			minute: 'numeric',
			second: 'numeric'
		}
	}
};

// Dates
var date = new Intl.DateTimeFormat('lookup', {}).format;
var long = new Intl.DateTimeFormat('lookup', {
	month: 'long',
	day: 'numeric',
	year: 'numeric'
}).format;

// Times
var time = new Intl.DateTimeFormat('lookup', {
	hour: 'numeric',
	minute: 'numeric'
}).format;
var hhmmss = new Intl.DateTimeFormat('lookup', {
	hour: 'numeric',
	minute: 'numeric',
	second: 'numeric'
}).format;

// Numbers
var number = new Intl.NumberFormat('lookup').format;
var percent = new Intl.NumberFormat('lookup', {
	style: 'percent'
}).format;
var currency = new Intl.NumberFormat('lookup', {
	style: 'currency',
	currency: 'USD',
	currencyDisplay: 'symbol',
	minimumFractionDigits: 2,
	maximumFractionDigits: 2
}).format;
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
		// TODO parse as number?
		switch (type) {
			case 'currency':
				value = currency(value);
				break;
			case 'percent':
				value = percent(value);
				break;
			case 'words':
				value = words(value);
				break;
			default:
				value = number(value);
		}
		return value;
	},
	formatDate: function (value, type) {
		switch (type) {
			case 'long':
				value = long(value);
				break;
			default:
				value = date(value);
		}
		return value;
	},
	formatTime: function (value, type) {
		switch (type) {
			case 'hhmmss':
				value = hhmmss(value);
				break;
			default:
				value = time(value);
		}
		return value;
	}
};