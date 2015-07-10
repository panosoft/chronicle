var path = require('path');
var fs = require('fs');
var helpers = require('./helpers');
var partials = require('./partials');
var template = fs.readFileSync(path.resolve(__dirname, './template.html'), 'utf8');

module.exports = {
	template: template,
	helpers: helpers,
	partials: partials
};