var Handlebars = require('handlebars');

module.exports = {
    localHelperEmbedded: function () {return 'Local Helper Embedded';},
    localHelperImported: './localHelperImported.js',
    formatMoney: new Intl.NumberFormat('lookup', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format,
    formatDate: new Intl.DateTimeFormat('lookup', {
        year: 'numeric', month: 'numeric', day: 'numeric'
    }).format,
    formatTime: new Intl.DateTimeFormat('lookup', {
        hour: 'numeric', minute: 'numeric', second: 'numeric',
        timeZoneName: 'short'
    }).format,
    page: function () {
        return new Handlebars.SafeString('<span style="content: counter(page)"></span>')
    },
    pages: function () {
        return new Handlebars.SafeString('<span style="content: counter(pages)"></span>')
    },
    isNegative: function (value) {
        return (value < 0) ? 'negative' : '';
    }

};
