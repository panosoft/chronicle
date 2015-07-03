#!/usr/bin/env node

var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var Browserify = require('browserify');
var Watchify = require('watchify');
var babelify = require('babelify');
var urify = require('urify');
var brfs = require('brfs');

// TODO update-notifier // after module separated into its own package.
// TODO pass entry {Path|Path[]} and output in from cli

// paths are relative to cwd of process (i.e. dir that command is run from)
var entry = 'index.js';
var output = 'bundle.js';

var options = _.assign(
	{
		standalone: 'report',
		// --node cli option sets api options below
		builtins: false,
		commondir: false,
		detectGlobals: false,
		insertGlobalVars: '__filename,__dirname',
		browserField: false
	},
	Watchify.args
);
var browserify = Browserify(entry, options)
	.transform(babelify.configure({
			blacklist: ["regenerator"]
		}))
	.transform(brfs)
	.transform(urify);
var bundle = function () {
	var handleError = function (error) {
		console.error(error.message);
	};
	var stream = fs.createWriteStream(output); // returns writable stream
	stream.on('error', handleError);
	var bundle = browserify.bundle(); // returns readable stream
	bundle.on('error', handleError);
	bundle.pipe(stream);
};
var watchify = Watchify(browserify);
watchify.on('log', console.log);
watchify.on('update', bundle);
bundle();
