var fileLoader = require('../');
var expect = require('chai').expect;
var suspend = require('suspend');
var path = require('path');
var url = require('url');
var nock = require('nock');

// Next:
// TODO add support for remote file and module loading

// Later:
// TODO add support for manifest to be an array of paths (i.e. [path])
// TODO support ./assets/index -> ./assets/index.js (like require)
// TODO support ./assets -> ./assets/index.js (like require)
// TODO override default basePath on fileLoader instance in addition to #load options
//   could be a more robust way of loading from calling module __dirname instead of using callsite() ...
// TODO override default dirname on fileLoader instance in addition to #load options
// TODO add support to #load for [option.encoding='utf8']
//	 problem here is that each file in an object of paths may need different encoding and this will force all of
// 	 them to have the same value ...
// ? should loader return buffer by default with encoding option?
// ? support relative path/to/file with basePath for local files?
	// require.resolve doesn't ...
// /path/to/file with basePath
	// have to assume this is an absolute path since basePath is always defaulted
	// UNLESS basePath is a Url, then this is a valid relative path ...


describe('file-loader', function () {
	describe('#load', function () {


		describe('local file', function () {
			var testPath = suspend.promise(function * (path, options) {
				var file = yield fileLoader.load(path, options);
				expect(file).to.be.a('string')
					.and.to.equal('Text');
			});
			it('absolute path: /path/to/file.ext', function () {
				var absolutePath = path.join(__dirname, './assets/file.txt');
				return testPath(absolutePath);
			});
			it('relative path: ./path/to/file.ext', function () {
				return testPath('./assets/file.txt', {basePath: __dirname});
			});
			it('relative path: ../path/to/file.ext', function () {
				return testPath('../file.txt', {basePath: path.join(__dirname, 'assets/mock/')});
			});
		});


		describe('remote file', function () {
			var domain = 'http://test.com';
			var filePath = '/file.txt';
			var scope;
			beforeEach(function () {
				scope = nock(domain)
					.get(filePath)
					.replyWithFile(200, path.resolve(__dirname, './assets/file.txt'));
			});
			var testPath = suspend.promise(function * (path, options) {
				var file = yield fileLoader.load(path, options);
				scope.done(); // throws if network mock not called
				expect(file).to.be.a('string')
					.and.to.equal('Text');
			});
			afterEach(function () {
				nock.cleanAll();
			});
			it('fully qualified uri', function () {
				var uri = url.resolve(domain, filePath);
				return testPath(uri);
			});
			it('relative url: file.txt', function () {
				return testPath('file.txt', {basePath: domain});
			});
			it('relative url: /file.txt', function () {
				return testPath('/file.txt', {basePath: domain});
			});
			it('relative url: ./file.txt', function () {
				return testPath('./file.txt', {basePath: domain});
			});
			it('relative url: ../file.txt', function () {
				return testPath('../file.txt', {basePath: domain + '/child/'});
			});
		});


		describe('local module', function () {
			var filePath = path.resolve(__dirname, './assets/index.js');
			var module;
			it('load module', function () {
				return suspend.promise(function * () {
					module = yield fileLoader.load(filePath);
					expect(module).to.be.an('object');
				})();
			});
			it('options.dirname defaults to the local file directory', function () {
				expect(module.__dirname).to.equal(path.dirname(filePath));
			});
			it('require native module', function () {
				var native = module.require('path');
				expect(native).to.be.an('object');
			});
			it('require installed module', function () {
				var installed = module.require('installed');
				expect(installed).to.be.an('object');
			});
			it('require relative module', function () {
				var relative = module.require('./relative');
				expect(relative).to.be.an('object');
			});
		});


		describe('remote module', function () {
			var module;
			it('load module', function () {
				return suspend.promise(function * () {
					var domain = 'http://test.com';
					var filePath = '/index.js';
					var uri = url.resolve(domain, filePath);
					var scope = nock(domain)
						.get(filePath)
						.replyWithFile(200, path.resolve(__dirname, './assets/index.js'));
					module = yield fileLoader.load(uri);
					scope.done();
					expect(module).to.be.an('object');
				})();
			});
			it('options.dirname defaults to the calling modules directory', function () {
				expect(module.__dirname).to.equal(__dirname);
			});
			it('require native module', function () {
				var native = module.require('path');
				expect(native).to.be.an('object');
			});
			it('require installed module', function () {
				var installed = module.require('installed');
				expect(installed).to.be.an('object');
			});
			it('require relative module', function () {
				var relative = module.require('./assets/relative');
				expect(relative).to.be.an('object');
			});
		});


		it('options.basePath defaults to the __dirname of the script file calling the loader', function () {
			return suspend.promise(function * () {
				var file = yield fileLoader.load('./assets/file.txt');
				expect(file).to.be.a('string')
					.and.to.equal('Text');
			})();
		});
		it('options.basePath overrides the default base path used to resolve relative paths', function () {
			return suspend.promise(function * () {
				var file = yield fileLoader.load('./file.txt', {basePath: path.resolve(__dirname, 'assets')});
				expect(file).to.be.a('string')
					.and.to.equal('Text');
			})();
		});


		it('options.dirname overrides a modules default __dirname', function () {
			return suspend.promise(function * () {
				var module = yield fileLoader.load('./assets/index.js', {dirname: __dirname});
				expect(module.__dirname).to.equal(__dirname);
			})();
		});


		it('paths in an object can be loaded', function () {
			return suspend.promise(function * () {
				var paths = {
					file: './assets/file.txt',
					module: './assets/index.js',
					property: 'test'
				};
				var files = fileLoader.load(paths);
				expect(files.file).to.be.a('string')
					.and.to.equal('Text');
				expect(files.module).to.be.an('object');
				expect(files.property).to.equal(paths.property);
			});
		});


		// throw ... ?
	});
});
