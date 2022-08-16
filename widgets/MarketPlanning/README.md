# README #
Version 1.0.0

### What is this repository for? ###

* This is a demonstration of a widget that collects user input data, calls out to our external API, and displays the response in a variety of graphs and charts.

### How do I get set up? ###

* Download [Esri's Web AppBuilder](https://developers.arcgis.com/web-appbuilder/)
* Run the included 'startup.bat' file.
* **If you have git:**
    * Navigate to the "client/stemapp/widgets' directory
    * Run "https://zackgarza@bitbucket.org/zackgarza/marketplanning.git"
    * Refresh the Wen AppBuilder page in your browser, the widget will now be available to add to new map application. (Note that in order to add this widget to existing applications, you must manually copy the widget from the 'client/stemapp/widgets' folder to the 'server/apps/yourapp/widgets' folder.)
* **If you do not have git:**
    * Navigate to the "Downloads" option on the left hand side of this page.
    * Navigate to "Branches", and select the zip option next to the master branch.
    * Unzip this file to your app's widget folder to make it available to your application. 
    * (Note: if you are not using the Web AppBuilder, you must edit the config.json manually, plus add the widget to your application's manifest.)

### How do I get updates? ###

If you are using git, simply go to your widgets/marketplanning directory and run 'git pull origin'.

Otherwise, simply download the zip as described above, and copy over everything except your configuration file.