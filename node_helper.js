/* Magic Mirror
 * Node Helper: MMM-nutrislice-menu
 *
 * By Blankenship Mirror
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");
const request = require("request");
var moment = require("moment");

module.exports = NodeHelper.create({

	// Override socketNotificationReceived method.

	/* socketNotificationReceived(notification, payload)
	 * This method is called when a socket notification arrives.
	 *
	 * argument notification string - The identifier of the noitication.
	 * argument payload mixed - The payload of the notification.
	 */

	start: function() {
		this.started = false;
		console.log("====================== Starting node_helper for module [" + this.name + "]");
	},

	getData: function(myUrl) {
		var self = this;

		//var myUrl = this.config.apiBase + this.config.requestURL + '?hafasID=' + this.config.stationID + '&time=' + currentDate;
		myUrl = "https://pleasantvalley.nutrislice.com/menu/api/weeks/school/elementary/menu-type/lunch/2020/10/12/?format=json";

		console.log("data request started console.log from node_helper");
		Log.info("data request started Log.info from node_helper");

		request({
			url: myUrl,
			method: "GET"
			//headers: { 'RNV_API_TOKEN': this.config.apiKey }
		}, function (error, response, body) {
			console.log("nutrislice response code: " + response.statusCode);
			if (!error && response.statusCode == 200) {
				self.sendSocketNotification("DATA", body);
			} else {
				self.sendSocketNotification("STATUSERROR", response.statusCode);
			}
		});

		setTimeout(function() { self.getData(); }, this.config.retryDelay);
	},


	socketNotificationReceived: function(notification, payload) {
		var self = this;
		if (notification === "UPDATE" && self.started == false) {
			//self.config = payload;
			self.sendSocketNotification("STARTED", true);
			self.getData(payload);
			self.started = true;
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
