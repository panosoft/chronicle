var _ = require('lodash');
var url = require('url');
var suspend = require('suspend');
var request = require('request');
var status = require('statuses');

/**
 * Deserialize string to data type (string, number, date)
 * Convert string of sql data type to js data type
 *
 * @param value
 * @param type
 * @param options
 *
 * @returns {*}
 */
var convert = function (value, type, options) {
	if (type.match(/bit|boolean/) && isNaN(value)) {
		return (value.toLowerCase() === 'true');
	}
	if (type.match(/bit|int|money|decimal|numeric|float|real|double|currency|year|big|serial/)) {
		return Number(value);
	}
	if (type.match(/date|timestamp/)) {
		// if ends in a number (implies no timezone included) then apply the default timeZone
		if (!isNaN(value[value.length - 1]))
			value += ' ' + options.timeZone;
		return new Date(value);
	}
	return value;
};
/**
 * Normalize resultSets
 *
 * [{fields: [], types: [], rows:[[]]}] -> [[{field: value}]]
 *
 */
var normalize = function (resultSets, options) {
	options = _.defaults(options || {}, {
		convert: convert,
		timeZone: 'PDT'
	});
	var normalizedSets = [];
	resultSets.forEach(function (resultSet) {
		var normalizedSet = [];
		resultSet.rows.forEach(function (row) {
			var normalizedRow = {};
			row.forEach(function (value, index) {
				var convertOptions = _.assign({}, options, {defaultConvert: convert});
				normalizedRow[resultSet.fields[index]] = options.convert(value, resultSet.types[index], convertOptions);
			});
			normalizedSet.push(normalizedRow);
		});
		normalizedSets.push(normalizedSet);
	});
	return normalizedSets;
};

/**
 * Execute script(s)
 *
 *    sql.execute(scripts[], options) -> promise -> normalized resultSets[]
 *
 * @param {String|String[]} scripts
 *    Sql script to excute on server
 * @param {Object} options
 * @param {String} options.basePath
 *    Path to application root
 * @param {Function} options.callerId
 *    Caller Id to use for request
 * @param {Function} options.convert
 *    Override built in string + sql type -> js type converter
 *
 * @returns {Promise}
 */
var execute = suspend.promise(function * (scripts, options) {
	scripts = _.isArray(scripts) ? scripts : [scripts];
	options = _.defaults(options || {}, {
		baseUrl: null,
		callerId: null,
		convert: convert,
		timeZone: 'PDT'
	});
	var apiUrl = url.resolve(options.baseUrl, 'SQLInternal');
	var sqlCmd = scripts.join(';');

	// do post
	var form = {
		callerId: options.callerId,
		sqlCmd: sqlCmd
	};
	var result = yield request({
		url: apiUrl,
		method: 'POST',
		form: form
	}, suspend.resumeRaw());
	var error = result[0];
	var response = result[1];
	var body = result[2];

	if (error) throw new Error(error);
	var statusCode = response.statusCode;
	if (statusCode !== 200) throw new Error('Unexpected statusCode: ' + statusCode + ': ' + status[statusCode]);
	body = JSON.parse(body);
	if (body.error) throw new Error(body.error);

	var resultSets = body.resultSets;
	return normalize(resultSets, options);
});
module.exports = {
	execute: execute
};