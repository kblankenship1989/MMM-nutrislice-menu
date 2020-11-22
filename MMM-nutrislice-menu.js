/* global Module */

/* Magic Mirror
 * Module: MMM-nutrislice-menu
 *
 * By Kurtis Blankenship
 * MIT Licensed.
 */

Module.register("MMM-nutrislice-menu", {
	defaults: {
		updateInterval: 3600000,
		retryDelay: 60000,
		title: "Menu",
		menuType: "lunch",
		schoolEndpoint: "",
		itemLimit: 5,
		showPast: true
	},

	requiresVersion: "2.1.0", // Required version of MagicMirror

	start: function () {
		var self = this;
		Log.info("Starting module: " + this.name);
		var dataRequest = null;
		var dataNotification = null;

		//Flag for check if module is loaded
		this.loaded = false;

		// Schedule update timer.
		//this.getData();
		this.processData();
		setInterval(function () {
			self.updateDom();
		}, this.config.updateInterval);
	},


	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update.
	 *  If empty, this.config.updateInterval is used.
	 */
	scheduleUpdate: function (delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}
		nextLoad = nextLoad;
		var self = this;
		setTimeout(function () {
			self.processData();
		}, nextLoad);
	},

	getDom: function () {
		const itemLimit = this.config.itemLimit;
		console.log("itemLimit: ", itemLimit);

		// create element wrapper for show into the module
		var wrapper = document.createElement("div");
		wrapper.className = "dimmed small";

		//make header
		var statElement = document.createElement("header");
		var title = this.config.title;
		statElement.innerHTML = title;
		wrapper.appendChild(statElement);

		if (this.config.schoolEndpoint ===""){
			wrapper.innerHTML = "No <i>School Endpoint</i> set in config file";
			return wrapper;
		}

		if (!this.loaded) {
			wrapper.innerHTML = this.translate("LOADING");
			return wrapper;
		}
		if (!this.dataRequest) {
			wrapper.innerHTML = "No data";
			return wrapper;
		}

		// If this.dataRequest is not empty
		if (this.dataRequest) {
			//Format the data to the screen
			var tableElement = document.createElement("table");
			tableElement.className = this.config.tableClass;
			const mapOfDays = this.getMapOfDays(this.dataRequest);
			console.log(mapOfDays);
			if ((mapOfDays || []).length > 0) {
				console.log("MapOfDay key: ", Object.keys(mapOfDays))
				var tableRow = document.createElement("tr");

				Object.keys(mapOfDays).forEach(function (day) {
					var tableCell = document.createElement("td");
					var dayItem = document.createElement("u");
					dayItem.innerHTML = day + "-" + mapOfDays[day].activityDay;
					tableCell.appendChild(dayItem);
					tableCell.appendChild(document.createElement("br"));
					var itemCount = 0;
					mapOfDays[day].foodList.forEach(function (item) {
						//console.log(itemCount, item);
						if (itemCount < itemLimit || itemLimit == 0) {
							var foodItem = document.createElement("span");
							foodItem.innerHTML = item;
							tableCell.appendChild(foodItem);
							tableCell.appendChild(document.createElement("br"));
							itemCount++;
						}
					})
					tableRow.appendChild(tableCell);
				})
				tableElement.appendChild(tableRow);
			}

			wrapper.appendChild(tableElement);
			//end Format response to screen
		}

		// Data from helper
		if (this.dataNotification) {
			var wrapperDataNotification = document.createElement("div");
			// translations  + datanotification
			wrapperDataNotification.innerHTML = this.translate("UPDATE") + ": " + this.dataNotification.date;
			//wrapperDataNotification.innerHTML =  "Data" + ": " + this.result;
			wrapper.appendChild(wrapperDataNotification);
		}
		return wrapper;
	},

	getWeekDay(dateString) {
		//console.log("getWeekDay: ", dateString);
		const date = new Date(dateString);
		var weekday = new Array(7);
		weekday[6] = "Sunday";
		weekday[0] = "Monday";
		weekday[1] = "Tuesday";
		weekday[2] = "Wednesday";
		weekday[3] = "Thursday";
		weekday[4] = "Friday";
		weekday[5] = "Saturday";
		return weekday[date.getDay()];
	},

	getMapOfDays(data) {
		const mapOfDays = {};

		//for (day in data.days || []) {
		today = new Date();
		today.setDate(today.getDate() - 1);
		var showPast = this.config.showPast;
		console.log("showPast: ", showPast);
		for (key in Object.keys(data.days)) {
			var day = data.days[key];
			var date = new Date(day.date);
			if (day && day.date && (day.menu_items || []).length && (date >= today || showPast)) {
				var listOfFood = [];
				var dayObj = {};
				for (itemKey in Object.keys(day.menu_items)) {
					var item = day.menu_items[itemKey];
					if (item.text && item.text.startsWith("Day")) {
						dayObj["activityDay"] = item.text;
					}
					if (item.food && item.food.name) {
						listOfFood.push(item.food.name);
					}
				}
				dayObj["foodList"] = listOfFood;
				mapOfDays[this.getWeekDay(data.days[key].date)] = dayObj;
				//mapOfDays[key] = listOfItems;
			}
		}
		return mapOfDays;
	},

	getScripts: function () {
		return [];
	},

	getStyles: function () {
		return [
			"MMM-nutrislice-menu.css",
		];
	},

	// Load translations files
	getTranslations: function () {
		//FIXME: This can be load a one file javascript definition
		return {
			en: "translations/en.json",
			es: "translations/es.json"
		};
	},

	processData: function () {
		var self = this;
		if (this.loaded === false) {
			self.updateDom(self.config.animationSpeed);
		}
		this.loaded = true;

		// the data if load
		// send notification to helper
		const schoolEndpoint = this.config.schoolEndpoint;
		const menuType = this.config.menuType;
		const currentDate = new Date();
		const endpoint = `https://${schoolEndpoint}/menu-type/${menuType}/${currentDate.getFullYear()}/${currentDate.getMonth() + 1}/${currentDate.getDate()}/`;
		console.log("endpoint: " + endpoint);
		this.sendSocketNotification("MMM-nutrislice-menu-NOTIFICATION_TEST", endpoint);
		//this.sendSocketNotification("DATA_REQUEST", endpoint);
	},

	// socketNotificationReceived from helper
	socketNotificationReceived: function (notification, payload) {
		//console.log(notification);
		if (notification === "STARTED") {
			this.updateDom();
		}
		else if (notification === "MMM-nutrislice-menu-NOTIFICATION_TEST") {
			// set dataNotification
			console.log(payload)
			this.dataNotification = payload;
			this.updateDom();
		}
	},
});