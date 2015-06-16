var FileLoader = require('../');
var expect = require('chai').expect;
var suspend = require('suspend');
var path = require('path');
var url = require('url');
var nock = require('nock');


describe('file-loader', function () {
	var fileLoader = FileLoader.create({
		max: 500,
		length: function (value) {
			return 1;
		}
	});


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
			it('options.dirname defaults to the current working directory', function () {
				expect(module.__dirname).to.equal(path.resolve());
			});
			it('options.dirname overrides a modules default __dirname', function () {
				return suspend.promise(function * () {
					var domain = 'http://test.com';
					var filePath = '/index.js';
					var uri = url.resolve(domain, filePath);
					var scope = nock(domain)
						.get(filePath)
						.replyWithFile(200, path.resolve(__dirname, './assets/index.js'));
					var dirname = path.resolve(__dirname, 'assets');
					module = yield fileLoader.load(uri, {dirname: dirname});
					scope.done();
					expect(module.__dirname).to.equal(dirname);
				})();
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


		it('options.basePath defaults to the current working directory of the process', function () {
			return suspend.promise(function * () {
				var filePath = './' + path.relative(path.resolve('.'), path.resolve(__dirname, './assets/file.txt'));
				var file = yield fileLoader.load(filePath);
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
				var filePath = path.resolve(__dirname, './assets/index.js');
				var module = yield fileLoader.load(filePath, {dirname: __dirname});
				expect(module.__dirname).to.equal(__dirname);
			})();
		});


		it('paths in an object can be loaded', function () {
			return suspend.promise(function * () {
				var paths = {
					file: path.resolve(__dirname, './assets/file.txt'),
					module: path.resolve(__dirname, './assets/index.js'),
					property: 0,
					object: {one: 1},
					fn: function () {
					}
				};
				var files = yield fileLoader.load(paths);
				expect(files.file).to.be.a('string')
					.and.to.equal('Text');
				expect(files.module).to.be.an('object');
				expect(files.property).to.equal(paths.property);
				expect(files.object).to.equal(paths.object);
				expect(files.fn).to.equal(paths.fn);
			})();
		});


		describe('remote file caching', function () {
			var domain = 'http://test.com';
			var filePath = '/file.txt';
			var eTag = 1;
			var lastModified = new Date();
			it('add file to cache if not present and retrieve file from cache if not modified', function () {
				return suspend.promise(function * () {
					var scope;

					// nock file, reply with contents body, and etag, last modified headers
					scope = nock(domain)
						.get(filePath)
						.replyWithFile(200, path.resolve(__dirname, './assets/file.txt'), {
							'ETag': eTag,
							'Last-Modified': lastModified
						});
					// load file (loader should cache it)
					var file = yield fileLoader.load('./file.txt', {basePath: domain});
					scope.done();
					expect(file).to.be.a('string')
						.and.to.equal('Text');

					// nock file again, expect previous etag last modified headers, reply 304 with no body
					scope = nock(domain, {
							reqheaders: {
								'If-Modified-Since': lastModified,
								'If-None-Match': eTag
							}
						})
						.get(filePath)
						.reply(304);
					// load file again (should be loaded from cache this time)
					var cachedFile = yield fileLoader.load('./file.txt', {basePath: domain});
					scope.done(); // throws if network mock not called
					expect(cachedFile).to.be.a('string')
						.and.to.equal('Text');

					// file and cachedFile contents should match
					expect(file).to.equal(cachedFile);
				})();
			});
			it('add file to cache if modified', function () {
				return suspend.promise(function * () {
					// file already cached in previous test ...

					var eTag2 = eTag + 1;
					var lastModified2 = new Date();

					// create nock expecting headers, reply 200 with new file and new last modified and etag
					var scope;
					scope = nock(domain, {
							reqheaders: {
								'If-Modified-Since': lastModified,
								'If-None-Match': eTag
							}
						})
						.get(filePath)
						.replyWithFile(200, path.resolve(__dirname, './assets/file2.txt'), {
							'ETag': eTag2,
							'Last-Modified': lastModified2
						});

					// load file (new version should get cached and be returned)
					var file2 = yield fileLoader.load('./file.txt', {basePath: domain});
					scope.done(); // throws if network mock not called
					expect(file2).to.be.a('string')
						.and.to.equal('Text2');

					// nock file again, expect previous etag last modified headers, reply 304 with no body
					scope = nock(domain, {
							reqheaders: {
								'If-Modified-Since': lastModified2,
								'If-None-Match': eTag2
							}
						})
						.get(filePath)
						.reply(304);
					// load file again (should be loaded from cache this time)
					var cachedFile2 = yield fileLoader.load('./file.txt', {basePath: domain});
					scope.done(); // throws if network mock not called
					expect(cachedFile2).to.be.a('string')
						.and.to.equal('Text2');

					// file and cachedFile contents should match
					expect(file2).to.equal(cachedFile2);
				})();
			});
			// reset cache
		});


		// throw ... ?
		it('throw error on unrecognized response code', function () {
			return suspend.promise(function * () {
				var domain = 'http://test.com';
				var filePath = '/file.txt';
				var scope = nock(domain)
					.get(filePath)
					.reply(403);
				try {
					yield fileLoader.load('./file.txt', {basePath: domain});
				}
				catch (error) {
					expect(error).to.match(/Unrecognized statusCode/);
				}
			})();
		});
	});
});
