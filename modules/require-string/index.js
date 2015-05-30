var Module = require('module');
var path = require('path');

// NOTE: Taken from node module.js (line 464) and used as in node modules.js (line 478)
function stripBOM(content) {
	// Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
	// because the buffer-to-string conversion in `fs.readFileSync()`
	// translates it to FEFF, the UTF-16 BOM.
	if (content.charCodeAt(0) === 0xFEFF) {
		content = content.slice(1);
	}
	return content;
}

/**
 *
 * @param {String} content
 * @param {String} [filename='']
 * @returns {*} exports
 */
var requireString = function (content, filename) {
	filename = filename || ''; // Todo consider // resolve filename based on parent (i.e. module calling requireString)?
	var m = new Module(filename);
	m.filename = filename;
	m.paths = Module._nodeModulePaths(path.dirname(filename));
	m._compile(stripBOM(content), filename);
	return m.exports;
};

module.exports = requireString;