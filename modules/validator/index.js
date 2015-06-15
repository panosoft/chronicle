var _ = require('lodash');
var validator = require('validator');
var path = require('path');

var isAbsolutePath = function (value) {
	return _.isString(value) && path.isAbsolute(value);
};
var	isRelativePath = function (value) {
	// starts with `./` or `../` and ends with anything
	return _.isString(value) && /^(\.{1,2})\/.*/.test(value);
};
var isPath = function (value) {
	return (isRelativePath(value) || isAbsolutePath(value) || validator.isURL(value));
};

module.exports = _.extend(validator, {
	isRelativePath: isRelativePath,
	isPath: isPath
});