var path = require('path');
var fs = require('fs');
var suspend = require('suspend');
var helpers = require('./helpers');
var partials = require('./partials');
var template = fs.readFileSync(path.resolve(__dirname, './template.html'), 'utf8');
var Definition = require('./definition');

var buildData = function (fetch, process) {
	return suspend.promise(function * (parameters) {
		var data = yield fetch(parameters);
		data = process(data);
		return data;
	});
};

module.exports = {
	buildData: buildData,
	Definition: Definition,
	helpers: helpers,
	partials: partials,
	template: template
};