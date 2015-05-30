var fileLoader = require('../');
var expect = require('chai').expect;
var suspend = require('suspend');


// load local file (e.g. *.html) -> string contents
// accept string absolute path ('/path/to/file.ext')
// accept string relative path with option.basePath ('./path/to/file.ext' with basePath: '/base/path/')
// accept string relative path with option.basePath ('../path/to/file.ext' with basePath: '/base/path/')

// * load remote file (e.g. *.html) -> string contents
// * accept string absolute url ('http://name.domain/path/to/file.ext')
// * accept string relative url with option.basePath ('path/to/file.ext' with basePath: 'http://name.domain/')
// * accept string relative url with option.basePath ('/path/to/file.ext' with basePath: 'http://name.domain/')
// * accept string relative url with option.basePath ('./path/to/file.ext' with basePath: 'http://name.domain/')
// * accept string relative url with option.basePath ('../path/to/file.ext' with basePath: 'http://name.domain/')


// load local js module (*.js) -> object module
// require local modules from within loaded module
	// native module
	// installed module
	// relative module

// * load remote js module with option.moduleDirname to set as base directory for its require.resolve (js) -> object module
// * require local modules from within loaded module relative to option.moduleDirname
	// native module
	// installed module
	// relative module


// load multiple files and modules (e.g. {name: *.html | *.js} -> object {name: contents | module})
// accept object with some properties string paths or urls {a: path, b:1}


// throw ... ?