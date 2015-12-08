const chronicle = require('../lib');
const co = require('co');
const expect = require('chai')
	.use(require('chai-as-promised'))
	.use(require('sinon-chai'))
	.expect;
const nock = require('nock');
const path = require('path');
const sinon = require('sinon');
const url = require('url');

const run = chronicle.run;

// TODO describe('bundle')

describe('Press', () => {
	describe('run', () => {
		it('accept report function', () => co(function * () {
			const template = 'Test';
			const report = () => template;
			const output = yield run(report);
			expect(output).to.equal(template);
		}));
		it('optionally accept parameters', () => co(function * () {
			const report = (parameters) => parameters;
			const parameters = 'Test';
			const output = yield run(report, parameters);
			expect(output).to.equal(parameters);
		}));
		it('accept absolute report path', () => co(function * () {
			const modulePath = path.resolve(__dirname, 'fixtures/module.js');
			const parameters = 'Test';
			const output = yield run(modulePath, parameters);
			expect(output).to.equal(parameters);
		}));
		it('accept relative report path relative to cwd', () => co(function * () {
			const relativePath = path.relative('.', __dirname);
			const modulePath = path.join(relativePath, 'fixtures/module.js');
			const parameters = 'Test';
			const output = yield run(modulePath, parameters);
			expect(output).to.equal(parameters);
		}));
		it('accept fully qualified url to bundled report module', () => co(function * () {
			const filename = 'bundle.js';
			const domain = 'http://test.com';
			const bundlePath = path.resolve(__dirname, 'fixtures', filename);
			const bundleUrl = url.resolve(domain, filename);
			const parameters = 'Test';
			nock(domain)
				.get(`/${filename}`)
				.replyWithFile(200, bundlePath);
			const output = yield run(bundleUrl, parameters);
			expect(output).to.equal(parameters);
		}));
		it('throw if no report', () =>
			expect(run()).to.eventually.be.rejectedWith(TypeError, /report: must be defined/));
		it('throw if report is not a Function', () =>
			expect(run({})).to.eventually.be.rejectedWith(TypeError, /report: must be a Function/));
	});
});

describe('Report', function () {
	it('can be function that returns a string', () => co(function * () {
		const html = 'Test';
		const report = () => html;
		const output = yield run(report);
		return expect(output).to.equal(html);
	}));
	it('can be yieldable function that is fulfilled with a string', () => co(function * () {
		const html = 'Test';
		const report = () => Promise.resolve(html);
		const output = yield run(report);
		return expect(output).to.equal(html);
	}));
	it('called with parameters', () => co(function * () {
		const parameters = {};
		const report = sinon.stub().returns('Test');
		yield run(report, parameters);
		expect(report).to.be.calledOnce
			.and.to.be.calledWithExactly(parameters);
	}));
});
