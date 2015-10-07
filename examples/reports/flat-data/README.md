# Flat Data Report

This Report Module has a data function that fetches flat data from a SQL server and uses [Treeize](https://github.com/kwhitley/treeize) to give that data a hierarchical structure.

This Report demonstrates some useful techniques for creating reports with flat data sources.

# Installation

To install and run this report, run the following in Terminal:

```sh
npm install
npm test
```

After running the above commands, the report pdf should open in a new window of your systems preferred pdf viewer. If it does not open automatically, the pdf can be found within the [`test/`](test/) directory after running `npm test`.

# Description

This Report pulls data from the [Ensembl](http://www.ensembl.org/index.html) SQL database and outputs a short list of human genes, grouped by their biotype. In terms of structure, it is very similar to our [Dynamic](../dynamic) report example. Thus, if you have questions to that effect, please reference that example.

That said, the notable difference here is that this report pulls it's data from an API that returns a flat data structure (i.e. a SQL result set). This poses a challenge because we often want to provide our report templates with hierarchical data structures (i.e. nested js objects) that make it simple to create rich reports. As you'll see, we can leverage the [Treeize](https://github.com/kwhitley/treeize) library to overcome this challenge with little effort.

Let's step through this Report Module's `data` function which can be found within its entry file ([`lib/index.js`](lib/index.js)). We begin by connecting to the [Ensembl](http://www.ensembl.org/index.html) database and run a simple query. In this query, according to the [Treeize](https://github.com/kwhitley/treeize) conventions, we assign column names that outline the hierarchical structure we would like to obtain as our final output. Names that end in `s` indicate collections and the `:` character is used as a delimiter to indicate nesting.

The result of that query is a flat data set with our custom column names:

```js
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
```

Next, we use Treeize to unflatten the data and obtain the following hierarchical structure:

```js
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
```

Finally, the grouped data is combined with any other data that needs to be supplied to the report template and the result is returned.

Aside from this `data` function, the rest of this report operates in an almost identical fashion as the [Dynamic](../dynamic) report example. You can reference that [example](../dynamic) for further explanation or examine the test script for this report ([`test/index.js`](test/index.js)) to see how the report is run.
