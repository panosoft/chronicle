var expect = require('chai').expect;
var fs = require('fs');
var path = require('path');
var requireString = require('../index.js');
var filename = 'stringModule.js';
var filePath = path.resolve(path.join(__dirname, './modules', filename));
var file = fs.readFileSync(filePath, 'utf8');
var stringModule;

describe('requireString', function () {
	// TODO test interface
	// TODO test argument defaults
	it('should load a module from a string', function () {
		stringModule = requireString(file, filePath);
		expect(stringModule).to.be.an('object');
	});
	it('should return module.exports', function () {
		expect(stringModule).to.equal(stringModule.module.exports);
	});
});
describe('Module loaded from String', function () {
	it('should have proper __filename', function () {
		expect(stringModule.__filename).to.equal(filePath);
	});
	it('should have proper __dirname', function () {
		expect(stringModule.__dirname).to.equal(path.dirname(filePath));
	});
	it('should have proper module.id matching filename', function () {
		expect(stringModule.module.id).to.equal(filePath);
	});
	it('should have proper module.paths', function () {
		var paths = stringModule.module.paths;
		expect(paths).to.be.an('array')
			.and.to.include(path.resolve(path.join(stringModule.__dirname, 'node_modules')));
	});
	it('should have a require that resolves relative to modules current directory', function () {
		// i.e. require.resolve('./') === path.resolve(__dirname)
		var resolvedPath = stringModule.require.resolve('./' + filename);
		var dirnamePath = path.resolve(path.join(stringModule.__dirname, filename));
		expect(resolvedPath).to.equal(dirnamePath);
	});
	it('should be able to require native modules.', function () {
		expect(stringModule.require('path')).to.be.an('object')
			.and.to.include.keys('resolve');
	});
	it('should be able to require installed modules.', function () {
		expect(stringModule.require('installedModule')).to.be.an('object')
			.and.to.include.keys('name');
	});
	it('should be able to require relative modules.', function () {
		expect(stringModule.require('./relativeModule')).to.be.an('object')
			.and.to.include.keys('name');
	});
});