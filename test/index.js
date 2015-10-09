var chronicle = require('../lib');
var co = require('co');
var expect = require('chai')
	.use(require('chai-as-promised'))
	.use(require('sinon-chai'))
	.expect;
var nock = require('nock');
var path = require('path');
var sinon = require('sinon');
var url = require('url');

// TODO describe('bundle')

describe('Press', function () {
	var press;

	describe('create', function () {
		it('return instance of Press', function () {
			press = chronicle.Press.create();
			expect(press).to.have.all.keys(['initialize', 'run', 'shutdown']);
		});
	});

	describe('initialize', function () {
		it('start press', function () {
			return expect(press.initialize()).to.eventually.be.fulfilled;
		});
		it('throw if already initialized', function () {
			return expect(press.initialize()).to.eventually.be.rejectedWith(Error, /Already initialized/);
		});
	});

	describe('run', function () {
		it('throw if press not initialized', function () {
			var press = chronicle.Press.create();
			return expect(press.run()).to.eventually.be.rejectedWith(Error, /Not initialized/);
		});
		it('throw if no report', function () {
			return expect(press.run()).to.eventually.be.rejectedWith(TypeError);
		});
		it('accept report definition', function () {
			var template = 'Test';
			var definition = {template: template};
			return expect(press.run(definition)).to.eventually.equal(template);
		});
		it('optionally accept parameters', function () {
			var template = 'Test';
			var definition = {template: template};
			var parameters = {};
			return expect(press.run(definition, parameters)).to.eventually.equal(template);
		});
		it('accept file path to report module', function () {
			var modulePath = path.resolve(__dirname, 'fixtures/module.js');
			var template = require(modulePath).template;
			return expect(press.run(modulePath)).to.eventually.equal(template);
		});

		// Test network requests
		var filename = 'bundle.js';
		var domain = 'http://test.com';
		var bundlePath = path.resolve(__dirname, 'fixtures', filename);
		var bundleUrl = url.resolve(domain, filename);
		var template = require(bundlePath).template;
		it('accept fully qualified url to bundled report module', function () {
			// nock request
			nock(domain)
				.get(`/${filename}`)
				.replyWithFile(200, bundlePath);
			return expect(press.run(bundleUrl)).to.eventually.equal(template);
		});
		it('should cache report module bundles', function () {
			// nock same request (304, return nothing)
			nock(domain)
				.get(`/${filename}`)
				.reply(304);
			return expect(press.run(bundleUrl)).to.eventually.equal(template);
		});
	});

	describe('shutdown', function () {
		it('disable press', function () {
			press.shutdown();
			return expect(press.run()).to.eventually.be.rejectedWith(Error, /Not initialized/);
		});
		it('throw if not initialized', function () {
			expect(press.shutdown).to.throw(Error, /Not initialized/);
		});
	});
});


describe('Definition', function () {
	var press;
	before(function () {
		press = chronicle.Press.create();
		return press.initialize();
	});
	after(function () {
		press.shutdown();
	});

	it('can be object', function () {
		var definition = {template: ''};
		return expect(press.run(definition)).to.eventually.be.fulfilled;
	});
	it('can be function that returns an object', function () {
		var definition = function () { return {template: ''}; };
		return expect(press.run(definition)).to.eventually.be.fulfilled;
	});
	it('can be yieldable function that is fulfilled with an object', function () {
		var definition = co.wrap(function * () { return {template: ''}; });
		return expect(press.run(definition)).to.eventually.be.fulfilled;
	});
	it('called with parameters if a function', function () {
		return co(function * () {
			var parameters = {};
			var definition = sinon.stub().returns({template: ''});
			yield press.run(definition, parameters);
			expect(definition).to.be.calledOnce
				.and.to.be.calledWithExactly(parameters);
		});
	});

	describe('template', function () {
		it('required', function () {
			var definition = {};
			return expect(press.run(definition))
				.to.eventually.be.rejectedWith(TypeError);
		});
		it('used to produce final html output', function () {
			var template = 'Test';
			var definition = {template: template};
			return expect(press.run(definition)).to.eventually.equal(template);
		});
		it('throw if not string', function () {
			var definition = {template: {}};
			return expect(press.run(definition))
				.to.eventually.be.rejectedWith(TypeError);
		});
	});

	describe('context', function () {
		it('optional', function () {
			var definition = {template: ''};
			return expect(press.run(definition)).to.eventually.be.fulfilled;
		});
		it('can be string', function () {
			var definition = { template: '', context: '' };
			return expect(press.run(definition)).to.eventually.be.fulfilled;
		});
		it('can be number', function () {
			var definition = { template: '', context: 1 };
			return expect(press.run(definition)).to.eventually.be.fulfilled;
		});
		it('can be boolean', function () {
			var definition = { template: '', context: true };
			return expect(press.run(definition)).to.eventually.be.fulfilled;
		});
		it('can be array', function () {
			var definition = { template: '', context: [] };
			return expect(press.run(definition)).to.eventually.be.fulfilled;
		});
		it('can be object', function () {
			var definition = { template: '', context: {} };
			return expect(press.run(definition)).to.eventually.be.fulfilled;
		});
		it('can be function that returns object', function () {
			var definition = {
				template: '',
				context: function () { return {}; }
			};
			return expect(press.run(definition)).to.eventually.be.fulfilled;
		});
		it('can be yieldable function', function () {
			var definition = {
				template: '',
				context: co.wrap(function * () { return 1; })
			};
			return expect(press.run(definition)).to.eventually.be.fulfilled;
		});
		it('called with parameters if a function', function () {
			return co(function * () {
				var context = sinon.stub().returns({});
				var definition = { template: '', context: context };
				var parameters = {};
				yield press.run(definition, parameters);
				expect(context).to.be.calledOnce
					.and.to.be.calledWithExactly(parameters);
			});
		});
		it('throw if functions throws', function () {
			var context = function () {throw new Error();};
			var definition = {template: '', context: context};
			return expect(press.run(definition))
				.to.eventually.be.rejectedWith(Error);
		});
		it('can be used in template', function () {
			var template = '{{value}}';
			var value = 'Test';
			var definition = { template: template, context: { value: value } };
			return expect(press.run(definition)).to.eventually.equal(value);
		});
	});

	describe('partials', function () {
		it('optional', function () {
			var definition = {template: ''};
			return expect(press.run(definition)).to.eventually.be.fulfilled;
		});
		it('object containing partials', function () {
			var definition = { template: '', partials: {part: 'Test'} };
			return expect(press.run(definition)).to.eventually.be.fulfilled;
		});
		it('throw if not object', function () {
			var definition = { template: 'Test', partials: 'Test' };
			return expect(press.run(definition))
				.to.eventually.be.rejectedWith(TypeError);
		});
		it('throw if object properties aren\'t all strings', function () {
			var definition = { template: 'Test', partials: { part: {} } };
			return expect(press.run(definition))
				.to.eventually.be.rejectedWith(TypeError);
		});
		it('can be used in template', function () {
			var template = '{{> part}}';
			var value = 'Test';
			var definition = { template: template, partials: {part: value} };
			return expect(press.run(definition)).to.eventually.equal(value);
		});
	});

	describe('charts', function () {
		it('optional', function () {
			var definition = {template: ''};
			return expect(press.run(definition)).to.eventually.be.fulfilled;
		});
		it('object containing functions that return c3 configs', function () {
			var chart = function () { return { data: {columns: []} }; };
			var definition = { template: '', charts: { chart: chart } };
			return expect(press.run(definition)).to.eventually.be.fulfilled;
		});
		it('each chart function called with `context`', function () {
			return co(function * () {
				var parameters = {};
				var context = {};
				var chart = sinon.stub()
					.returns({ data: {columns: ['data', 1]} });
				var definition = {
					template: '',
					context: context,
					charts: { chart: chart }
				};
				yield press.run(definition, parameters);
				expect(chart).to.be.calledOnce
					.and.to.be.calledWithExactly(context);
			});
		});
		it('throw if not object', function () {
			var definition = { template: '', charts: 'Test' };
			return expect(press.run(definition))
				.to.eventually.be.rejectedWith(TypeError);
		});
		it('throw if object properties aren\'t all functions', function () {
			var definition = { template: '', charts: {chart: 'Test'} };
			return expect(press.run(definition))
				.to.eventually.be.rejectedWith(TypeError);
		});
		it('throw if a function returns invalid c3 config', function () {
			var chart = function () { return {}; };
			var definition = { template: '', charts: { chart: chart } };
			return expect(press.run(definition)).to.eventually.be.rejected;
		});
		it('can be used in template as {{> charts.chartName}}', function () {
			var template = '{{> charts.chart}}';
			var chart = function () {
				return { data: {columns: ['data', 1]} };
			};
			var definition = { template: template, charts: { chart: chart } };
			return expect(press.run(definition)).to.eventually.contain('<svg');
		});
	});

	describe('helpers', function () {
		it('optional', function () {
			var definition = {template: ''};
			return expect(press.run(definition)).to.eventually.be.fulfilled;
		});
		it('object containing helper functions', function () {
			var definition = { template: '', helpers: { help: function () {} } };
			return expect(press.run(definition)).to.eventually.be.fulfilled;
		});
		it('throw if not object', function () {
			var definition = { template: '', helpers: 'Test' };
			return expect(press.run(definition)).to.eventually.be.rejectedWith(TypeError);
		});
		it('throw if object properties aren\'t all functions', function () {
			var definition = { template: '', helpers: {help: 'Test'} };
			return expect(press.run(definition)).to.eventually.be.rejectedWith(TypeError);
		});
		it('can be used in template', function () {
			var value = 'Test';
			var definition = {
				template: '{{help}}',
				helpers: {
					help: function () { return value; }
				}
			};
			return expect(press.run(definition)).to.eventually.equal(value);
		});
		it('can be used in partials', function () {
			var value = 'Test';
			var definition = {
				template: '{{> part}}',
				partials: {
					part: '{{help}}'
				},
				helpers: {
					help: function () { return value; }
				}
			};
			return expect(press.run(definition)).to.eventually.equal(value);
		});
	});
});
