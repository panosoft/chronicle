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
			expect(press).to.have.all.keys(['run']);
		});
	});

	describe('run', function () {
		it('throw if no report', function () {
			return expect(press.run()).to.eventually.be.rejectedWith(TypeError);
		});
		it('accept report function', function () {
			var template = 'Test';
			var report = () => template;
			return expect(press.run(report)).to.eventually.equal(template);
		});
		it('optionally accept parameters', function () {
			var report = (parameters) => parameters;
			var parameters = 'Test';
			return expect(press.run(report, parameters)).to.eventually.equal(parameters);
		});
		it('accept file path to report module', function () {
			var modulePath = path.resolve(__dirname, 'fixtures/module.js');
			var parameters = 'Test';
			return expect(press.run(modulePath, parameters)).to.eventually.equal(parameters);
		});

		// Test network requests
		var filename = 'bundle.js';
		var domain = 'http://test.com';
		var bundlePath = path.resolve(__dirname, 'fixtures', filename);
		var bundleUrl = url.resolve(domain, filename);
		var parameters = 'Test';
		it('accept fully qualified url to bundled report module', function () {
			// nock request
			nock(domain)
				.get(`/${filename}`)
				.replyWithFile(200, bundlePath);
			return expect(press.run(bundleUrl, parameters)).to.eventually.equal(parameters);
		});
		it('should cache report module bundles', function () {
			// nock same request (304, return nothing)
			nock(domain)
				.get(`/${filename}`)
				.reply(304);
			return expect(press.run(bundleUrl, parameters)).to.eventually.equal(parameters);
		});
	});
});


describe('Report', function () {
	var press = chronicle.Press.create();

	it('can be function that returns a string', function () {
		var html = 'Test';
		var report = () => html;
		return expect(press.run(report)).to.eventually.be.fulfilled
			.and.to.equal(html);
	});
	it('can be yieldable function that is fulfilled with a string', function () {
		var html = 'Test';
		var report = co.wrap(function * () { return html; });
		return expect(press.run(report)).to.eventually.be.fulfilled
			.and.to.equal(html);
	});
	it('called with parameters', function () {
		return co(function * () {
			var parameters = {};
			var report = sinon.stub().returns('Test');
			yield press.run(report, parameters);
			expect(report).to.be.calledOnce
				.and.to.be.calledWithExactly(parameters);
		});
	});
});
