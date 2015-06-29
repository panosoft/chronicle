var fs = require('fs');
var path = require('path');

module.exports = {
	page: '<span style="content: counter(page)"></span>',
	pages: '<span style="content: counter(pages)"></span>',
	fullName: fs.readFileSync(path.resolve(__dirname, './fullName.html'), 'utf8'),
	micr: fs.readFileSync(path.resolve(__dirname, './micr.html'), 'utf8')
};