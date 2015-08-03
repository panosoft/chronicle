var inline = require('inline-html');
var path = require('path');

module.exports = {
	html: inline(path.resolve(__dirname, './index.html'))
};
