# Chronicle

Build data driven reports using Web Standards and run them with Node.

[![npm version](https://img.shields.io/npm/v/html-inlinify.svg)](https://www.npmjs.com/package/@panosoft/chronicle)
[![npm license](https://img.shields.io/npm/l/html-inlinify.svg)](https://www.npmjs.com/package/@panosoft/chronicle)
[![Travis](https://img.shields.io/travis/panosoft/html-inlinify.svg)](https://travis-ci.org/panosoft/chronicle)
[![David](https://img.shields.io/david/panosoft/html-inlinify.svg)](https://david-dm.org/panosoft/chronicle)
[![npm downloads](https://img.shields.io/npm/dm/html-inlinify.svg)](https://www.npmjs.com/package/@panosoft/chronicle)

## Installation

```sh
npm install @panosoft/chronicle
```

## Usage

Reports can be run from the command line:

```sh
chronicle run index.js
```

Or using the node api:

```js
var chronicle = require('@panosoft/chronicle');
var press = chronicle.Press.create();

press.initialize()
  .then(function () {
    return press.run('index.js');
  })
  .then(function (html) {
    press.shutdown();
    // ...
  });
```

Then, using a renderer like [PrinceXML](http://www.princexml.com/) that supports [CSS Paged Media](https://drafts.csswg.org/css-page-3/), you can take the report HTML and render it as a paginated PDF complete with repeating page headers and footers, page numbers, etc.!

If [PrinceXML](http://www.princexml.com/) is installed, we can use the command line:

```sh
chronicle run index.js | prince - -o report.pdf
```

Alternately, we can use the [`prince-promise`](https://www.npmjs.com/package/prince-promise) library alongside the node api:

```js
var chronicle = require('@panosoft/chronicle');
var prince = require('prince-promise');

var press = chronicle.Press.create();

press.initialize()
  .then(function () {
    return press.run('index.js');
  })
  .then(function (html) {
    press.shutdown();
    return prince(html);
  })
  .then(function (pdf) {
    // ...
  });
```

## CLI

- [`bundle`](#cli-bundle)
- [`run`](#cli-run)

---

<a name="cli-bundle"/>
#### bundle [entry] [--output] [--watch]

Bundles a report [`Module`](#Module) along with all of its dependencies into a single file called a bundle.

Bundles are completely self contained and thus very portable. For instance, bundles could be stored on a static file server and requested remotely by Chronicle [`Press`](#Press) when run.

__Arguments__

- `entry` - The main entry filename of a report [`Module`](#Module) to bundle. If an entry is not specified, the `package.json`'s' `main` property will be used. If the `package.json` doesn't exist or if the `main` property is not specified, then `index.js` will be used as the entry.
- `-o, --output` - The filename for the bundled module. Defaults to `bundle.js`.
- `-w, --watch` - Enable watch mode. As files are modified, the bundle will be updated automatically and incrementally.

__Examples__

```sh
chronicle bundle -w
```

```sh
chronicle bundle entry.js -o output.js -w
```

---

<a name="cli-run"/>
#### run [report] [--parameters] [--output]

Runs a report and returns the HTML produced.

__Arguments__

- `report` - The report to run. Supported values are:
  - A fully qualified url - Load a bundled report [`Module`](#Module) from a url.
  - A filename - Load a report [`Module`](#Module) (bundled or not) from the filesystem.
  - A JSON parseable string - The report [`Definition`](#Definition) to run.
  - No value - Read from `stdin`. The value passed in can be any of the above.
- `-o, --output` - The destination for the report HTML to be written. Supported values are:
  - A filename - Write to the filesystem.
  - No value - Write to `stdout`
- `-p, --parameters` - A JSON parseable string of parameters to run the report with.

__Examples__

```sh
chronicle run index.js
```

```sh
chronicle run bundle.js -o report.html -p '{"sample": "parameter"}'
```

## API

- [`bundle`](#bundle)
- [`Press.create`](#Press-create)

[`Press`](#Press)

- [`initialize`](#initialize)
- [`run`](#run)
- [`shutdown`](#shutdown)

---

<a name="bundle"/>
#### bundle ( entry , options )

Bundles a report [`Module`](#Module) along with all of its dependencies into a single file called a bundle.

Upon completion, the bundle is written directly to the filesystem per `output` option.

__Arguments__

- `entry` - The main entry filename of a report [`Module`](#Module) to bundle. If an entry is not specified, the `package.json`'s' `main` property will be used. If the `package.json` doesn't exist or if the `main` property is not specified, then `index.js` will be used as the entry.
- `options`
  - `output` - The filename for the bundled [`Module`](#Module). Defaults to `bundle.js`.
  - `watch` - A boolean used to enable watch mode. Supported values are:
    - `true` - The [`Module`](#Module) is bundled and as files are modified, the bundle is updated automatically and incrementally.
    - `false` - The [`Module`](#Module) is bundled once. _(default)_

__Example__

```js
var entry = 'index.js';
var options = {
  output: 'bundle.js'
};

chronicle.bundle(entry, options);
```

---

<a name="Press-create"/>
#### Press.create ( options )

Creates an instance of Chronicle [`Press`](#Press). Presses are used to run reports.

__Arguments__

- `options`
  -  `cacheMax` - A number used to determine the maximum number of remotely requested report [`Module`](#Module) bundles to cache. Once this limit is hit, the least recently used bundles will be replaced as new bundles are requested.

__Example__

```js
var press = chronicle.Press.create();
```

---

<a name="Press"/>
### Press

A tool used to run [`Report`](#Report)s and produce HTML output.

<a name="initialize"/>
#### initialize ( )

Initializes the press. This method must be called before the press can be used.

Returns a `Promise` that is fulfilled once the initialization is complete.

__Example__

```js
press.initialize()
  .then(function () {
    // ...
  })
```

---

<a name="run"/>
#### run ( report , parameters )

Runs a [`Report`](#Report) and returns a `Promise` that is fulfilled with the HTML produced.

The [`Report`](#Report) is loaded, data is retrieved, pre-processors are run, and the HTML output is finally produced and returned.

__Arguments__

- `report` - The [`Report`](#Report) to run. Supported values are:
  - A fully qualified url of a bundled report [`Module`](#Module).
  - A filename of a report [`Module`](#Module) (bundled or not).
  - A report [`Definition`](#Definition).
- `parameters` - An object of parameters used to run the report. This object is passed to various elements of the report [`Definition`](#Definition) at various stages of the report lifecycle.

__Examples__

```js
var report = 'bundle.js';
var parameters = {};

press.run(report, parameters)
  .then(function (html) {
    // ...
  });
```

---

<a name="shutdown"/>
#### shutdown ( )

Shuts the press down. The press instance cannot be used after this method is called unless it is re-initialized.

__Example__

```js
press.shutdown();
```

<a name="Report"/>
## Report

[`Report`](#Report)s can take the form of a [`Definition`](#Definition) or a [`Module`](#Module).

They are [`run`](#run) by Chronicle [`Press`](#Press) which produces static HTML content that can be rendered by a browser or other third party HTML renderers.

<a name="Module"/>
### Module

A report [`Module`](#Module) is a CommonJS module that exports a report [`Definition`](#Definition).

Report [`Module`](#Module)s can be bundled and transported across a network using Chronicle [`bundle`](#bundle) or simply loaded from the local file system.

__Example__

```js
var definition = {
  // ...
};

module.exports = definition;
```

<a name="Definition"/>
### Definition

The report [`Definition`](#Definition) tells Chronicle [`Press`](#Press) how to get data, process it, and finally how to use it to produce HTML.

A report [`Definition`](#Definition) is an object, or a yieldable function that returns an object, that contains some or all of the following properties. If it is a yieldable function, it will be called with the `parameters` supplied when the [`Report`](#Report) is [`run`](#run).

__Properties__

- `data` - An object, or a yieldable function that returns an object, containing the data that will be passed to the [Handlebars](http://handlebarsjs.com/) `template`. If this is a yieldable function, it will be called with the `parameters` supplied when the [`Report`](#Report) is [`run`](#run). Operations such as api calls, deserializing, grouping, sorting, aggregating, etc. can be done here.
- `charts` - An object containing functions that return the [C3](http://c3js.org/) chart configurations for the charts available within the `template`. Each function will be called with the result of the `data` property and the `parameters` supplied when the [`Report`](#Report) is [`run`](#run).
- `helpers` - An object containing the [Handlebars](http://handlebarsjs.com/) helpers available within the `template` and `partials`.
- `partials` - An object containing the [Handlebars](http://handlebarsjs.com/) partials available within the `template`.
- `template` - _(required)_ A [Handlebars](http://handlebarsjs.com/) template used to produce the report HTML.

__Examples__

Simplistic:

```js
var definition = {
  data: { date: new Date() },
  charts: { chart: function (data, parameters) { return { data: {columns: ['data', 1, 2, 3]} }; }
},
  helpers: { help: function (string) { return string; }},
  partials: { part: 'Parted' },
  template: 'Created: {{date}}, {{charts.chart}}, {{help "Helped"}}, {{> part}}.'
};
```

Realistic:

```js
var co = require('co');
var inlineHtml = require('inline-html');

var definition = co.wrap(function * (parameters) {

  // generate elements of the report definition,
  // optionally using runtime `parameters`

  var data = co.wrap(function * (parameters) {
    // fetch and process data, optionally using
    // runtime `parameters`
    return result;
  };

  var charts = {
    chart: function (data, parameters) {
      // create the chart config optionally using
      // runtime `data` and `parameters`
      return { data: {columns: ['data', 1, 2, 3]} };
    }
  };

  var helpers = {
    help: require('./helpers.js')
  };

  var partials = {
    part: yield inlineHtml('path/to/partial.html')
  };

  var template = yield inlineHtml('path/to/template.html');

  return {
    data: data,
    charts: charts,
    helpers: helpers,
    partials: partials,
    template: template
  };
});
```

### Examples

Sample reports can be found in the [`examples/`](https://github.com/panosoft/chronicle/tree/master/examples) directory.
