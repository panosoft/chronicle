const co = require('co');
const r = require('ramda');
const saveAs = require('filesaver.js').saveAs;

const decoder = new TextDecoder();
const arraybufferToString = (arraybuffer) => decoder.decode(new DataView(arraybuffer));
const toArray = (arrayLike) => [].slice.call(arrayLike);

/**
 * Make an asynchronous post request.
 */
const post = (location, data, encoding) => new Promise((resolve, reject) => {
  var request = new XMLHttpRequest();
  request.open('POST', location);
  if (encoding) request.responseType = encoding;
  request.onerror = () => reject(new Error('POST request failed.'));
  request.onload = () => {
    if (request.status === 200) resolve(request.response);
    else reject(request.response);
  };
  request.send(data);
});

/**
 * Run a report via the servers api and return the resulting pdf as a binary blob.
 *
 * @param {String} path
 * @param {Object} options.report
 * @param {Object} options.renderer
 *
 * @return {Blob} report
 */
const runReport = co.wrap(function * (path, parameters) {
  var data = r.merge(parameters || {}, { path });
  data = JSON.stringify(data);
  try {
    const report = yield post('/reports', data, 'arraybuffer');
    return new Blob([report]);
  }
  catch (error) {
    throw (error instanceof ArrayBuffer) ?
      new Error(JSON.parse(arraybufferToString(error)).error):
      error;
  }
});


// DOM interaction
////////////////////

const sorts = toArray(document.querySelectorAll('input[name="sort"]'));
const getSort = () => r.prop('value', r.find(r.prop('checked'), sorts));

const results = document.querySelector('input[name="results"]');
const getResults = () => results.value;

const button = document.querySelector('button');
/**
 * On click, get parameters, run the report, and save it locally
 */
button.addEventListener('click', co.wrap(function * () {
  try {
    button.disabled = true;
    button.innerHTML = 'Running ...';
    const parameters = {
        report: {
          results: getResults(),
          sort: getSort()
        },
        renderer: {}
    };
    const report = yield runReport('dynamic/lib/index.js', parameters);
    saveAs(report, 'dynamic.pdf');
  }
  catch (error) {
    console.error(error);
    alert(error.toString());
  }
  finally {
    button.disabled = false;
    button.innerHTML = 'Run Report';
  }
}));
