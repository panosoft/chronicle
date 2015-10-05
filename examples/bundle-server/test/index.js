const co = require('co');
const chronicle = require('@panosoft/chronicle');
const fs = require('fs');
const open = require('open');
const path = require('path');
const prince = require('prince-promise');

const reportUrl = 'http://localhost:8888/dynamic/bundle.js';
const parameters = {
	sort: 'stars',
	results: 30
};

co(function * () {
  var press;
  try {
    press = chronicle.Press.create();
    yield press.initialize();

    // Run and render report
    var html = yield press.run(reportUrl, parameters);
    var pdf = yield prince(html);

    // Save output
    fs.writeFileSync(path.resolve(__dirname,'./test.html'), html);
    fs.writeFileSync(path.resolve(__dirname,'./test.pdf'), pdf);

    open(path.resolve(__dirname,'./test.pdf'));
  }
  catch (error) {
    console.error(error.stack);
  }
  finally {
    press.shutdown();
  }
});
