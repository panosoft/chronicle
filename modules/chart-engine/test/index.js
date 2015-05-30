var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var suspend = require('suspend');
var ChartEngine = require('../');

suspend(function * () {
	try {
//		var engine = yield ChartEngine.create();

		// Params
		var data = {
			"title": "Case Load Report",
			"agencyName": "County Agency",
			"address": "523 Willow St.",
			"phone": "1 (328) 785-2349",
			"managers": [
				{
					"name": "Alex",
					"clients": [
						{"first": "Jim", "last": "Smith", "checking": 10.00, "savings": 10.00, "total": 20.00, "street": "9124 Through St.", "city": "Irvine", "state": "Ca", "zip": 92620, imageUrl: 'http://iconshow.me/media/images/ui/ios7-icons/png/512/contact-outline.png'},
						{"first": "Jane", "last": "Doe", "checking": -20.00, "savings": 10.00, "total": -10.00, "street": "2752 Ocean Blvd.", "city": "Irvine", "state": "Ca", "zip": 92620, imageUrl: 'http://iconshow.me/media/images/ui/ios7-icons/png/512/contact-outline.png'},
						{"first": "John", "last": "Doe", "checking": 30.00, "savings": 30.00, "total": 60.00, "street": "7298 Beach Blvd.", "city": "Irvine", "state": "Ca", "zip": 92620, imageUrl: 'http://iconshow.me/media/images/ui/ios7-icons/png/512/contact-outline.png'}
					],
					"clientCount": 3,
					"clientTotal": 80.00
				},
				{
					"name": "Charles",
					"clients": [
						{"first": "Jim", "last": "Smith", "checking": 10.00, "savings": 10.00, "total": 20.00, "street": "9124 Through St.", "city": "Irvine", "state": "Ca", "zip": 92620, imageUrl: 'http://iconshow.me/media/images/ui/ios7-icons/png/512/contact-outline.png'},
						{"first": "Jane", "last": "Doe", "checking": -20.00, "savings": 10.00, "total": -10.00, "street": "2752 Ocean Blvd.", "city": "Irvine", "state": "Ca", "zip": 92620, imageUrl: 'http://iconshow.me/media/images/ui/ios7-icons/png/512/contact-outline.png'},
						{"first": "John", "last": "Doe", "checking": 30.00, "savings": 30.00, "total": 60.00, "street": "7298 Beach Blvd.", "city": "Irvine", "state": "Ca", "zip": 92620, imageUrl: 'http://iconshow.me/media/images/ui/ios7-icons/png/512/contact-outline.png'}
					],
					"clientCount": 3,
					"clientTotal": 120.00
				}
			]
		};
//		var generateConfig = function (data) {
//			// Restructuring logic here
//			// Note: all calculation logic should be done in getData
//			var columns = _.map(data.managers, function (manager) {
//				return [manager.name, manager.clientCount];
//			});
//			// Return chart config
//			return {
//				data: {
//					columns: columns,
//					type: 'pie'
//				}
//			};
//		};

		console.time('Generate');
//		// Generate html partial from config + data
//		var config = generateConfig(data);
//		var html = yield engine.generate(config);
		console.timeEnd('Generate');
		fs.writeFileSync(path.join(__dirname, 'test.html'), html);
		console.log('Chart generated');
		engine.shutdown();
	}
	catch (error) {
		console.log(error);
	}
})();
