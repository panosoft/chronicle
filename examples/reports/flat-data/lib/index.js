const capitalize = require('underscore.string/capitalize');
const co = require('co');
const inlineHtml = require('inline-html');
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

const data = co.wrap(function * () {

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
  /**
    [
      {
        'biotypes:name': 'Mt_tRNA',
        'biotypes:genes:id': 'ENSG00000210049',
        'biotypes:genes:description': 'mitochondrially encoded tRNA phenylalanine [Source:HGNC Symbol;Acc:HGNC:7481]'
      },
      {
        'biotypes:name': 'Mt_rRNA',
        'biotypes:genes:id': 'ENSG00000211459',
        'biotypes:genes:description': 'mitochondrially encoded 12S RNA [Source:HGNC Symbol;Acc:HGNC:7470]'
      },
      ...
    ]
   */

  // unflatten
  const tree = new Treeize();
  tree.grow(results);
  const biotypes = tree.getData();
  /**
    [
      {
        biotype: 'Mt_tRNA',
        genes: [
          { id: 'ENSG00000210049', description: 'mitochondrially encoded tRNA phenylalanine [Source:HGNC Symbol;Acc:HGNC:7481]' },
          ...
        ]
      },
      {
        biotype: 'Mt_rRNA',
        genes: [
          { id: 'ENSG00000211459', description: 'mitochondrially encoded 12S RNA [Source:HGNC Symbol;Acc:HGNC:7470]' },
          ...
        ]
      },
      ...
    ]
   */

  return {
    title: 'Genes by Biotype',
    biotypes
  };
});

const definition = co.wrap(function * () {
  return {
    data: data,
    helpers: {
      capitalize: (value) => capitalize(value),
  		formatDate: (date, type) => moment(date).format(type)
  	},
    partials: {
  		page: '<span style="content: counter(page)"></span>',
  		pages: '<span style="content: counter(pages)"></span>'
  	},
    template: yield inlineHtml(path.resolve(__dirname, './template.hbs'))
  };
});

module.exports = definition;
