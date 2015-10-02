var definition = {
	template: `
		<!DOCTYPE html>
		<html>
		<body>
			<h1>Welcome to Chronicle</h1>
			<div>Data: property: {{property}}</div>
			<div>Helpers: help: {{help "helped"}}</div>
			<div>Partials: part: {{>part}}</div>
		</body>
		</html>
	`,
	data: {
		property: 'value'
	},
	helpers: {
		help: function (value) {return value;}
	},
	partials: {
		part: 'partial template'
	}
};

module.exports = definition;
