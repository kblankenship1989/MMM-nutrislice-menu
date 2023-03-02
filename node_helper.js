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

	getData: function(notification, myUrl) {
		var self = this;
		//myUrl = "https://pleasantvalley.nutrislice.com/menu/api/weeks/school/elementary/menu-type/lunch/2021/02/21/?format=json";

		request({
			url: myUrl,
			method: "GET"
			//headers: { 'RNV_API_TOKEN': this.config.apiKey }
		}, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				if (notification == "UPDATE"){
					self.sendSocketNotification("DATA", body);
				}
				else if (notification == "UPDATE2"){
					self.sendSocketNotification("DATA2", body);
				}
			} else {
				self.sendSocketNotification("STATUSERROR", response.statusCode);
			}
		});
		self.sendSocketNotification("GETDATATIMEOUT", true);

		setTimeout(function() { self.getData(); }, 60000);
	},


	socketNotificationReceived: function(notification, payload) {
		var self = this;
		if ((notification === "UPDATE" || notification === "UPDATE2") && self.started == false) {
			self.sendSocketNotification("STARTED", true);
			self.getData(notification, payload);
			self.started = true;
		}
	},


});
