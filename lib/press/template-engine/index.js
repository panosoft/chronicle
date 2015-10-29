var Handlebars = require('handlebars');

var generate = (report, context) => {
	var template = Handlebars.compile(report.template);
	var options = {
		helpers: report.helpers,
		partials: report.partials
	};
	return template(context, options);
};

module.exports = generate;
