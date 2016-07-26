# Propertybase Website Demo

A minimal website showcasing Propertybase's webservices. The website can be connected directly to a demo instance of Propertybase. See section "Quickstart" below on how to set it up!

Check out our [live version](http://website-demo.propertybase.com/) connected to a demo instance.

![Screenshot](https://s3.amazonaws.com/propertybase-resources/webservices/screenshot.jpg)

## Showcased webservices

* **Weblisting Service**
  <br>
  Show listings on your website using the [Weblisting Service](https://help.propertybase.com/hc/en-us/articles/202900036-Weblisting-Overview)

* **Web To Prospect**
  <br>
  Capture your website contact forms using the [Web To Prospect REST API](https://help.propertybase.com/hc/en-us/articles/202900026-Web-To-Prospect-REST-API-Preferred)
  * Request more info on listing
  * Submit a general search request

## Underlying technologies

* jQuery
* jQuery UI
* Handlebars.js
* Leaflet.js
* PHP

## Requirements

* PHP 5.6
* Apache or Nginx

## Quickstart

* [Activate your Webservices](https://help.propertybase.com/hc/en-us/articles/203188153-Activating-Webservices)

* Setup service endpoints and tokens

  * Option 1: Hardcode your service endpoints and tokens into `config.php`

  * Option 2: Set up environment variables on server and retrieve them in `config.php`

    * WEB2PROSPECT_ENDPOINT
    * WEB2PROSPECT_TOKEN
    * WEBLISTINGS_ENDPOINT
    * WEBLISTINGS_TOKEN

* Accept any server (peer) certificate for local development in `config.php` by setting `$dev_env` to `true` (necessary to run the website without the need for importing certificates)

## Before you go live

* Reset `$dev_env` to `false` on production environments (otherwise there is the risk of man-in-the-middle attacks)

* If you have problems with encryption visit `php/phpinfo.php` to find out if you are on the latest PHP version that supports TLS 1.1

* Remove `php/phpinfo.php`

* Use a map tile layer for commercial use, e.g. [MapBox](https://www.mapbox.com/).
  <br>
  (the default tile layer of OpenStreetMap is under a fair use policy)

* Comment out `console.info` statements in `assets/js/scripts.js`

* Listing results are limited to 9 listings by default (adjust limit to your needs)