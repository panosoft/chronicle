module.exports = {
	template: 'Hello world: data: {{date}}, helper: {{help}}, partial: {{>part}}',
	data: {
		date: new Date()
	},
	helpers: {
		help: function () {return 'help';}
	},
	partials: {
		part: 'Part'
	}
};