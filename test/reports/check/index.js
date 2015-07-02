var suspend = require('suspend');
var _ = require('lodash');
var fs = require('fs');
var datauri = require('datauri');
var sql = require('../../../common/sql-internal');
var helpers = require('../../../common/helpers');
var partials = require('../../../common/partials');

var fetch = suspend.promise(function * (parameters) {
	var script = "" +
		"SELECT payor, payee, number, amount" +
		"FROM Check";
	return yield sql.execute(script, parameters);
});
var process = function (data) {
	return {
		date: new Date(),
		checks: data[0]
	};
};
var data = suspend.promise(function * (parameters) {
	var data = yield fetch(parameters);
	data = process(data);
	return data;
});

module.exports = {
	data: data,
	template: fs.readFileSync('./assets/template.html', 'utf8'),
	helpers: helpers,
	partials: _.assign(
		partials,
		{
			signatureFont: datauri('../../../common/assets/fonts/YourSignature.ttf'),
			micrFont: datauri('../../../common/assets/fonts/PrecisionID MICR.ttf'),
			logo: datauri('../../../common/assets/images/panoLogo.png')
		}
	)
};
