var path = require('path');
var fs = require('fs');
var suspend = require('suspend');
var Phantom = require('../phantom');
// d3 required below
// c3 required below

var create = suspend.promise(function * (options) {
	// js
	var dependencies = [
		path.join(__dirname, '../../node_modules/d3/d3.js'),
		path.join(__dirname, '../../node_modules/c3/c3.js')
	];
	// css
	var css = [
		path.join(__dirname, '../../node_modules/c3/c3.min.css')
	];
	var c3Css = fs.readFileSync(css[0], 'utf8');
	c3Css = '<style>' + c3Css + '</style>';
	// render // function runs on phantom page (input -> html)
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

	var phantom = yield Phantom.create();
	var generate = suspend.promise(function * (config) {
		var page = yield phantom.createPage();
		yield page.injectJs(dependencies);
		// render html
		var output = yield page.evaluate(render, config);
		output = c3Css + output;
		page.close();
		return output;
	});
	return {
		generate: generate,
		shutdown: phantom.exit
	}
});
module.exports = {
	create: create
};