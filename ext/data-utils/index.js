var R = require('ramda');

var DU = {
	callOn: R.curry((obj, f) => f(obj)),
	sumProps: R.curry((props, obj) => R.sum(R.map(DU.callOn(obj), R.map(R.prop, props)))),
	sumColumn: R.curry((prop, objs) => R.sum(R.map(R.prop(prop), objs))),
	compareProps: R.curry(function(props, a, b) {
		// determine property compare function (lt or gt) based on + or -
		var propCompares = R.map(prop => prop[0] == '-' ? R.gt : R.lt, props);
		// remove + and - from property names
		props = R.map(R.replace(/^(-|\+)/, ''), props);
		// determine which properties are equal
		var equalProps = R.map(prop => R.equals(a[prop], b[prop]), props);
		// find first non-equal property
		var index = R.findIndex(R.equals(false), equalProps);
		// if found then compare that property
		if (index >= 0)
			return R.comparator(propCompares[index])(a[props[index]], b[props[index]]);
		// return all properties equal
		return 0;
	}),
	filterEmpty: R.filter(s => R.trim(s) != ''),
	fullName: (f, m, l) => R.join(' ', DU.filterEmpty([f, m, l])),
	cityStateZip: (c, s, z) => c + ', ' + s + ' ' + z
};

module.exports = DU;
