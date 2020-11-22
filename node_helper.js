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
		//myUrl = "https://pleasantvalley.nutrislice.com/menu/api/weeks/school/elementary/menu-type/lunch/2020/10/12/?format=json";

		request({
			url: myUrl,
			method: "GET"
			//headers: { 'RNV_API_TOKEN': this.config.apiKey }
		}, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				self.sendSocketNotification("DATA", body);
			} else {
				self.sendSocketNotification("STATUSERROR", response.statusCode);
			}
		});
		self.sendSocketNotification("GETDATATIMEOUT", true);
		setTimeout(function() { self.getData(); }, this.config.retryDelay);
	},


	socketNotificationReceived: function(notification, payload) {
		var self = this;
		if (notification === "UPDATE" && self.started == false) {
			self.sendSocketNotification("STARTED", true);
			self.getData(payload);
			self.started = true;
		}
	},


});
