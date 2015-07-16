var fs = require('fs');
var path = require('path');
var datauri = require('datauri');

module.exports = {
	page: '<span style="content: counter(page)"></span>',
	pages: '<span style="content: counter(pages)"></span>',
	fullName: fs.readFileSync(path.resolve(__dirname, './fullName.html'), 'utf8'),
	logo: datauri(path.resolve(__dirname, '../assets/images/panoLogo.png')),
	micr: fs.readFileSync(path.resolve(__dirname, './micr/main.html'), 'utf8'),
	micrFont: datauri(path.resolve(__dirname, './micr/PrecisionID MICR.ttf'))
};