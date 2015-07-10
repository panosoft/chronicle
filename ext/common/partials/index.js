var fs = require('fs');
var path = require('path');
var datauri = require('datauri');

module.exports = {
	page: '<span style="content: counter(page)"></span>',
	pages: '<span style="content: counter(pages)"></span>',
	fullName: fs.readFileSync(path.resolve(__dirname, './fullName.html'), 'utf8'),
	logo: datauri(__dirname + '/../assets/images/panoLogo.png'),
	micr: fs.readFileSync(path.resolve(__dirname, './micr.html'), 'utf8'),
	micrFont: datauri(__dirname + '/../assets/fonts/PrecisionID MICR.ttf') // TODO fix urify so that path.resolve can be used here
};