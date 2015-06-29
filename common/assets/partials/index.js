var fs = require('fs');
var path = require('path');

module.exports = {
	localPartialEmbedded: 'Local Partial Embedded',
	localPartialImported: fs.readFileSync(path.resolve(__dirname, './localPartialImported.html'), 'utf8')
};