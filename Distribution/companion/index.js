import { me as companion } from "companion";
import { outbox } from "file-transfer";
import * as cbor from "cbor";
import * as messaging from "messaging";
import { localStorage } from "local-storage";
import { WEATHER_FILE, MESSAGE_TYPE, } from "../common";
import { trace } from "./common";
import { geolocation } from "geolocation";
import { fetchOpenWeather } from "./Providers/open-weather-map";
// Export to allow companion app to use common types
export { Providers } from "./common";
var MILLISECONDS_PER_MINUTE = 1000 * 60;
var STORAGE_KEY = "weather";
// Current configuration
var _configuration;
var wake = function () {
    console.log("wake " + Date.now());
    refresh();
};
/**
 * Initialize the module
 * @param configuration to use with the weather API
 */
export function initialize(configuration) {
    // Save the configuration
    _configuration = configuration;
    console.log("Initialize companion " + MILLISECONDS_PER_MINUTE * _configuration.refreshInterval);
    try {
        companion.wakeInterval =
            MILLISECONDS_PER_MINUTE * _configuration.refreshInterval;
        companion.addEventListener("wakeinterval", wake);
    }
    catch (ex) {
        trace(ex);
    }
    // Call the refresh
    refresh();
}
/**
 * Refresh weather data
 */
export function refresh() {
    // load the weather from file
    var cachedWeather = loadCache();
    console.log("Refreshing weather\nCached timestamp: " + (cachedWeather === null || cachedWeather === void 0 ? void 0 : cachedWeather.timestamp) + "\nMax age: " + ((cachedWeather === null || cachedWeather === void 0 ? void 0 : cachedWeather.timestamp) + _configuration.maximumAge * 60 * 1000) + "\nNow: " + Date.now());
    // Update if data are too old or undfined
    if ((cachedWeather === null || cachedWeather === void 0 ? void 0 : cachedWeather.timestamp) === undefined ||
        cachedWeather.timestamp + _configuration.maximumAge * 60 * 1000 <=
            Date.now()) {
        // Call the api
        fetchWeather(_configuration.provider, _configuration.apiKey, cachedWeather === null || cachedWeather === void 0 ? void 0 : cachedWeather.location)
            .then(function (data) { return cacheAndSend(data); })
            .catch(function (ex) { return trace(ex); });
    }
}
/**
 * Load weather from cache
 */
function loadCache() {
    try {
        var str = localStorage.getItem(STORAGE_KEY);
        if (str === null)
            return undefined;
        var weatcher = JSON.parse(str);
        if (str === null)
            return undefined;
        return weatcher;
    }
    catch (ex) {
        trace("Load weather file error : " + ex);
        return undefined;
    }
}
/**
 * Send data to this device app
 * @param data to save and send to the app
 */
function cacheAndSend(data) {
    // Write the file to have a local cache
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
    catch (ex) {
        trace("Set weather cache error :" + JSON.stringify(ex));
    }
    // Test if socket is open
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
        // Send via socket
        var message = {
            type: MESSAGE_TYPE,
            weather: data,
        };
        messaging.peerSocket.send(message);
    }
    else {
        // Encode data as cbor and send it as file
        outbox.enqueue(WEATHER_FILE, cbor.encode(data));
    }
}
var fetchWeather = function (provider, apiKey, location) {
    // Create a promise to return
    return new Promise(function (resolve, reject) {
        var start = Date.now();
        // Set geolocation options
        var positionOptions = {
            enableHighAccuracy: false,
            timeout: 3 * MILLISECONDS_PER_MINUTE,
            maximumAge: 120 * MILLISECONDS_PER_MINUTE,
        };
        console.log("Waiting for GPS " + Date.now());
        // Get the current position
        geolocation.getCurrentPosition(function (position) {
            var end = Date.now();
            var minutes = (end - start) / (60 * 1000);
            var cached = loadCache();
            var timeSinceLastWeather = (end - ((cached === null || cached === void 0 ? void 0 : cached.timestamp) || 0)) / (60 * 1000);
            console.log("GPS found after " + minutes + " minutes. Weather is " + timeSinceLastWeather + " minutes old.");
            if (timeSinceLastWeather > 4) {
                fetchOpenWeather(apiKey, position.coords.latitude, position.coords.longitude)
                    .then(resolve)
                    .catch(reject);
            }
        }, function (e) {
            console.log("GPS fail. Using " + JSON.stringify(location) + " " + Date.now());
            if (location) {
                fetchOpenWeather(apiKey, location.lat, location.lon)
                    .then(resolve)
                    .catch(reject);
            }
        }, positionOptions);
    });
};
