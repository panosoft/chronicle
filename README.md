# Chronicle


Create Reports with Web Technologies and Run them in Node.

[![npm version](https://img.shields.io/npm/v/@panosoft/chronicle.svg)](https://www.npmjs.com/package/@panosoft/chronicle)
[![Travis](https://img.shields.io/travis/panosoft/chronicle.svg)](https://travis-ci.org/panosoft/chronicle)
[![David](https://img.shields.io/david/panosoft/chronicle.svg)](https://david-dm.org/panosoft/chronicle)

<svg version="1.0" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="256px" height="256px" viewBox="0 0 400 400" enable-background="new 0 0 400 400" xml:space="preserve">
<polygon fill="none" stroke="#5396D0" stroke-width="32" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" points="
	348.023,283.254 199.861,368.796 51.7,283.254 51.7,112.171 199.861,26.63 348.023,112.171 "/>
<polyline fill="none" stroke="#5396D0" stroke-width="30" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" points="
	274.188,242.544 200.5,285.087 126.812,242.544 126.812,157.457 200.5,114.912 274.188,157.457 "/>
</svg>

Finally, a reporting engine for JavaScript!

Writing a Report is as easy as writing a CommonJS module (i.e. Node module) and Reports can get data from any source (APIs, SQL Servers, Code data generation, etc.).

The following Web Technologies are supported for use in Reports:

- HTML + Handlebars
- CSS + LESS
- JavaScript + Browserify + npm

<a name="contents"/>
## Contents

- [Architecture](#architecture)
- [Usage](#usage)
- [Examples](#examples)
- [Installation](#installation)
- [Philosophy](#philosophy)
- [Report](#report)
- [CLI](#cli)
- [API](#api)

<a name="architecture"/>
## Architecture

[Reports](#report) are CommonJS modules (i.e. Node modules) that export Definitions.

[Definitions](#definition) describe how to retrieve data and generate HTML.

Chronicle [`bundle`](#bundle) can be used to bundle Reports. Bundling reduces a Report Module, and all of it's dependencies, into a single, portable, version locked file. As such, bundling makes transporting Reports across networks a trivial task.

Chronicle [`Press`](#press) runs Reports. Running a Report loads the Report Definition, retrieves data, and generates HTML.

Finally, HTML renderers like [PrinceXML](http://www.princexml.com/) that support [CSS Paged Media](https://drafts.csswg.org/css-page-3/) can be used to create PDFs complete with page headers, footers, numbers, etc.!

<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="734px" height="252px" version="1.1" content="%3Cmxfile%20userAgent%3D%22Mozilla%2F5.0%20(Macintosh%3B%20Intel%20Mac%20OS%20X%2010_10_5)%20AppleWebKit%2F537.36%20(KHTML%2C%20like%20Gecko)%20Chrome%2F45.0.2454.101%20Safari%2F537.36%22%20type%3D%22browser%22%3E%3Cdiagram%3E7VpNk9o4E%2F41U5X3MBS2MTDHYT42h6SKqtmqzR6FLWxVjOWVxQyzvz7dVsvfTBjWzvJuwgGsR1JL6n7U6pa58u52h98Uy%2BLPMuTJlTsND1fe%2FZXr3vg%2BfCPwaoC5DyUEIiVCAzkV8CT%2B5gROCd2LkOeNhlrKRIusCQYyTXmgG9hWJs0hMhZZ8RXwFLCki%2F4hQh0bdDmluSD%2BkYsopmE8W7FhwddIyX1Kw1253rb4mOods6KK9t4D6EtJCVLwaXe44wnqzOrDv1nw2XK28bcuC4MguDajPJ7avFyF4inN9J0il6E%2FW7izub9wFg6%2FuV4aic8s2ZOmDJDrV6s6XH52wsA0uWeuNCeONC3INlZkpSwgF5c7rtUrtKNeHhGLeOWRKV4quy0sFtds5s4IZMSfqJRcKQQeSCenqnzudTTCQ%2BAWFaXSsYxkypKHCl0VjOEocwqlWO9gvHsHHvlB6C8IT3wq%2FWlrUpiqqZq5NxYoaidO0RjLa64ELIorEp1rpvStUvIFgCBheS4CCz8KXCYJD22jVKY4Q0Co3ohR8mu5M7DHVqaa9iyYy5TvZCJxYNgE0%2Bly%2Bog4S0SUApbwLdhh1eXJEcblcq8C0mdH6aU%2FYCriR%2FlGNEFr1OjWpZXiCdPiuekJ%2BkhSdAU9MexlG2RSpDqvSV4jUGProklXS8NyB7bbE0v7m8ODmUDF1nIl5xKYVjwmgbFRjcAlXRvk%2FsXdmlGIBcOR93wPR%2FxtnAHzBDWSZyxtMGf%2B1x4Pt1V1LF4HRrG3ONdo88HFsAAWB%2FOYtp7%2FV%2FWHp4h%2Bi4E2bQBNVpwc1mpVz8J%2BWxDbFgYRyh7mSRJAD0ZIUzDAncEAMyu1cGu71OiPp5uAsOIT2%2FBkLXOhhUQKbaTWcldrcEvc0jLrcBTsTEgfK7dA7RpO4Qb0iFlY7AJsFLI8Lrcn1GQ41d0hwkhtImS%2BmAg4dfMJBkq44ep7wsGFnEz2znne5Si5MgcEd07qnoPacn9QFpuYosHiu1jJVAQVJULx3CGe6iFDT7sa9GEFtE%2B4Qjr39mixp3KlqPeXWGj%2BlLHCf7yAuZrudUiz2Foby5KZbrpWcmxMXjdT2W9YO9kwcXw7rRXP8%2F8XK3mWwJdhJUoDes6EQVz1%2Bv7xXX76v%2BOQQxnsdwVtRnXJVDtfNlnV56L9H%2BaiKZOqkWqtRBrwL58%2FXdx%2B9G02eRn7sS9GGy6ob0TiFGTXw3AbRFu24n4ZJloeKYnrZF3tQ9CZtUSYcJ16tSz1DzMw1ypi0ATMPhfpV5VxFQlYPf0ydadYuJZoVdlYlWu1MqsBSWCPvjdTJmvzC8iYbAo%2FtkEv22jkzd82GrmpS0hz50dDmnMimE44ZLKC76SZzUjnV1Rz3tlc3vReQlRTXuUcJ1b3%2FgQrrvNCS3hx4jjZAW9KUFu1Vw4D363c861IDZN%2BTpZmim858DDA107vviUMgMDFVUqCy12VVrJ9yEGPkRtaMn%2BH30O8AGlP9ji5jyWCJ7K9ouv7HO%2FH3zFb%2BClzR5nhBJG7I5BsZv2Ydar2FP4XSDcbMr4a71r%2FyF758cFOeyLjZotnKfSIrt6OHinEHF2hUKze2puUr%2FrLg%2FfwDQ%3D%3D%3C%2Fdiagram%3E%3C%2Fmxfile%3E" style="background-color: rgb(255, 255, 255);"><defs/><g transform="translate(0.5,0.5)"><path d="M 377 199.37 L 377 242 L 32 242 L 32 182" fill="none" stroke="#000000" stroke-miterlimit="10" pointer-events="none"/><path d="M 377 194.12 L 380.5 201.12 L 377 199.37 L 373.5 201.12 Z" fill="#000000" stroke="#000000" stroke-miterlimit="10" pointer-events="none"/><path d="M 377 86.63 L 377 42" fill="none" stroke="#000000" stroke-miterlimit="10" pointer-events="none"/><path d="M 377 91.88 L 373.5 84.88 L 377 86.63 L 380.5 84.88 Z" fill="#000000" stroke="#000000" stroke-miterlimit="10" pointer-events="none"/><path d="M 2 117.62 C 2 116.39 2.37 115.22 3.03 114.35 C 3.68 113.49 4.57 113 5.5 113 L 12.5 113 C 13.43 113 14.32 113.49 14.97 114.35 C 15.63 115.22 16 116.39 16 117.62 L 68.5 117.62 C 69.43 117.62 70.32 118.1 70.97 118.97 C 71.63 119.83 72 121.01 72 122.23 L 72 168.38 C 72 169.61 71.63 170.78 70.97 171.65 C 70.32 172.51 69.43 173 68.5 173 L 5.5 173 C 4.57 173 3.68 172.51 3.03 171.65 C 2.37 170.78 2 169.61 2 168.38 Z M 2 122.23 L 72 122.23" fill="#ffffff" stroke="#0080f0" stroke-width="2" stroke-miterlimit="10" pointer-events="none"/><g transform="translate(16,181)"><switch><foreignObject pointer-events="all" width="41" height="15" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; font-size: 11px; font-family: Helvetica; color: rgb(0, 0, 0); line-height: 1.2; vertical-align: top; white-space: nowrap; text-align: center;"><div xmlns="http://www.w3.org/1999/xhtml" style="display:inline-block;text-align:inherit;text-decoration:inherit;"><span style="background-color: rgb(255 , 255 , 255)"><b><font color="#0080f0">Module</font></b></span></div></div></foreignObject><text x="21" y="13" fill="#000000" text-anchor="middle" font-size="11px" font-family="Helvetica">[Not supported by viewer]</text></switch></g><rect x="102" y="93" width="110" height="100" rx="15" ry="15" fill="#ffffff" stroke="#000000" pointer-events="none"/><g transform="translate(125,123)"><switch><foreignObject pointer-events="all" width="63" height="44" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; font-size: 12px; font-family: Helvetica; color: rgb(0, 0, 0); line-height: 1.2; vertical-align: top; width: 63px; white-space: normal; text-align: center;"><div xmlns="http://www.w3.org/1999/xhtml" style="display:inline-block;text-align:inherit;text-decoration:inherit;">Chronicle<div><br /></div><div>(Bundler)</div></div></div></foreignObject><text x="32" y="28" fill="#000000" text-anchor="middle" font-size="12px" font-family="Helvetica">[Not supported by viewer]</text></switch></g><rect x="322" y="93" width="110" height="100" rx="15" ry="15" fill="#ffffff" stroke="#000000" pointer-events="none"/><g transform="translate(345,123)"><switch><foreignObject pointer-events="all" width="63" height="44" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; font-size: 12px; font-family: Helvetica; color: rgb(0, 0, 0); line-height: 1.2; vertical-align: top; width: 63px; white-space: normal; text-align: center;"><div xmlns="http://www.w3.org/1999/xhtml" style="display:inline-block;text-align:inherit;text-decoration:inherit;">Chronicle<div><br /></div><div>(Press)</div></div></div></foreignObject><text x="32" y="28" fill="#000000" text-anchor="middle" font-size="12px" font-family="Helvetica">[Not supported by viewer]</text></switch></g><path d="M 682 113 L 717.71 113 L 732 125 L 732 173 L 682 173 Z" fill="#ffffff" stroke="#0080f0" stroke-width="2" stroke-miterlimit="10" pointer-events="none"/><path d="M 717.71 113 L 717.71 125 L 732 125" fill="none" stroke="#0080f0" stroke-width="2" stroke-miterlimit="10" pointer-events="none"/><g transform="translate(695,181)"><switch><foreignObject pointer-events="all" width="24" height="15" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; font-size: 11px; font-family: Helvetica; color: rgb(0, 0, 0); line-height: 1.2; vertical-align: top; white-space: nowrap; text-align: center;"><div xmlns="http://www.w3.org/1999/xhtml" style="display:inline-block;text-align:inherit;text-decoration:inherit;"><b><font color="#0080f0">PDF</font></b></div></div></foreignObject><text x="12" y="13" fill="#000000" text-anchor="middle" font-size="11px" font-family="Helvetica">[Not supported by viewer]</text></switch></g><rect x="542" y="93" width="110" height="100" rx="15" ry="15" fill="#ffffff" stroke="#000000" pointer-events="none"/><g transform="translate(561,137)"><switch><foreignObject pointer-events="all" width="71" height="16" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; font-size: 12px; font-family: Helvetica; color: rgb(0, 0, 0); line-height: 1.2; vertical-align: top; width: 71px; white-space: normal; text-align: center;"><div xmlns="http://www.w3.org/1999/xhtml" style="display:inline-block;text-align:inherit;text-decoration:inherit;">PrinceXML</div></div></foreignObject><text x="36" y="14" fill="#000000" text-anchor="middle" font-size="12px" font-family="Helvetica">[Not supported by viewer]</text></switch></g><path d="M 72 143 L 95.63 143" fill="none" stroke="#000000" stroke-miterlimit="10" pointer-events="none"/><path d="M 100.88 143 L 93.88 146.5 L 95.63 143 L 93.88 139.5 Z" fill="#000000" stroke="#000000" stroke-miterlimit="10" pointer-events="none"/><path d="M 212 143 L 315.63 143" fill="none" stroke="#000000" stroke-miterlimit="10" pointer-events="none"/><path d="M 320.88 143 L 313.88 146.5 L 315.63 143 L 313.88 139.5 Z" fill="#000000" stroke="#000000" stroke-miterlimit="10" pointer-events="none"/><path d="M 652 143 L 675.63 143" fill="none" stroke="#000000" stroke-miterlimit="10" pointer-events="none"/><path d="M 680.88 143 L 673.88 146.5 L 675.63 143 L 673.88 139.5 Z" fill="#000000" stroke="#000000" stroke-miterlimit="10" pointer-events="none"/><path d="M 242 113 L 277.71 113 L 292 125 L 292 173 L 242 173 Z" fill="#ffffff" stroke="#0080f0" stroke-width="2" stroke-miterlimit="10" pointer-events="none"/><path d="M 277.71 113 L 277.71 125 L 292 125" fill="none" stroke="#0080f0" stroke-width="2" stroke-miterlimit="10" pointer-events="none"/><g transform="translate(247,181)"><switch><foreignObject pointer-events="all" width="39" height="15" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; font-size: 11px; font-family: Helvetica; color: rgb(0, 0, 0); line-height: 1.2; vertical-align: top; white-space: nowrap; text-align: center;"><div xmlns="http://www.w3.org/1999/xhtml" style="display:inline-block;text-align:inherit;text-decoration:inherit;"><font color="#0080f0"><b>Bundle</b></font></div></div></foreignObject><text x="20" y="13" fill="#000000" text-anchor="middle" font-size="11px" font-family="Helvetica">[Not supported by viewer]</text></switch></g><path d="M 352 2 L 359.5 2 L 359.5 9.5 L 352 9.5 Z M 352 18.25 L 359.5 18.25 L 359.5 25.75 L 352 25.75 Z M 352 34.5 L 359.5 34.5 L 359.5 42 L 352 42 Z M 367 2 L 402 2 L 402 9.5 L 367 9.5 Z M 367 18.25 L 402 18.25 L 402 25.75 L 367 25.75 Z M 367 34.5 L 402 34.5 L 402 42 L 367 42 Z" fill="#ffffff" stroke="#0080f0" stroke-width="2" stroke-miterlimit="10" pointer-events="none"/><g transform="translate(350,50)"><switch><foreignObject pointer-events="all" width="53" height="26" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; font-size: 20px; font-family: Helvetica; color: rgb(0, 128, 240); line-height: 1.2; vertical-align: top; white-space: nowrap; text-align: center;"><div xmlns="http://www.w3.org/1999/xhtml" style="display:inline-block;text-align:inherit;text-decoration:inherit;"><font style="font-size: 11px ; background-color: rgb(255 , 255 , 255)"><b>Definition</b></font></div></div></foreignObject><text x="27" y="23" fill="#0080F0" text-anchor="middle" font-size="20px" font-family="Helvetica">[Not supported by viewer]</text></switch></g><path d="M 462 123 L 512 123 L 512 131 L 462 131 Z M 462 139 L 512 139 L 512 147 L 462 147 Z M 462 155 L 512 155 L 512 163 L 462 163 Z" fill="#ffffff" stroke="#0080f0" stroke-width="2" stroke-miterlimit="10" pointer-events="none"/><g transform="translate(470,171)"><switch><foreignObject pointer-events="all" width="33" height="16" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; font-size: 12px; font-family: Helvetica; color: rgb(0, 0, 0); line-height: 1.2; vertical-align: top; white-space: nowrap; text-align: center;"><div xmlns="http://www.w3.org/1999/xhtml" style="display:inline-block;text-align:inherit;text-decoration:inherit;"><b><font style="font-size: 11px" color="#0080f0">HTML</font></b></div></div></foreignObject><text x="17" y="14" fill="#000000" text-anchor="middle" font-size="12px" font-family="Helvetica">[Not supported by viewer]</text></switch></g><path d="M 432 143 L 455.63 143" fill="none" stroke="#000000" stroke-miterlimit="10" pointer-events="none"/><path d="M 460.88 143 L 453.88 146.5 L 455.63 143 L 453.88 139.5 Z" fill="#000000" stroke="#000000" stroke-miterlimit="10" pointer-events="none"/><path d="M 512 143 L 535.63 143" fill="none" stroke="#000000" stroke-miterlimit="10" pointer-events="none"/><path d="M 540.88 143 L 533.88 146.5 L 535.63 143 L 533.88 139.5 Z" fill="#000000" stroke="#000000" stroke-miterlimit="10" pointer-events="none"/></g></svg>

<a name="usage"/>
## Usage

Reports can be run from the command line:

```sh
chronicle run report.js
```

Or using the Node api:

```js
var co = require('co');
var chronicle = require('@panosoft/chronicle');
var prince = require('prince-promise');

co(function * () {

  var press = chronicle.Press.create();
  yield press.initialize();
  var html = yield press.run('report.js');
  press.shutdown();

  var pdf = yield prince(html);

});
```

<a name="examples"/>
## Examples

- [Static Data Source Report](examples/reports/static-data) ([PDF](examples/reports/static-data/test/test.pdf))
- [API Data Source Report](examples/reports/api-data) ([PDF](examples/reports/api-data/test/test.pdf))
- [SQL Data Source Report](examples/reports/sql-data) ([PDF](examples/reports/sql-data/test/test.pdf))
- [Report Bundle Server](examples/bundle-server)
- [Simple Reporting App](examples/app)

<a name="installation"/>
## Installation

```sh
npm install -g @panosoft/chronicle
```

<a name="philosophy"/>
## Philosophy

Unlike Crystal Reports, Jasper Reports, BIRT, SQL Server Reporting Services (SSRS), Pentaho, etc., Chronicle doesn't subscribe to the WYSIWYG approach to report development. This is reminiscent of using FrontPage to produce web pages.

With the WYSIWYG approach, most powerful features are hidden and buried under menu items, property sheets and require a half a dozen clicks to expose the correct radio button or check box. And many times, the powerful features just aren't there.

Anyone who has had to suffer through these poorly designed systems has quickly realized that reports are harder than they need to be and that one must contort oneself in order to accomplish what would be trivial in a programming language.

Another big problem with these traditional reporting systems, is that since it has a GUI, people assume that anyone can build a report. While it's true that anyone can, not everyone should.
Good reports transform data into useful information in a form that's easy to understand. This is not a trivial task that you can give the receptionist or the intern. This requires layout design, data processing and logic. These are all things that good developers are skilled at, particularly web developers.

Chronicle embraces these truths and caters to developers by using standard Web Technologies, viz. HTML/Handlebars, CSS/Less, Javascript, NodeJS, Browserify and PrinceXML to produce high quality PDF reports from any data source.

<a name="report"/>
## Report

Reports can take the form of a bare [Definition](#definition) or a [Module](#module) that exports a Definition.

They are run by Chronicle [`Press`](#press) which produces static HTML content that can be visually rendered by a browser or other third party HTML renderers.

<a name="module"/>
### Module

A report Module is simply a CommonJS module (i.e. Node module) that exports a report [Definition](#definition).

Report Modules can optionally be bundled using Chronicle [`bundle`](#bundle) so that all of their dependencies are contained within a single file.

Chronicle [`Press`](#press) can then run a Report using a url that references a bundled Module, a path to a local Module, or by simply passing the Definition itself.

__Example__

```js
var definition = {
  // ...
};

module.exports = definition;
```

<a name="definition"/>
### Definition

The Report Definition tells Chronicle [`Press`](#press) how to get data and render it as HTML.

A report Definition is an object, or a yieldable function that returns an object, that contains some or all of the following properties. If it is a yieldable function, it will be called with the `parameters` supplied when the Report is run.

__Properties__

- `context` - An object, or a yieldable function that returns an object, containing the context that will be passed to the [Handlebars](http://handlebarsjs.com/) `template`. If this is a yieldable function, it will be called with the `parameters` supplied when the [Report](#report) is run. Operations such as api calls, deserializing, grouping, sorting, aggregating, etc. can be done here.

- `charts` - An object containing functions that return the [C3](http://c3js.org/) chart configurations for the charts available within the `template`. Each function will be called with the result of the `context` property and the `parameters` supplied when the [Report](#report) is [`run`](#run).

- `helpers` - An object containing the [Handlebars](http://handlebarsjs.com/) helpers available within the `template` and `partials`.

- `partials` - An object containing the [Handlebars](http://handlebarsjs.com/) partials available within the `template`.

- `template` - _(Required)_ A [Handlebars](http://handlebarsjs.com/) template used to produce the report HTML.

__Examples__

Simplistic:

```js
var definition = {
  context: {
    date: new Date()
  },
  charts: {
    chart: (context, parameters) => ({data: {columns: ['data', 1, 2, 3]})
  },
  helpers: {
    help: (string) => string;
  },
  partials: {
    part: 'Parted'
  },
  template: `Created: {{date}}, {{charts.chart}}, {{help "Helped"}}, {{> part}}.`
};
```

Realistic:

```js
var co = require('co');
var inlineHtml = require('inline-html');

var definition = co.wrap(function * (parameters) {
  // assemble elements of the report definition,
  // optionally using runtime `parameters`

  var context = co.wrap(function * (parameters) {
    // fetch and process data, optionally using runtime `parameters`.
    // return the template context.
    return context;
  };

  var charts = {
    chart: function (context, parameters) {
      // create the chart config optionally using
      // runtime `context` and `parameters`
      return { data: {columns: ['data', 1, 2, 3]} };
    }
  };

  var helpers = {
    // load helpers from separate files
    // Note: `helpers.js` would export a function
    help: require('./helpers.js')
  };

  var partials = {
    // load partials from separate files
    // along with their referenced assets
    part: yield inlineHtml('path/to/partial.html')
  };

  // load template from a separate file
  // along with its referenced assets
  var template = yield inlineHtml('path/to/template.html');

  // return the Definition object
  return {
    context,
    charts,
    helpers,
    partials,
    template
  };
});
```

<a name="cli"/>
## CLI

`chronicle`

- [`bundle`](#cli-bundle)
- [`run`](#cli-run)

---

<a name="cli-bundle"/>
#### bundle [entry] [--output] [--watch]

Bundles a report [Module](#module) along with all of its dependencies into a single file called a bundle.

Bundles are completely self contained and thus very portable. For instance, bundles could be stored on a static file server and requested remotely by Chronicle [`Press`](#press) when run.

__Arguments__

- `entry` - The main entry filename of a report [Module](#module) to bundle. If an entry is not specified, the `package.json`'s' `main` property will be used. If the `package.json` doesn't exist or if the `main` property is not specified, then `index.js` will be used as the entry.

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
  - A fully qualified url - Load a bundled report [Module](#module) from a url.
  - A filename - Load a report [Module](#module) (bundled or not) from the filesystem.
  - A JSON parseable string - The report [Definition](#definition) to run.
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

<a name="api"/>
## API

`chronicle`

- [`bundle`](#bundle)
- [`Press`](#press)
  - [`create`](#create)
  - [`initialize`](#initialize)
  - [`run`](#run)
  - [`shutdown`](#shutdown)

---

<a name="bundle"/>
#### bundle ( entry , options )

Bundles a report [Module](#module) along with all of its dependencies into a single file called a bundle.

Upon completion, the bundle is written directly to the filesystem per `output` option.

__Arguments__

- `entry` - The main entry filename of a report [Module](#module) to bundle. If an entry is not specified, the `package.json`'s' `main` property will be used. If the `package.json` doesn't exist or if the `main` property is not specified, then `index.js` will be used as the entry.


- `options`
  - `output` - The filename for the bundled [Module](#module). Defaults to `bundle.js`.
  - `watch` - A boolean used to enable watch mode. Supported values are:
    - `true` - The [Module](#module) is bundled and as files are modified, the bundle is updated automatically and incrementally.
    - `false` - The [Module](#module) is bundled once. _(default)_

__Example__

```js
var entry = 'index.js';
var options = {
  output: 'bundle.js'
};

chronicle.bundle(entry, options);
```

---

<a name="Press"/>
### Press

<a name="create"/>
#### create ( options )

Creates an instance of Chronicle [`Press`](#press). Presses are used to run [Reports](#report) and produce HTML output.

__Arguments__

- `options`
  -  `cacheMax` - A number used to determine the maximum number of remotely requested report [Module](#module) bundles to cache. Once this limit is hit, the least recently used bundles will be replaced as new bundles are requested.

__Example__

```js
var press = chronicle.Press.create();
```

---

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

Runs a [Report](#report) and returns a `Promise` that is fulfilled with the HTML produced.

The [Report](#report) is loaded, context is retrieved, pre-processors are run, and the HTML output is finally produced and returned.

__Arguments__

- `report` - The [Report](#report) to run. Supported values are:
  - A fully qualified url of a bundled report [Module](#module).
  - A filename of a report [Module](#module) (bundled or not).
  - A report [Definition](#definition).


- `parameters` - An object of parameters used to run the report. This object is passed to various elements of the report [Definition](#definition) at various stages of the report lifecycle.

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
