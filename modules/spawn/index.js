var suspend = require('suspend');
var resume = suspend.resume;
var childProcess = require('child_process');

var spawn = suspend.promise(function * (command, args, input) {
	resume = resume();
	var child = childProcess.spawn(command, args);

	// TODO handle sig events? (sigint, etc.)

	// Handle errors
	child.stderr.setEncoding('utf8');
	child.stderr.on('data', function (data) {
		resume(data);
	});
	child.stderr.on('error', function (error) {
		resume(error);
	});
	child.stdout.on('error', function (error) {
		resume(error);
	});
	child.stdin.on('error', function (error) {
		resume(error);
	});
	child.on('close', function (code) {
		if (code !== 0) resume(code);
	});

	// Handle output
	var buffers = [];
	child.stdout.on('data', function (data) {
		buffers.push(data);
	});
	child.stdout.on('finish', function () {
		var output = Buffer.concat(buffers);
		resume(null, output);
	});

	return yield child.stdin.end(input);
});

module.exports = spawn;