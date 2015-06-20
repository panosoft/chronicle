var path = require('path');
var fs = require('fs');
var suspend = require('suspend');
var resume = suspend.resume;
var Phantom = require('../phantom');
// d3 required below
// c3 required below

var create = function (options) {
	// options // Note: render function is evaluated on phantom page (input -> html)
	var js = [
		path.join(__dirname, '../../node_modules/d3/d3.js'),
		path.join(__dirname, '../../node_modules/c3/c3.js')
	];
	var css = [
		path.join(__dirname, '../../node_modules/c3/c3.min.css')
	];
	var render = function (config) {
		var container = document.createElement('div');
		document.body.appendChild(container);
		config = config || {};
		config.bindto = container;
		config.interaction = {
			enabled: false
		};
		config.tooltip = {
			show: false
		};
		config.transition = {
			duration: 0
		};
		var chart = c3.generate(config);
		var done = function () {
			// remove hidden elements from svg since some have no height attribute which cause issues with prince
			var hiddenElements = Array.prototype.slice.apply(container.querySelectorAll('[style*="visibility: hidden"]'));
			hiddenElements.forEach(function (element) {
				element.parentNode.removeChild(element);
			});
			var html = document.body.innerHTML;
			// cleanup
			chart = chart.destroy();
			container = container.parentNode.removeChild(container);
			// return chart html
			window.callPhantom(html);
		};
		// HACK!!! to overcome svg render delay .. no innerHTML until 2ms or greater after generate
		setTimeout(done, 2);
	};

	var initialized;
	var phantom;
	var style;
	var initialize = suspend.promise(function * () {
		if (initialized) throw new Error('Already initialized');
		// Load css style block
		style = yield fs.readFile(css[0], 'utf8', resume());
		style = '<style>' + style + '</style>';
		phantom = Phantom.create();
		yield phantom.initialize();
		initialized = true;
	});
	var shutdown = function () {
		phantom.shutdown();
	};
	var generate = suspend.promise(function * (config) {
		if (!initialized) throw new Error('Not initialized');
		var page = yield phantom.createPage();
		yield page.injectJs(js);
		var output = yield page.evaluate(render, config);
		output = style + output;
		page.close();
		return output;
	});
	return {
		initialize: initialize,
		shutdown: shutdown,
		generate: generate
	}
};
module.exports = {
	create: create
};