#!/usr/bin/env node
var path = require('path');
var meow = require('meow');
var cli = meow({pkg: false});
var cp = require('child_process');

// TODO update-notifier // after module separated into its own package.

var entry = cli.input[0];
var output = cli.flags['o'];
var binary = path.resolve(__dirname, './node_modules/.bin/watchify');
var command = [binary, '-t urify -t brfs --node --standalone report -v -o', output, entry].join(' ');
console.log('Executing:', command);

var child = cp.exec(command);
child.stderr.pipe(process.stderr);
child.stdout.pipe(process.stdout);