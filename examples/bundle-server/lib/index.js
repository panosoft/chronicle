const express = require('express');
const path = require('path');

const reportsPath = path.resolve(__dirname, '../../reports');

// Create a static server that serves up the reports directory
const app = express();
app.use('/', express.static(reportsPath));

// Start the server
const server = app.listen(8888, 'localhost', () => {
  const address = server.address().address;
  const port = server.address().port;
  console.log(`Chronicle bundle server started: ${address}:${port}`);
  console.log(`Serving static files from: ${reportsPath}`);
});
