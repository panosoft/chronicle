var _ = require('lodash');
var url = require('url');
var http = require('http');
var querystring = require('querystring');
var suspend = require('suspend');
var status = require('statuses');

/**
 * Convert string to js data type (string, number, date, boolean)
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
var deserialize = function (resultSets, options) {
	// convert  {types: [], rows: [[ string ]]} -> {types: [], rows: [[ type ]]}
	// normalize  {fields: [], rows: [[ value ]]} -> [{field: value, ...}]
	return normalize(resultSets, options);
};
/**
 * Make a post request
 *
 * @params {String} location
 * @params {Object} form
 *
 * @returns {Object} result
 * @returns {Object} result.response
 * @returns {String} result.body
 */
var post = suspend.promise(function * (location, form) {
	location = url.parse(location);
	form = querystring.stringify(form);
	var resume = suspend.resume();
	var request = http.request({
		hostname: location.hostname,
		path: location.path,
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': form.length
		}
	}, function (response) {
		response.setEncoding('utf8');
		response.on('error', resume);
		var body = '';
		response.on('data', function (chunk) {
			body += chunk;
		});
		response.on('end', function () {
			var result = {
				response: response,
				body: body
			};
			resume(null, result);
		});
	});
	request.on('error', resume);
	request.write(form);
	return yield request.end();
});
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
 * @param {Function} options.timeZone
 *    Default timezone to apply to date values
 *
 * @returns {Promise}
 */
var execute = suspend.promise(function * (scripts, options) {
	scripts = _.isArray(scripts) ? scripts : [scripts];
	options = _.defaults(options || {}, {
		appUrl: null,
		callerId: null,
		convert: convert,
		timeZone: 'PDT'
	});
	var apiUrl = url.resolve(options.appUrl, 'SQLInternal');
	var form = {
		callerId: options.callerId,
		sqlCmd: scripts.join(';')
	};
	var result = yield post(apiUrl, form);
	var response = result.response;
	var statusCode = response.statusCode;
	if (statusCode !== 200) {
		throw new Error('Unexpected statusCode: ' + statusCode + ': ' + status[statusCode]);
	}

	var body = JSON.parse(result.body);
	if (body.error) throw new Error(body.error);

	return deserialize(body.resultSets, options);
});
module.exports = {
	execute: execute
};