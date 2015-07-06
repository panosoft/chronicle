var sql = require('../');
var expect = require('chai').expect;
var suspend = require('suspend');
var nock = require('nock');
var ip = require('ip');

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
					sqlCmd: sqlCmd,
					ipAddress: ip.address()
				})
				.reply(200, [
					{fields: ['boolean'], types: ['bit'], rows: [['true'], ['false']]},
					{fields: ['date'], types: ['date'], rows: [['1/1/15'], ['2/1/15 EST']]},
					{fields: ['number'], types: ['bigint'], rows: [['1']]},
					{fields: ['string'], types: ['varchar'], rows: [['a']]},
					{fields: ['id', 'items.name'], types: ['bigint', 'varchar'], rows: [['1', 'a'], ['1', 'b'], ['1', 'c']]}
				]);

			var resultSets = yield sql.execute(scripts, {appUrl: appUrl, authToken: authToken});

			scope.done();
			expect(resultSets).to.be.an('array');
			console.dir(resultSets, {depth: null});
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