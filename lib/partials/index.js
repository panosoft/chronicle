var fs = require('fs');
var path = require('path');

module.exports = {
	fullName: fs.readFileSync(path.resolve(__dirname, './fullName.html'), 'utf8'),
	micr: fs.readFileSync(path.resolve(__dirname, './micr.html'), 'utf8')
};