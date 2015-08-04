#!/usr/bin/env node --harmony

var co = require('co');
var chronicle = require('./');
var stdin = require('get-stdin');
var path = require('path');
var pkg = require('../package');
var program = require('commander');
var UpdateNotifier = require('update-notifier');

UpdateNotifier({
	pkg: pkg,
	updateCheckInterval: 1000 * 60 * 60 // once an hour
}).notify({defer: false});

var getStdin = function () {
	return new Promise(function (resolve, reject) {
		stdin(resolve);
	});
};
var bundle = function (entries, program) {
	// TODO support stdin and stdout
	chronicle.bundle(entries, program.opts());
};
/**
 *
 * @param definition {String|JSON}
 * @param program
 */
var run = co.wrap(function * (definition, program) {
	// TODO support stdin and stdout
	try {
		definition = (definition ? JSON.parse(definition) : {});
	}
	catch (error) {}
	var options = program.opts();
	try {
		var parameters = (options.parameters ? JSON.parse(options.parameters) : {});
	}
	catch (error) {
		return console.error('--parameters must be JSON parseable.');
	}
	console.log('definition:', definition);
	console.log('parameters:', parameters);
	var press = chronicle.Press.create();
	yield press.initialize();
	try {
		var html = yield press.run(definition, parameters);
		console.log(html);
	}
	catch (error) {
		console.error(error);
	}
	press.shutdown();
});

program.version(pkg.version)
	.description(pkg.description);
program.command('bundle [entries...]')
	.description('Bundle a definition and its dependencies into a single file.')
	.option('-o, --output <output>', 'output file path')
	.option('-w, --watch', 'press when dependencies change')
	.action(bundle);
program.command('run <definition>')
	.description('Run a report through the press.')
	.option('-p, --parameters <parameters>', 'stringified report parameters object')
	.action(run);
program.parse(process.argv);
