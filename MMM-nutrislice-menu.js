/* global Module */

/* Magic Mirror
 * Module: MMM-nutrislice-menu
 *
 * By Kurtis Blankenship
 * MIT Licensed.
 */

Module.register("MMM-nutrislice-menu", {
	defaults: {
		updateInterval: 60000,
		retryDelay: 5000,
		title: "Menu",
		menuType: "lunch"
	},

	requiresVersion: "2.1.0", // Required version of MagicMirror

	start: function() {
		var self = this;
		var dataRequest = null;
		var dataNotification = null;

		//Flag for check if module is loaded
		this.loaded = false;

		// Schedule update timer.
		this.getData();
		setInterval(function() {
			self.updateDom();
		}, this.config.updateInterval);
	},

	/*
	 * getData
	 * function example return data and show it in the module wrapper
	 * get a URL request
	 *
	 */
	getData: function() {
		var self = this;
		//var urlApi = "https://jsonplaceholder.typicode.com/posts/1";
		//var urlApi = "https://pleasantvalley.nutrislice.com/menu/api/weeks/school/elementary/menu-type/lunch/2020/4/12/";
		const schoolEndpoint = this.config.schoolEndpoint;
    	const menuType = "lunch"; //this.config.menuType;
    	const currentDate = new Date();
		var urlApi = `https://${schoolEndpoint}/menu-type/${menuType}/${currentDate.getFullYear()}/${currentDate.getMonth() + 1}/${currentDate.getDate()}/`;
		console.log("endpoint: ", urlApi);
		var retry = true;

		var dataRequest = new XMLHttpRequest();
		dataRequest.open("GET", urlApi, true);
		dataRequest.onreadystatechange = function() {
			console.log(this.readyState);
			if (this.readyState === 4) {
				console.log(this.status);
				if (this.status === 200) {
					//console.log(this.response)
					self.processData(JSON.parse(this.response));
				} else if (this.status === 401) {
					self.updateDom(self.config.animationSpeed);
					Log.error(self.name, this.status);
					retry = false;
				} else {
					Log.error(self.name, "Could not load data.");
				}
				if (retry) {
					self.scheduleUpdate((self.loaded) ? -1 : self.config.retryDelay);
				}
			}
		};
		dataRequest.send();
	},


	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update.
	 *  If empty, this.config.updateInterval is used.
	 */
	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}
		nextLoad = nextLoad ;
		var self = this;
		setTimeout(function() {
			self.getData();
		}, nextLoad);
	},

	getDom: function() {
		var self = this;

		// create element wrapper for show into the module
		var wrapper = document.createElement("div");
		wrapper.className = "dimmed small";
		// If this.dataRequest is not empty

		var statElement = document.createElement("header");
		var title = this.config.title;
		statElement.innerHTML = title;
		wrapper.appendChild(statElement);

		if (this.dataRequest) {

			//var tableElement = document.createElement("table");
			var tableElement = document.createElement("div");
			const mapOfDays = this.getMapOfDays(this.dataRequest);
			console.log(mapOfDays);
			//if (Object.keys(mapOfDays).length > 0) {
			if ((this.dataRequest.days || []).length > 0) {
			//   for (key in Object.keys(mapOfDays)) {
			// 	this.addValues(key, mapOfDays[key], tableElement);
			// 	if (i < data.length - 1) {
			// 		var hr = document.createElement("hr");
			// 		hr.style = "border-color: #444;"
			// 		tableElement.appendChild(hr);
			// 	}
			//   }
				// for (key in Object.keys(this.dataRequest.days)) {
				// 	var dayItem = document.createElement("span");
				// 	dayItem.innerHTML = this.dataRequest.days[key].date;
				// 	tableElement.appendChild(dayItem);
				// 	tableElement.appendChild(document.createElement("br"));
				// 	//daylist.push(this.dataRequest.days[key].date);
				// }
				console.log("MapOfDay key: ", Object.keys(mapOfDays))
				//for (key in Object.keys(mapOfDays)) {
				Object.keys(mapOfDays).forEach(function (day) {
					var dayItem = document.createElement("span");
					dayItem.innerHTML = day;
					tableElement.appendChild(dayItem);
					tableElement.appendChild(document.createElement("br"));
					mapOfDays[day].forEach(function (item) {
					//	console.log(item);
					 	var foodItem = document.createElement("span");
					 	foodItem.innerHTML = item;
					 	tableElement.appendChild(foodItem);
					 	tableElement.appendChild(document.createElement("br"));
					 })
				})
			}

			wrapper.appendChild(tableElement);
		}

		// Data from helper
		if (this.dataNotification) {
			var wrapperDataNotification = document.createElement("div");
			// translations  + datanotification
			wrapperDataNotification.innerHTML =  this.translate("UPDATE") + ": " + this.dataNotification.date;
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
		return weekday[date.getDay()] + " " + dateString;
	},

	getMapOfDays(data) {
		const mapOfDays = {};

		//for (day in data.days || []) {
		for (key in Object.keys(data.days)) {
		  var day = data.days[key];
		  if (day && day.date && (day.menu_items || []).length) {
			  var listOfItems = [];
			  for (itemKey in Object.keys(day.menu_items)) {
				  	var item = day.menu_items[itemKey];
					var textToDisplay = "";
					if (item.text) {
				  textToDisplay += item.text;
					}
					if (item.food && item.food.name) {
				  textToDisplay += item.food.name;
					}
					listOfItems.push(textToDisplay);
			  }
			  mapOfDays[this.getWeekDay(data.days[key].date)] = listOfItems;
			  //mapOfDays[key] = listOfItems;
		  }
		}
		return mapOfDays;
	  },

	getScripts: function() {
		return [];
	},

	getStyles: function () {
		return [
			"MMM-nutrislice-menu.css",
		];
	},

	// Load translations files
	getTranslations: function() {
		//FIXME: This can be load a one file javascript definition
		return {
			en: "translations/en.json",
			es: "translations/es.json"
		};
	},

	processData: function(data) {
		var self = this;
		this.dataRequest = data;
		if (this.loaded === false) { self.updateDom(self.config.animationSpeed) ; }
		this.loaded = true;

		// the data if load
		// send notification to helper
		const schoolEndpoint = this.config.schoolEndpoint;
    	const menuType = "lunch"; //this.config.menuType;
    	const currentDate = new Date();
		const endpoint = `https://${schoolEndpoint}/menu-type/${menuType}/${currentDate.getFullYear()}/${currentDate.getMonth() + 1}/${currentDate.getDate()}/`;
		console.log(endpoint);
		this.sendSocketNotification("MMM-nutrislice-menu-NOTIFICATION_TEST", data);
		//this.sendSocketNotification("DATA_REQUEST", endpoint);
	},

	// socketNotificationReceived from helper
	socketNotificationReceived: function (notification, payload) {
		if(notification === "MMM-nutrislice-menu-NOTIFICATION_TEST") {
			// set dataNotification
			this.dataNotification = payload;
			this.updateDom();
		}
	},
});
