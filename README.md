# MMM-nutrislice-menu

This is a module for the [MagicMirror²](https://github.com/MichMich/MagicMirror/).

This module is used to display the current weeks menu for a nenus that are hosted by nutrislice (www.nutrislice.com).  It will display as a column for each day of the week with the menu items name underneath.  

## Using the module

To use this module, add the following configuration block to the modules array in the `config/config.js` file:
```js
var config = {
    modules: [
        {
            module: 'MMM-nutrislice-menu',
            position:	'top_left',
            header: 'menu',
            config: {
                updateInterval: 3600000,
		        retryDelay: 60000,
		        menuType: 'lunch',
		        nutrisliceEndpoint: 'ENTER YOUR MENU ENDPOINT HERE',
		        itemLimit: 0,
		        showPast: true
            }
        }
    ]
}
```

## Configuration options

| Option               | Description
|--------------------- |-----------
| `nutrisliceEndpoint` | *Required* Your menu endpoint <br><br>**Type:** `string` <br>example "https://pleasantvalley.nutrislice.com/menu/api/weeks/school/elementary"
| `menuType`           | *Optional* Your menu type <br><br>**Type:** `string` <br>Default "lunch"
| `title`              | *Optional* Title for the module on the screen <br><br>**Type:** `string` <br>Default "Menu"
| `itemLimit`          | *Optional* Max number of items to show on a single day (0 = unlimited) <br><br>**Type:** `int` <br>Default 0
| `showPast`           | *Optional* Should Days in the Past show (if this is false then come Tuesday you wont see Monday anymore) <br><br>**Type:** `booleen` <br>Default true
| `updateInterval`     | *Optional* How often the module will call the API for new data <br><br>**Type:** `int`(milliseconds) <br>Default 3600000 milliseconds (1 hour)
| `retryDelay`         | *Optional* How long to wait after a failed call to try again <br><br>**Type:** `int`(milliseconds) <br>Default 60000 milliseconds (1 minute)
