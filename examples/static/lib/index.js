var definition = {
	template: `
		<!DOCTYPE html>
		<html>
		<body>
			<h1>Welcome to Chronicle</h1>
			<div>Data: date: {{date}}</div>
			<div>Helpers: help: {{help}}</div>
			<div>Partials: part: {{>part}}</div>
		</body>
		</html>
	`,
	data: {
		date: new Date()
	},
	helpers: {
		help: function () {return 'return value';}
	},
	partials: {
		part: 'partial template'
	}
};

module.exports = definition;
