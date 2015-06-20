var path = require('path');
var _ = require('lodash');
var suspend = require('suspend');
var dargs = require('dargs');
var spawn = require('../spawn');

// TODO consider // track active child processes and untrack when close?
// TODO consider // support throttle for how many child processes are spawned at once?
// TODO consider // timeout and kill process if prince process takes too long?

// TODO investigate // will prince path change based on platform? I think so ...
var prince = path.join(__dirname, './node_modules/prince/prince/lib/prince/bin/prince');
// Mandatory args, never want these overridden
var args = [
	'-', // read from stdin
	'-o -' // write to stdout
];
/**
 * Create instance of Prince HTML Renderer
 *
 * @param {Object} defaultOptions
 * 	Default options to apply each time render is called.
 * 	e.g.
 *
 * 		{ licenseFile: 'path/to/file' }
 *
 * @constructor
 */
var create = function (defaultOptions) {
	defaultOptions = defaultOptions || {};
	/**
	 * Render HTML input to PDF
	 *
	 * @param {String} input
	 * 	Input to pipe into prince process
	 *
	 * @param {Object} options
	 * 	Options to apply to prince process.
	 * 	http://www.princexml.com/doc/command-line/
	 *
	 * 	Camel case inputs are converted to the proper format.
	 * 	e.g.
	 *
	 * 		{ licenseFile: 'path' } -> --license-file=path
	 *
	 * 	Options with true values will be set as boolean
	 * 	e.g.
	 *
	 * 		{ encrypt: true } -> --encrypt
	 *
	 * 	Note: Options with blank values will be ignored.
	 *
	 * @returns {Buffer} pdf
	 */
	var render = suspend.promise(function * (input, options) {
		options = _.defaults(options || {}, defaultOptions);
		// options with blank values bomb without a good error message => remove blanks
		options = _.omit(options, _.isEmpty);
		// Convert {optionName: value} -> ['--option-name=value']
		options = dargs(options);
		return yield spawn(prince, args.concat(options), input);
	});
	return {
		render: render
	};
};
module.exports = {
	create: create
};
