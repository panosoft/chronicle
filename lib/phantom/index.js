var _ = require('lodash');
var suspend = require('suspend');
var resume = suspend.resume;
var resumeRaw = suspend.resumeRaw;
var PhantomJs = require('PhantomJs');
var Phantom = require('phantom');

// Create a running phantom process
var create = function (options) {
	options = options || {};
	options.binary = PhantomJs.path;

	// Error handlers
	// TODO fix // resume doesn't work here // want to be able to throw and have it caught
	//	options.onStderr = console.log; // (data) // contains ???
	//	options.onStdout = console.log; // (data) // contains browser js errors when evaluating code on a page
	//	options.onExit(code, signal)

	var initialized;
	var phantom;
	var initialize = suspend.promise(function * () {
		if (initialized) throw new Error('Already initialized');
		// TODO handle creating mult phantoms by passing unique port number to each instance // options.port
		var resume = suspend.resume();
		phantom = yield Phantom.create(options, function (phantom) {
			resume(null, phantom);
		});
		initialized = true;
	});
	var shutdown = function () {
		if (!initialized) throw new Error('Not initialized');
		phantom.exit();
	};
	var createPage = suspend.promise(function * (options) {
		if (!initialized) throw new Error('Not initialized');
		options = _.defaults(options || {}, {
			viewportSize: {width: 1024, height: 768}
		});
		// TODO error handling?
		var page = (yield phantom.createPage(resumeRaw()))[0];

		/**
		 * Injects js files from the given paths. They are loaded on the page in the order they are supplied so that
		 * dependencies can be met.
		 *
		 * @param {String|String[]} paths
		 *    File paths to the js files to inject.
		 */
		var injectJs = suspend.promise(function * (paths) {
			paths = (_.isArray(paths)) ? paths : [paths];
			for (var i = 0; i < paths.length; i++) {
				var path = paths[i];
				var resume = suspend.resume();
				yield page.injectJs(path, function (success) {
					success ? resume(null, path) : resume(new Error('Failed to inject: ' + path));
				});
			}
		});
		/**
		 * Evaluate a function on a page.
		 *
		 * @param {Function} fn
		 *    Function to evaluate on page.
		 *    Must call `window.callPhantom(result)` to return.
		 * @param {*} arg
		 *    Argument to pass to fn when evaluated on page.
		 *    Only JSON-serializable arguments can be passed (i.e. Closures, functions, DOM nodes, etc. will not work!)
		 *
		 * @returns {*} result
		 */
		var evaluate = suspend.promise(function * (fn, arg) {
			var resume = suspend.resume();
			page.set('onError', function (message, trace) { // (msg, trace)
				console.log(message, trace);
				// TODO process trace and add to message as error output
				resume(message);
			});
			page.set('onCallback', function (result) {
				page.set('onCallback', null);
				resume(null, result);
			});
			var result = yield page.evaluate(fn, null, arg);
			return result;
		});

		// Initialize page
		// TODO run through all supplied options here dynamically
		// TODO consider // any error cactching we can do while setting page options?
		var viewportSize = (yield page.set('viewportSize', options.viewportSize, resumeRaw()))[0];
		yield injectJs(require.resolve('es5-shim'));
		return {
			close: page.close,
			evaluate: evaluate,
			injectJs: injectJs
		};
	});
	return {
		initialize: initialize,
		shutdown: shutdown,
		createPage: createPage
	};
};
module.exports = {
	create: create
};