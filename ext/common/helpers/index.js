var R = require('ramda');
var format = require('./format');

module.exports = R.merge(format, {
    isNegative: value => (value < 0) ? 'negative' : '',
    trim: function() { // arrow functions don't pass arguments correctly yet #bleedingedge
		return R.trim(R.join(' ', R.map(R.trim, R.slice(0, arguments.length - 1, arguments))));
	}
});
