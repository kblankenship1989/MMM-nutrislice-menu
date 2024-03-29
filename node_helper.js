/* Magic Mirror
 * Node Helper: MMM-nutrislice-menu
 *
 * By Blankenship Mirror
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");
const Log = require("logger");

module.exports = NodeHelper.create({

	// Override socketNotificationReceived method.

	/* socketNotificationReceived(notification, payload)
	 * This method is called when a socket notification arrives.
	 *
	 * argument notification string - The identifier of the noitication.
	 * argument payload mixed - The payload of the notification.
	 */

	start: function() {
		Log.log("====================== Starting node_helper for module [" + this.name + "]");
	},

	getData: function(notification, myUrl) {
		//myUrl = "https://pleasantvalley.nutrislice.com/menu/api/weeks/school/elementary/menu-type/lunch/2021/02/21/?format=json";

		fetch(myUrl)
			.then(NodeHelper.checkFetchStatus)
			.then((response) => response.json())
			.then((jsonResponse) => {
				Log.log(this.name + 'notification = ' + notification);
				if (notification == "FETCH_CURRENT_WEEK_MENU"){
					this.sendSocketNotification("CURRENT_WEEK_MENU", jsonResponse);
				}
				else if (notification == "FETCH_NEXT_WEEK_MENU"){
					this.sendSocketNotification("NEXT_WEEK_MENU", jsonResponse);
				}
			})
			.catch((err) => {
				Log.log(this.name + 'request error = ' + err);
				this.sendSocketNotification("STATUSERROR", err);
			});

		// request({
		// 	url: myUrl,
		// 	method: "GET"
		// 	//headers: { 'RNV_API_TOKEN': this.config.apiKey }
		// }, function (error, response, body) {
		// 	Log.log(this.name + ' request response for ' + myUrl + ': ' + JSON.stringify(response));
		// 	if (!error && response.statusCode == 200) {
		// 		if (notification == "FETCH_CURRENT_WEEK_MENU"){
		// 			this.sendSocketNotification("CURRENT_WEEK_MENU", body);
		// 		}
		// 		else if (notification == "FETCH_NEXT_WEEK_MENU"){
		// 			this.sendSocketNotification("NEXT_WEEK_MENU", body);
		// 		}
		// 	} else {
		// 		this.sendSocketNotification("STATUSERROR", error);
		// 	}
		// });
	},


	socketNotificationReceived: function(notification, payload) {
		Log.log(this.name + " has received notification: " + notification);
		if ((notification === "FETCH_CURRENT_WEEK_MENU" || notification === "FETCH_NEXT_WEEK_MENU")) {
			this.sendSocketNotification("NUTRISLICE_STARTED", true);
			this.getData(notification, payload);
		}
	},
});
