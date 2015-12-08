const bundle = require('../../lib/bundler');
const path = require('path');

bundle(path.resolve(__dirname, '../fixtures/report.js'));
