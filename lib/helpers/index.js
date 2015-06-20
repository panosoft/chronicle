var Handlebars = require('handlebars');
var _ = require('lodash');
var format = require('./format');



module.exports = _.assign({
    page: function () {
        return new Handlebars.SafeString('<span style="content: counter(page)"></span>')
    },
    pages: function () {
        return new Handlebars.SafeString('<span style="content: counter(pages)"></span>')
    },
    isNegative: function (value) {
        return (value < 0) ? 'negative' : '';
    }
}, format);
