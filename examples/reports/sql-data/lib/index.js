const capitalize = require('underscore.string/capitalize');
const co = require('co');
const inline = require('inline-html');
const moment = require('moment');
const path = require('path');
const sql = require('mysql');
const Treeize = require('treeize');

const connect = (connection) => new Promise((resolve, reject) =>
  connection.connect((error) => error ? reject(error) : resolve())
);
const execute = (connection, query) => new Promise((resolve, reject) =>
  connection.query(query, (error, results) => error ? reject(error) : resolve(results))
);

const context = co.wrap(function * () {

  // Connect to SQL server
  const connection = sql.createConnection({
    host: 'ensembldb.ensembl.org',
    port: '3306',
    user: 'anonymous',
    database: 'homo_sapiens_core_82_38'
  });
  yield connect(connection);

  // Query database
  const query = `
    SELECT
      gene.biotype AS "biotypes:biotype",
        gene.stable_id AS "biotypes:genes:id",
        gene.description AS "biotypes:genes:description"
    FROM gene
    LIMIT 30
  `;
  const results = yield execute(connection, query);
  connection.end();

  // unflatten
  const tree = new Treeize();
  tree.grow(results);
  const biotypes = tree.getData();

  return {
    title: 'Genes by Biotype',
    biotypes
  };
});

const definition = co.wrap(function * () {
  return {
    context,
    helpers: {
      capitalize: (value) => capitalize(value),
  		formatDate: (date, type) => moment(date).format(type)
  	},
    partials: {
  		page: '<span style="content: counter(page)"></span>',
  		pages: '<span style="content: counter(pages)"></span>'
  	},
    template: yield inline.file(path.resolve(__dirname, './template.hbs'))
  };
});

module.exports = definition;
