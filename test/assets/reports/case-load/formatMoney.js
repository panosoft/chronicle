var helpers = require('./helpers');

module.exports = function (value, options) {
	var result = helpers.formatMoney(value);
	if (result.indexOf('-') != -1) {
		result = '(' + result.slice(1) + ')';
	}
	return result;
};
