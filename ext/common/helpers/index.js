var R = require('ramda');
var format = require('./format');

module.exports = R.merge(format, {
    isNegative: value => (value < 0)
});
