var Phantom = require('../');
var expect = require('chai').expect;

// Phantom.create
	// takes all options that phantom-node lib recognizes
	// options.binary always overridden
// phantom.createPage
	// takes all options that phantom-node lib recognizes
	// defaults viewportSize 1024 x 768
// phantom.exit
	// should not be able to do anything after this is called
// page.close
	// should not be able to operate on page after this is called
// page.evaluate
	// accepts fn {Function}, arg {*}
	// returns promise
	// rejects with error if js error occurs while eval fn
	// resolves with fn output if success
// page.injectJs
	// accepts String | String[]
	// injects files in order
	// throws if fail
	// returns path if success