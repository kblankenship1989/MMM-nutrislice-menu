/* Magic Mirror
 * Node Helper: MMM-nutrislice-menu
 *
 * By Blankenship Mirror
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");

module.exports = NodeHelper.create({

	// Override socketNotificationReceived method.

	/* socketNotificationReceived(notification, payload)
	 * This method is called when a socket notification arrives.
	 *
	 * argument notification string - The identifier of the noitication.
	 * argument payload mixed - The payload of the notification.
	 */
	getStats: function (endpoint) {
		console.log("STAT_RESULT...");
		// Wait for all promises, then merge data together. Duplicate keys WILL be clobbered.
		this.requestAsync(endpoint)
		  .then(function (data) {
			console.log(data);
			//this.sendSocketNotification("STATS_RESULT", data);
			return data;
		  })
		  .catch(function (err) {
			console.log(err);
		});
	},

	// Nice little request wrapper from: https://stackoverflow.com/questions/32828415/how-to-run-multiple-async-functions-then-execute-callback
	requestAsync: function(url) {
		return new Promise(function (resolve, reject) {
		request(url, function (err, res, body) {
			if (err) { return reject(err); }
			return resolve(JSON.parse(body));
		});
		});
	},

	socketNotificationReceived: function(notification, payload) {
		if (notification === "MMM-nutrislice-menu-NOTIFICATION_TEST") {
			console.log("Working notification system. Notification:", notification, "payload: ", payload);
			// Send notification
			this.sendNotificationTest(this.anotherFunction()); //Is possible send objects :)
		}
		if (notification === "DATA_REQUEST") {
			console.log("DATA URL:", payload)

			this.sendSocketNotification("DATA_REQUEST", this.getStats(payload))
			//this.sendSocketNotification("MMM-nutrislice-menu-NOTIFICATION_TEST", this.anotherFunction())
		}
	},

	// Example function send notification test
	sendNotificationTest: function(payload) {
		this.sendSocketNotification("MMM-nutrislice-menu-NOTIFICATION_TEST", payload);
	},

	// this you can create extra routes for your module
	extraRoutes: function() {
		var self = this;
		this.expressApp.get("/MMM-nutrislice-menu/extra_route", function(req, res) {
			// call another function
			values = self.anotherFunction();
			res.send(values);
		});
	},

	// Test another function
	anotherFunction: function() {
		return {date: new Date()};
	}
});
