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
		menuType: "lunch",
		nutrisliceEndpoint: "",
		itemLimit: 0,
		showPast: true,
		daysToShow: 5
	},

	requiresVersion: "2.1.0", // Required version of MagicMirror

	start: function () {
		var self = this;
		Log.info("Starting module: " + this.name);
		var dataNotification = null;
		var dataNotification2 = null;

		//Flag for check if module is loaded
		this.loaded = false;

		// Schedule update timer.
		//this.getData();
		this.sendDataRequest(true);
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
			self.sendDataRequest(true);
		}, nextLoad);
	},

	getDom: function () {
		const itemLimit = this.config.itemLimit;

		// create element wrapper for show into the module
		var wrapper = document.createElement("div");
		wrapper.className = "dimmed small";

		var messageElement = document.createElement("div");
		if (this.config.nutrisliceEndpoint ===""){
			messageElement.innerHTML = "No <i>nutrislice Endpoint</i> set in config file";
			wrapper.appendChild(messageElement);
			return wrapper;
		}
		if (buildBaseEndpoint == ""){
			messageElement.innerHTML = "Unreconized <i>nutrislice Endpoint</i> set in config file";
			wrapper.appendChild(messageElement);
			return wrapper;
		}

		if (!this.loaded) {
			messageElement.innerHTML = this.translate("LOADING");
			wrapper.appendChild(messageElement);
			return wrapper;
		}
		if (!this.dataNotification) {
			messageElement.innerHTML = "No data";
			wrapper.appendChild(messageElement);
			return wrapper;
		}

		// If this.dataNotification is not empty
		if (this.dataNotification) {
			console.log("days1: ", this.dataNotification.days);
			var days = [...(this.dataNotification.days || [])];
			//console.log(days);
			//Format the data to the screen
			if (this.dataNotification2) {
				console.log("days2: ", this.dataNotification2.days);
				console.log("week 2 has data");
				days = [
					...days,
					...(this.dataNotification2.days || [])
				];
				console.log("concat days: ", days);
			}
			const mapOfDays = this.getMapOfDays(days);
			console.log("mapOfDays" , mapOfDays);
			if ((mapOfDays || []).length > 0) {
				var tableElement = document.createElement("table");
				tableElement.className = this.config.tableClass;
				var tableRow = document.createElement("tr");
				mapOfDays.forEach(function (day) {
					var tableCell = document.createElement("td");
					var dayItem = document.createElement("u");
					if (day.activityDay){
						dayItem.innerHTML = day.dayOfWeek + "-" + day.activityDay;
					} else {
						dayItem.innerHTML = day.dayOfWeek;
					}
					tableCell.appendChild(dayItem);
					tableCell.appendChild(document.createElement("br"));
					var itemCount = 0;
					day.foodList.forEach(function (item) {
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
				wrapper.appendChild(tableElement);
				//end Format response to screen
			}
			else {
				//API returned days but they have no food items to display
				messageElement.innerHTML = "No data";
				wrapper.appendChild(messageElement);
				return wrapper;
			}
		}


		var wrapperDataNotification = document.createElement("div");
		// translations
		wrapperDataNotification.innerHTML = this.translate("UPDATE") + " : " + new Date();
		//wrapperDataNotification.innerHTML =  "Data" + ": " + this.result;
		wrapper.appendChild(wrapperDataNotification);


		return wrapper;
	},

	getWeekDay(dateString) {
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

	getMapOfDays(days) {
		const mapOfDays = [];

		//for (day in data.days || []) {
		today = new Date();
		today.setDate(today.getDate() - 1);
		var showPast = this.config.showPast;
		for (key in Object.keys(days)) {
			var day = days[key];
			var date = new Date(day.date);
			if (day && day.date && (day.menu_items || []).length && (date >= today || showPast)) {
				var listOfFood = [];
				var dayObj = {dayOfWeek: this.getWeekDay(days[key].date)};
				for (itemKey in Object.keys(day.menu_items)) {
					var item = day.menu_items[itemKey];
					if (item.text && (item.text.startsWith("Day") || item.text.startsWith("Hybrid"))) {
						dayObj["activityDay"] = item.text;
					}
					if (item.food && item.food.name) {
						listOfFood.push(item.food.name);
					}
				}
				dayObj["foodList"] = listOfFood;
				//console.log("day added to mapOfDays", date);
				mapOfDays.push(dayObj);
				//mapOfDays[key] = listOfItems;
				if (Object.keys(mapOfDays).length >= this.config.daysToShow) {
					break;
				}
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

	buildBaseEndpoint() {
		/*
		websiteUrl = "https://pleasantvalley.nutrislice.com/menu/elementary/lunch/"
		ApiUrl = "https://pleasantvalley.nutrislice.com/menu/api/weeks/school/elementary/menu-type/lunch/2021/02/21/?format=json";
		*/
		const websiteUrl = this.config.nutrisliceEndpoint;
		const regExExtractUrl = /https:\/\/(.+)\.nutrislice\.com\/m\w*\/(.+)\/(.+)\//;
		const match = websiteUrl.match(regExExtractUrl);
		if (match.length == 4) {
			const baseUrl = `https://${match[1]}.nutrislice.com/menu/api/weeks/school/${match[2]}/menu-type/${match[3]}`;
			return baseUrl;
		}
		return "";
		const endpoint = `${BaseUrl}/${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}/?format=json`;
	},
	setEndpoint(date) {

		//const nutrisliceEndpoint = this.config.nutrisliceEndpoint;
		const baseUrl = buildBaseEndpoint();
		const menuType = this.config.menuType;
		//const endpoint = `https://${nutrisliceEndpoint}/menu-type/${menuType}/${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}/?format=json`;
		const endpoint = `${BaseUrl}/${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}/?format=json`;
		console.log("endpoint: " + endpoint);
		return endpoint;
	},


	sendDataRequest: function (currentWeek) {
		var self = this;
		if (this.loaded === false) {
			self.updateDom(self.config.animationSpeed);
		}
		this.loaded = true;
		// the data if load
		// send notification to helper
		const currentDate = new Date();
		const nextWeekDate = new Date();
		nextWeekDate.setDate(currentDate.getDate()+7)
		//const endpoint = `https://${nutrisliceEndpoint}/menu-type/${menuType}/${currentDate.getFullYear()}/${currentDate.getMonth() + 1}/${currentDate.getDate()}/?format=json`;
		if (currentWeek) {
			const endpoint = this.setEndpoint(currentDate);
			this.sendSocketNotification("UPDATE", endpoint);
		} else {
			const endpoint = this.setEndpoint(nextWeekDate);
			this.sendSocketNotification("UPDATE2", endpoint);
		}
	},

	// socketNotificationReceived from helper
	socketNotificationReceived: function (notification, payload) {
		//console.log(notification);
		if (notification === "STARTED") {
			this.updateDom();
		}
		else if (notification === "DATA") {
			// set dataNotification
			this.dataNotification = JSON.parse(payload);
			console.log("start date 1", this.dataNotification.start_date);
			this.sendDataRequest(false);
			//this.updateDom();
		}
		else if (notification === "DATA2") {
			// set dataNotification
			this.dataNotification2 = JSON.parse(payload);
			console.log("start date 2", this.dataNotification2.start_date);
			this.updateDom();
		}
		else if (notification === "STATUSERROR") {
			console.log(payload);
		}
	},
});