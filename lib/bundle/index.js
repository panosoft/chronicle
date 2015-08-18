var fs = require('fs');
var _ = require('lodash');
var Browserify = require('browserify');
var Watchify = require('watchify');
var babelify = require('babelify');
var brfs = require('brfs');
var chalk = require('chalk');
var moment = require('moment');
var htmlInlinify = require('html-inlinify');

var handleError = function (error) {
	console.error(error.message);
};
var options = _.assign(
	{
		standalone: 'report',
		// api options set by the `--node` cli option
		builtins: false,
		commondir: false,
		detectGlobals: false,
		insertGlobalVars: '__filename,__dirname',
		browserField: false
	},
	Watchify.args
);
var browserify = Browserify(options)
	.transform(babelify.configure({
		blacklist: ["regenerator"]
	}))
	.transform(brfs)
	.transform(htmlInlinify);
/**
 * Bundle a module and its dependencies into a single file.
 *
 * @params {String} [entry=index.js]
 * @params {Object} [options]
 * @params {String} [options.output=bundle.js]
 * @params {Boolean} [options.watch=false]
 */
var bundle = function (entry, options) {
	entry = entry || 'index.js';
	options = _.defaults(options || {}, {
		output: 'bundle.js',
		watch: false
	});

	browserify.add(entry);

	var bundle = function () {
		var stream = fs.createWriteStream(options.output);
		stream.on('error', handleError);
		var bundle = browserify.bundle();
		bundle.on('error', handleError);
		bundle.pipe(stream);
	};

	if (options.watch) {
		var watchify = Watchify(browserify, {poll: true});
		watchify.on('log', function (message) {
			var timestamp = chalk.yellow('[' + moment().format('HH:mm:ss') + ']');
			console.log(timestamp, message);
		});
		watchify.on('update', bundle);
	}

	bundle();
};
module.exports = bundle;
