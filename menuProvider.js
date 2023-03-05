const MenuProvider = Class.extend({
	// Menu Provider Properties
	providerName: null,
	defaults: {},

	// The following properties have accessor methods.
	// Try to not access them directly.
	currentMenuObject: null,


	// The following properties will be set automatically.
	// You do not need to overwrite these properties.
	config: null,
	delegate: null,

	// Menu Provider Methods
	// All the following methods can be overwritten, although most are good as they are.

	// Called when a Menu provider is initialized.
	init: function (config) {
		this.config = config;
		Log.info(`Menu provider: ${this.providerName} initialized.`);
	},

	// Called to set the config, this config is the same as the Menu module's config.
	setConfig: function (config) {
		this.config = config;
		Log.info(`Menu provider: ${this.providerName} config set.`, this.config);
	},

	// Called when the Menu provider is about to start.
	start: function () {
		Log.info(`Menu provider: ${this.providerName} started.`);
	},
    buildBaseEndpoint: function () {
		/*
		websiteUrl = "https://pleasantvalley.nutrislice.com/menu/elementary/lunch/"
		ApiUrl = "https://pleasantvalley.api.nutrislice.com/menu/api/weeks/school/elementary/menu-type/lunch/2021/02/21/?format=json";
		*/
		const websiteUrl = this.config.nutrisliceEndpoint;
		const regExExtractUrl = /https:\/\/(.+)\.nutrislice\.com\/m\w*\/(.+)\/(.+)\//;
		const match = websiteUrl.match(regExExtractUrl);
		if ((match || []).length == 4) {
			const baseUrl = `https://${match[1]}.api.nutrislice.com/menu/api/weeks/school/${match[2]}/menu-type/${match[3]}`;
			return baseUrl;
		}
		return "";
	},
	setEndpoint: function (date) {

		const baseUrl = this.buildBaseEndpoint();
		const endpoint = `${baseUrl}/${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}/?format=json`;
		return endpoint;
	},
	getMenuData: function (currentWeek) {
		if (this.loaded === false) {
			this.updateDom(this.config.animationSpeed);
		}
		this.loaded = true;
		// the data if load
		// send notification to helper
		const currentDate = new Date();
		const nextWeekDate = new Date();
		nextWeekDate.setDate(currentDate.getDate()+7)
		if (currentWeek) {
			const endpoint = this.setEndpoint(currentDate);
			console.log("FETCH_CURRENT_WEEK_MENU endpoint: " + endpoint);
			//this.sendSocketNotification("FETCH_CURRENT_WEEK_MENU", endpoint);
		} else {
			const endpoint = this.setEndpoint(nextWeekDate);
			console.log("FETCH_NEXT_WEEK_MENU endpoint: " + endpoint);
			//this.sendSocketNotification("FETCH_NEXT_WEEK_MENU", endpoint);
		}
        return(endpoint);
	}
});



/**
 * Static method to initialize a new Menu provider.
 *
 * @param {object} delegate The Menu module
 * @returns {object} The new Menu provider
 */
MenuProvider.initialize = function (delegate) {

	const provider = new MenuProvider();
	const config = Object.assign({}, provider.defaults, delegate.config);

	provider.delegate = delegate;
	provider.setConfig(config);

	return provider;
};