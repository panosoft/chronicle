var is = require('is_js');
var validator = require('validator');
var path = require('path');
var R = require('ramda');

var isAbsolutePath = function (value) {
	return is.string(value) && path.isAbsolute(value);
};
var	isRelativePath = function (value) {
	// starts with `./` or `../` and ends with anything
	return is.string(value) && /^(\.{1,2})\/.*/.test(value);
};
var isPath = function (value) {
	return (isRelativePath(value) || isAbsolutePath(value) || validator.isURL(value));
};

module.exports = R.merge(validator, {
	isRelativePath: isRelativePath,
	isPath: isPath
});
