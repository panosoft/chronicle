#!/usr/bin/env node

var co = require('co');
var chronicle = require('../lib');
var fs = require('mz/fs');
var is = require('is_js');
var pkg = require('../package');
var program = require('commander');
var stdin = require('get-stdin');
var UpdateNotifier = require('update-notifier');

UpdateNotifier({
	pkg,
	updateCheckInterval: 1000 * 60 * 60 // once an hour
}).notify({defer: false});

var bundle = (entry, program) => chronicle.bundle(entry, program.opts());
/**
 * @param report {String}
 * @param program
 */
var run = co.wrap(function * (report, program) {
	try {
		var options = program.opts();
		if (!report) report = yield stdin();
		var parameters;
		try {
			parameters = (options.parameters ? JSON.parse(options.parameters) : {});
		}
		catch (error) {
			throw new TypeError('--parameters must be JSON parseable.');
		}
		var press = chronicle.Press.create();
		var output = yield press.run(report, parameters);
		// output: can be any type => string buffer number date boolean | array object
		if (is.array(output) || is.object(output)) output = JSON.stringify(output);
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
