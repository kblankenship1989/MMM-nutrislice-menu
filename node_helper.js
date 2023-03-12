/* Magic Mirror
 * Node Helper: MMM-nutrislice-menu
 *
 * By Blankenship Mirror
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");
const Log = require("logger");
const { request } = require("./request-helper");


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
			method: "GET",
			logger: Log,
			retryDelay: this.config.retryDelay,
			retryLimit: this.config.retryLimit,
		}, (body) => {
			if (notification == "UPDATE"){
				self.sendSocketNotification("DATA", body);
			}
			else if (notification == "UPDATE2"){
				self.sendSocketNotification("DATA2", body);
			}
		},
		() => {
			self.sendSocketNotification("REQUEST_ERROR");
		});
	},


	socketNotificationReceived: function(notification, payload) {
		var self = this;
		if ((notification === "UPDATE" || notification === "UPDATE2")) {
			self.sendSocketNotification("STARTED", true);
			self.getData(notification, payload);
			self.started = true;
		} else if(notification === "SET_CONFIG"){
			self.config = payload;
		}
	},


});
