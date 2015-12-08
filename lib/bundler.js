const Browserify = require('browserify');
const chalk = require('chalk');
const fs = require('fs');
const moment = require('moment');
const R = require('ramda');
const rm = require('rimraf');
const Ru = require('@panosoft/ramda-utils');
const Watchify = require('watchify');

const options = R.merge(
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
const browserify = Browserify(options);
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
const bundle = function (entry, options) {
	console.log('Options:', options);
	if (!entry) {
		var pkg;
		try {
			pkg = fs.readFileSync('./package.json');
			pkg = JSON.parse(pkg);
		}
		catch (error) { console.warn(chalk.yellow(error.message)); }
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

	const bundle = () => {
		const filename = options.output;
		const handleError = error => {
			console.error(chalk.red(error.message));
			rm(filename, error => error ? console.error(chalk.red(error.message)) : null);
		};
		const stream = fs.createWriteStream(filename);
		stream.on('error', handleError);
		const bundle = browserify.bundle();
		bundle.on('error', handleError);
		bundle.pipe(stream);
	};

	if (options.watch) {
		const watchify = Watchify(browserify, {poll: true});
		watchify.on('log', (message) => {
			const timestamp = chalk.cyan(`[${moment().format('HH:mm:ss')}]`);
			console.log(timestamp, message);
		});
		watchify.on('update', bundle);
	}

	bundle();
};
module.exports = bundle;
