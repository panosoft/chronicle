#!/usr/bin/env node --harmony

var press = require('./');
var pkg = require('../package');
var program = require('commander');
var UpdateNotifier = require('update-notifier');

var notifier = UpdateNotifier({
	pkg: pkg,
	updateCheckInterval: 1000 * 60 * 60 // once an hour
});
notifier.notify({defer: false});

program
	.version(pkg.version)
	.description(pkg.description)
	// bundle
	.usage('[options]')
	.option('-o, --output <output>', 'output file path')
	.option('-w, --watch', 'press when dependencies change')
	// press
	.parse(process.argv);

press(program.args, program.opts());
