var Browserify = require('browserify');
var chalk = require('chalk');
var fs = require('fs');
var moment = require('moment');
var R = require('ramda');
var Ru = require('@panosoft/ramda-utils');
var Watchify = require('watchify');

var handleError = (error) => console.error(error.message);
var options = R.merge(
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
var browserify = Browserify(options);
/**
 * Bundle a module and its dependencies into a single file.
 *
 * @params {String} [entry]
 * 	If entry is not supplied, the package.json `main` property will be used.
 * 	If that is blank, then `index.js` will be used
 * @params {Object} [options]
 * @params {String} [options.output=bundle.js]
 * @params {Boolean} [options.watch=false]
 */
var bundle = function (entry, options) {
	console.log('Options:', options);
	if (!entry) {
		var pkg;
		try {
			pkg = fs.readFileSync('./package.json');
			pkg = JSON.parse(pkg);
		}
		catch (error) { console.warn(error); }
		if (pkg && pkg.main) entry = pkg.main;
		else entry = 'index.js';
	}
	options = Ru.defaults({
		output: 'bundle.js',
		watch: false
	}, options || {});

	console.log('Entry:', entry);
	console.log('Output:', options.output);

	browserify.add(entry);

	var bundle = () => {
		var stream = fs.createWriteStream(options.output);
		stream.on('error', handleError);
		var bundle = browserify.bundle();
		bundle.on('error', handleError);
		bundle.pipe(stream);
	};

	if (options.watch) {
		var watchify = Watchify(browserify, {poll: true});
		watchify.on('log', (message) => {
			var timestamp = chalk.yellow('[' + moment().format('HH:mm:ss') + ']');
			console.log(timestamp, message);
		});
		watchify.on('update', bundle);
	}

	bundle();
};
module.exports = bundle;
