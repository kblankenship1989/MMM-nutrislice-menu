# MMM-nutrislice-menu

This is a module for the [MagicMirror²](https://github.com/MichMich/MagicMirror/).

This module is used to display the current weeks menu for a menus that are hosted by nutrislice (www.nutrislice.com).  It will display as a column for each day of the week with the menu items name underneath.  

# Install

```
cd ~/MagicMirror/modules
git clone https://github.com/kblankenship1989/MMM-nutrislice-menu
cd MMM-nutrislice-menu
npm install
```

## Using the module

To use this module, add the following configuration block to the modules array in the `config/config.js` file:
```js
var config = {
    modules: [
        {
            module: 'MMM-nutrislice-menu',
            position:	'top_left',
            header: 'School Menu',
            config: {
		        nutrisliceEndpoint: 'ENTER YOUR MENU ENDPOINT HERE',
		        itemLimit: 10,
		        showPast: true,
                showMenuText: true,
                daysToShow: 5,
                updateInterval: 3600000,
		        retryDelay: 60000,
		        retryLimit: 10,
		        dayText: {
			        "Day 1":"1-PE",
			        "Day 2":"2-Art",
			        "Day 3":"3-PE",
			        "Day 4":"4-Music"
		        },
		        weekdayShort: true
            }
        }
    ]
}
```

## Configuration options

| Option               | Description
|--------------------- |-----------
| `nutrisliceEndpoint` | *Required* Your menu endpoint <br><br>**Type:** `string` <br>example "https://pleasantvalley.nutrislice.com/menu/elementary/lunch/" or "https://polk-fl.nutrislice.com/m/davenport-elementary/lunch/"
| `itemLimit`          | *Optional* Max number of items to show on a single day (0 = unlimited) <br><br>**Type:** `int` <br>Default 0
| `showPast`           | *Optional* Should Days in the Past show (if this is false then come Tuesday you wont see Monday anymore) <br><br>**Type:** `booleen` <br>Default true
| `showMenuText`       | *Optional* Should Items configured as text instead of food be displayed <br><br>**Type:** `booleen` <br>Default true
| `daysToShow`         | *Optional* Max number of days to show <br><br>**Type:** `int` <br>Default 5
| `updateInterval`     | *Optional* How often the module will call the API for new data <br><br>**Type:** `int`(milliseconds) <br>Default 3600000 milliseconds (1 hour)
| `retryDelay`         | *Optional* How long to wait after a failed call to try again <br><br>**Type:** `int`(milliseconds) <br>Default 60000 milliseconds (1 minute)
| `retryLimit`         | *Optional* How many time can the API fail in a row until module stops trying <br><br>**Type:** `int`<br>Default 10 attempts 
| `dayText`            | *Optional* if key text is found in a days menu text its replacement text will be shown next to the weekday name <br><br>**Type:** `object`
| `weekdayShort`       | *Optional* show abrevations or full weekday names <br><br>**Type:** `booleen` <br>Default true<br>Example true = "Mon", false = "Monday"


