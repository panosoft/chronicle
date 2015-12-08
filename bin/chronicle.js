#!/usr/bin/env node

const co = require('co');
const chronicle = require('../lib');
const fs = require('mz/fs');
const is = require('is_js');
const pkg = require('../package');
const program = require('commander');
const stdin = require('get-stdin');
const UpdateNotifier = require('update-notifier');

UpdateNotifier({
	pkg,
	updateCheckInterval: 1000 * 60 * 60 // once an hour
}).notify({defer: false});

const bundle = (entry, program) => chronicle.bundle(entry, program.opts());
/**
 * @param report {String}
 *        path to report file (local or remote)
 * @param program
 */
const run = co.wrap(function * (report, program) {
	try {
		const options = program.opts();
		if (!report) report = yield stdin();
		var parameters;
		try {
			parameters = (options.parameters ? JSON.parse(options.parameters) : {});
		}
		catch (error) {
			throw new TypeError('--parameters must be JSON parseable.');
		}
		var output = yield chronicle.run(report, parameters);
		// output: can be any type => string buffer number date boolean | array object
		if (is.array(output) || is.json(output)) output = JSON.stringify(output);
		if (options.output) {
			yield fs.writeFile(options.output, output);
		}
		else {
			console.log(output);
		}
	}
	catch (error) {
		console.error(error.stack);
		process.exit(1);
	}
});

program.version(pkg.version)
	.description(pkg.description);
program.command('bundle [entry]')
	.description('Bundle a module and its dependencies into a single file.')
	.option('-o, --output <output>', 'output file path')
	.option('-w, --watch', 'press when dependencies change')
	.action(bundle);
program.command('run [definition]')
	.description('Run a report through the press.')
	.option('-p, --parameters <parameters>', 'stringified report parameters object')
	.option('-o, --output <filename>', 'filename of file to write output to')
	.action(run);
program.parse(process.argv);
