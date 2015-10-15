# Bundle Server

This example is composed of a static server that serves up report bundles and a test script that runs bundles via a url.

This is an example of how bundles might be used to produce highly portable reports that can be served up from a central location, like an application server, independently of where Chronicle Press is running.

# Installation

First, some prerequisites:

- Install Chronicle globally. Directions can be found [here](../../).

- Install and test the dynamic report example. Directions can be found [here](../reports/api-data/).

Once those are setup, we can begin by bundling the example api data report.

Bundling a report takes a report module, along with all of its dependencies, and combines them into a single file. This makes bundles very portable and also very stable since all of the reports dependencies are baked in. Any npm package that is browserify-able can be included in the bundle.

To bundle the report, open Terminal and change directory to the api data report directory ([`../reports/api-data/`](../reports/api-data/)). Then run the following:

```sh
chronicle bundle
```

Once the process exits, a new (or updated) `bundle.js` file can be found in the current directory.

Now we can install the simple bundle server, start it, and run our test.

```sh
npm install
npm start
npm test
```

After running the above commands, the report pdf should open in a new window of your systems preferred pdf viewer. If it does not open automatically, the pdf can be found within the [`test/`](test/) directory after running `npm test`.

# Description

Let's walk through our test script ([`test/index.js`](test/index.js)). We begin by creating and initializing a Press. This Press is then used to run our bundled report via it's url. The Press loads the bundle from the specified url, caches it, retrieves the report data, and then presses that data with the report template to generate the report HTML. Finally, PrinceXML is used to visually render the report HTML as a paginated PDF and the outputs are saved to disk.

Visually, the architecture is as follows:

```
. Test Client
 _____________           ______________
|             |  <===>  |   bundle.js  |  Bundle server
|         //  |         |______________|
|  Press      |
|         \\  |          ______________
|             |  <===>  |     API      |  Data source
|   ||        |         |______________|
|   ||        |
|   ||        |
|             |
|  PrinceXML  |
|_____________|
```
