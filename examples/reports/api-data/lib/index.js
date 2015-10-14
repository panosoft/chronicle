const co = require('co');
const got = require('got');
const inline = require('inline-html');
const moment = require('moment');
const path = require('path');
const url = require('url');

const searchRepositories = (query) => {
	var api = url.parse(`https://api.github.com/search/repositories`);
	api.query = query;
	return got(url.format(api), {json: true}).then(response => response.body.items);
};

const definition = co.wrap(function * () {

	// Define function that returns template context
	const context = co.wrap(function * (parameters) {
		// Build query using parameters
		const query = {
			q: 'language:javascript',
			sort: parameters.sort || 'stars', // stars, forks, or updated
			order: 'desc',
			per_page: parameters.results || 30 // min: 1, max: 100
		};
		// Fetch data dynamically
		var repos = yield searchRepositories(query);
		// Process data: add rank
		repos = repos.map((repo, index) => {
			repo.rank = index + 1;
			return repo;
		});
		// Return report template context
		return {
			date: new Date(),
			repos,
			title: 'Most Popular Repositories on Github'
		};
	});

	// Define template helpers
	const helpers = {
		formatDate: (date, type) => moment(date).format(type)
	};

	// Define template partials
	const partials = {
		page: '<span style="content: counter(page)"></span>',
		pages: '<span style="content: counter(pages)"></span>'
	};

	// Load template and embed local assets
	const template = yield inline.file(path.resolve(__dirname, 'template.hbs'));

	// Return report definition
	return {
		context,
		template,
		helpers,
		partials
	};
});

module.exports = definition;
