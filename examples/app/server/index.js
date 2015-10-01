const chronicle = require('@panosoft/chronicle');
const co = require('co');
const express = require('express');
const parse = require('co-body');
const path = require('path');
const prince = require('prince-promise');

co(function * () {
  // Start the presses!
  const press = chronicle.Press.create();
  yield press.initialize();

  // Configure express routes
  var app = express();
  /**
   * / route
   *
   * Used to serve the frontend client.
   */
  app.use('/', express.static(path.resolve(__dirname, '../client')));
  /**
   * /reports route
   *
   * request: (POST)
   * JSON Object containing the following properties
   * - `path` - A string path to report module entry file (relative to ``../reports` dir).
   * - `report` - _(Optional)_ An object of parameters passed to Chronicle while running the report.
   * - `renderer` - _(Optional)_ An object of parameters passed to PrinceXml while rendering the report.
   *
   * response: (error)
   * JSON Object containing the following properties
   * - `error` - A string describing the error encountered.
   *
   * response: (success)
   * Binary buffer of pdf file contents (Content-Type: application/pdf)
   */
  app.post('/reports', co.wrap(function * (request, response) {
    try {
      const body = yield parse.json(request);
      console.log('Running report:', body);
      const reportPath = path.resolve(__dirname, '../../reports', body.path);
      const html = yield press.run(reportPath, body.report);
      const pdf = yield prince(html, body.renderer);
      response.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Length': pdf.length
      });
      response.end(pdf);
    }
    catch (error) {
      console.error(error);
      response.writeHead(500);
      response.end(JSON.stringify({ error: error.toString() }));
    }
  }));

  // Start the server
  const server = app.listen(8080, 'localhost', () => {
    const address = server.address().address;
    const port = server.address().port;
    console.log(`Chronicle simple server started: ${address}:${port}`);
  });
});
