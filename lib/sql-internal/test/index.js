var sql = require('../');
var expect = require('chai').expect;
var suspend = require('suspend');
var nock = require('nock');

var appUrl = 'http://test.com/App/';
var authToken = 'uuid';

describe('#execute', function () {

	it('exist', function () {
		expect(sql.execute).to.be.a('function');
	});

	it('make request', function () {
		return suspend.promise(function * () {
			var scripts = ['SELECT number FROM User', 'SELECT number FROM Clients'];
			var sqlCmd = scripts.join(';');
			var scope = nock(appUrl)
				.post('/SQLInternal', {
					authToken: authToken,
					sqlCmd: sqlCmd
				})
				.reply(200, {
					resultSets: [
						{fields: ['number'], types: ['int'], rows: [[1], [2], [3]]},
						{fields: ['number'], types: ['int'], rows: [[4], [5], [6]]}
					]
				});

			var resultSets = yield sql.execute(scripts, {appUrl: appUrl, authToken: authToken});

			scope.done();
			expect(resultSets).to.be.an('array');
		})();
	});

	it('throw on http request error', function () {
		return suspend.promise(function * () {
			nock.disableNetConnect();
			var scripts = 'SELECT 1';
			try {
				var resultSets = yield sql.execute(scripts, {appUrl: appUrl, authToken: authToken});
			}
			catch (error) {
				expect(error).to.exist;
			}
			nock.enableNetConnect();
		})();
	});

	it('throw on status code error', function () {
		return suspend.promise(function * () {
			var scope = nock(appUrl)
				.post('/SQLInternal')
				.reply(404);
			var scripts = 'SELECT 1';
			try {
				var resultSets = yield sql.execute(scripts, {appUrl: appUrl, authToken: authToken});
			}
			catch (error) {
				expect(error).to.exist
					.and.to.match(/Unexpected statusCode/);
			}
			scope.done();
		})();
	});

	it('throw on SQLInternal error', function () {
		return suspend.promise(function * () {
			var scope = nock(appUrl)
				.post('/SQLInternal')
				.reply(200, {
					error: 'SQLInternal error'
				});
			var scripts = '1';
			try {
				var resultSets = yield sql.execute(scripts, {appUrl: appUrl, authToken: authToken});
			}
			catch (error) {
				expect(error).to.exist;
			}
			scope.done();
		})();
	});

});