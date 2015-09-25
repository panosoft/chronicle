const co = require('co');
const got = require('got');
const inlineHtml = require('inline-html');
const moment = require('moment');
const path = require('path');
const url = require('url');

const searchRepositories = (query) => {
	var api = url.parse(`https://api.github.com/search/repositories`);
	api.query = query;
	return got(url.format(api), {json: true})
		.then(response => response.body.items);
};

const data = co.wrap(function * (parameters) {
	// Get data dynamically
	var repos = yield searchRepositories({
		q: 'language:javascript',
		sort: parameters.sort,
		order: 'desc',
		per_page: 100
	});
	// Process data: add rank
	repos = repos.map(function (repo, index) {
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

const definition = co.wrap(function * (parameters) {
	// Load template and inline assets
	const template = yield inlineHtml(path.resolve(__dirname, 'template.hbs'));
	// Define template helpers
	const helpers = {
		formatDate: (date, type) => moment(date).format(type)
	};
	// Define template partials
	const partials = {
		page: '<span style="content: counter(page)"></span>',
		pages: '<span style="content: counter(pages)"></span>'
	};
	// Return report definition
	return {
		data: data,
		template: template,
		helpers: helpers,
		partials: partials
	};
});

module.exports = definition;
