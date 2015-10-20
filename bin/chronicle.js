#!/bin/sh
":" //# http://sambal.org/?p=1014 ; exec /usr/bin/env node --harmony_arrow_functions "$0" "$@"

var co = require('co');
var chronicle = require('../lib');
var fs = require('mz/fs');
var pkg = require('../package');
var program = require('commander');
var stdin = require('get-stdin');
var UpdateNotifier = require('update-notifier');

UpdateNotifier({
	pkg: pkg,
	updateCheckInterval: 1000 * 60 * 60 // once an hour
}).notify({defer: false});

var bundle = function (entry, program) {
	chronicle.bundle(entry, program.opts());
};
/**
 *
 * @param definition {String|JSON}
 * @param program
 */
var run = co.wrap(function * (definition, program) {
	var options = program.opts();
	if (!definition) definition = yield stdin();
	try {
		definition = (definition ? JSON.parse(definition) : {});
	}
	catch (error) {} // definition left unchanged if cannot be parsed
	try {
		var parameters = (options.parameters ? JSON.parse(options.parameters) : {});
	}
	catch (error) {
		return console.error(new TypeError('--parameters must be JSON parseable.'));
	}
	var press = chronicle.Press.create();
	yield press.initialize();
	try {
		var html = yield press.run(definition, parameters);
		if (options.output) {
			yield fs.writeFile(options.output, html);
		}
		else {
			console.log(html);
		}
	}
	catch (error) {
		console.error(error.stack);
		process.exit(1);
	}
	press.shutdown();
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
