var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var helpers = require('./helpers');
var partials = require('./partials');
var template = fs.readFileSync(path.resolve(__dirname, './template.html'), 'utf8');

var create = function (options) {
	// default top
	options = _.defaults(options || {}, {
		template: template,
		helpers: {},
		partials: {}
	});
	return _.defaults(
		{
			template: options.template,
			helpers: _.assign(
				helpers,
				options.helpers
			),
			partials: _.assign(
				partials,
				options.partials
			)
		},
		// add any extra props in options to returned definition
		options
	);
};
module.exports = {
	create: create
};