var _ = require('lodash');
var format = require('./format');

module.exports = _.assign(format, {
    isNegative: function (value) {
        return (value < 0) ? 'negative' : '';
    }
});
