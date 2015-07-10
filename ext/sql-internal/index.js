var _ = require('lodash');
var url = require('url');
var http = require('http');
var querystring = require('querystring');
var suspend = require('suspend');
var status = require('statuses');
var Tree = require('treeize');
var ip = require('ip');

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
		port: location.port,
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
 * Convert string to js data type (string, number, date, boolean)
 * (i.e. reviver)
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
 * Parse  [ {types: [], rows: [[ string ]]} ] -> [ {types: [], rows: [[ type ]]} ]
 * alter actual resultSet object to reduce memory usage
 *
 * @param resultSets
 * @param options
 * @returns {*}
 */
var parse = function (resultSets, options) {
	var convert = options.convert;
	_.forEach(resultSets, function (resultSet) {
		_.forEach(resultSet.rows, function (row) {
			_.forEach(row, function (value, index) {
				var type = resultSet.types[index];
				row[index] = convert(value, type, options);
			});
		});
	});
	return resultSets;
};
/**
 * Normalize
 * alter actual resultSet object to reduce memory usage
 *
 * [{fields: [], types: [], rows:[[]]}] -> [[{field: value}]]
 *
 */
var normalize = function (resultSets) {
	_.forEach(resultSets, function (resultSet, index) {
		resultSet.rows.unshift(resultSet.fields);
		var tree = new Tree({input: {delimiter: '.'}});
		tree.grow(resultSet.rows);
		resultSets[index] = tree.getData();
	});
	return resultSets;
};
/**
 *
 * @param resultSets
 * @param options
 * @returns {*}
 */
var deserialize = function (resultSets, options) {
	parse(resultSets, options);
	normalize(resultSets);
	return resultSets;
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
 * @param {Function} options.authToken
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
		authToken: null,
		convert: convert,
		timeZone: 'PDT'
	});
	var apiUrl = url.resolve(options.appUrl, 'SQLInternal');
	var form = {
		authToken: options.authToken,
		sqlCmd: scripts.join(';'),
		ipAddress: ip.address()
	};
	var result = yield post(apiUrl, form);
	var response = result.response;
	var statusCode = response.statusCode;
	if (statusCode !== 200) {
		throw new Error('Unexpected statusCode: ' + statusCode + ': ' + status[statusCode]);
	}

	var body = JSON.parse(result.body);
	if (body.error) throw new Error(body.error);

	return deserialize(body, options);
});
module.exports = {
	execute: execute
};