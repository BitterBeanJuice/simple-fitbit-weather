import { me as companion } from "companion";
import { outbox } from "file-transfer";
import * as cbor from "cbor";
import * as messaging from "messaging";
import { localStorage } from "local-storage";
import {
    WEATHER_FILE,
    Message,
    MESSAGE_TYPE,
    Forecast,
    Location,
} from "../common";
import { trace, Configuration, Providers } from "./common";
import { geolocation, PositionOptions } from "geolocation";
import { fetchOpenWeather } from "./Providers/open-weather-map";

// Export to allow companion app to use common types
export { Configuration, Providers } from "./common";

const MILLISECONDS_PER_MINUTE = 1000 * 60;
const STORAGE_KEY = "weather";

// Current configuration
let _configuration: Configuration;

const wake = () => {
    console.log(`wake ${Date.now()}`);
    refresh();
};

/**
 * Initialize the module
 * @param configuration to use with the weather API
 */
export function initialize(configuration: Configuration): void {
    // Save the configuration
    _configuration = configuration;

    console.log(
        `Initialize companion ${
            MILLISECONDS_PER_MINUTE * _configuration.refreshInterval
        }`
    );

    try {
        companion.wakeInterval =
            MILLISECONDS_PER_MINUTE * _configuration.refreshInterval;
        companion.addEventListener("wakeinterval", wake);
    } catch (ex) {
        trace(ex);
    }

    // Call the refresh
    refresh();
}

/**
 * Refresh weather data
 */
export function refresh(): void {
    // load the weather from file
    const cachedWeather = loadCache();

    console.log(
        `Refreshing weather\nCached timestamp: ${
            cachedWeather?.timestamp
        }\nMax age: ${
            cachedWeather?.timestamp + _configuration.maximumAge * 60 * 1000
        }\nNow: ${Date.now()}`
    );

    // Update if data are too old or undfined
    if (
        cachedWeather?.timestamp === undefined ||
        cachedWeather.timestamp + _configuration.maximumAge * 60 * 1000 <=
            Date.now()
    ) {
        // Call the api
        fetchWeather(
            _configuration.provider,
            _configuration.apiKey,
            cachedWeather?.location
        )
            .then((data) => cacheAndSend(data))
            .catch((ex) => trace(ex));
    }
}

/**
 * Load weather from cache
 */
function loadCache(): Forecast {
    try {
        const str = localStorage.getItem(STORAGE_KEY);
        if (str === null) return undefined;
        const weatcher = JSON.parse(str);
        if (str === null) return undefined;
        return weatcher;
    } catch (ex) {
        trace("Load weather file error : " + ex);
        return undefined;
    }
}

/**
 * Send data to this device app
 * @param data to save and send to the app
 */
function cacheAndSend(data: Forecast) {
    // Write the file to have a local cache
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (ex) {
        trace("Set weather cache error :" + JSON.stringify(ex));
    }

    // Test if socket is open
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
        // Send via socket
        const message: Message = {
            type: MESSAGE_TYPE,
            weather: data,
        };
        messaging.peerSocket.send(message);
    } else {
        // Encode data as cbor and send it as file
        outbox.enqueue(WEATHER_FILE, cbor.encode(data));
    }
}

const fetchWeather = (
    provider: Providers,
    apiKey: string,
    location?: Location
): Promise<Forecast> => {
    // Create a promise to return
    return new Promise<Forecast>((resolve, reject) => {
        const start = Date.now();

        // Set geolocation options
        const positionOptions: PositionOptions = {
            enableHighAccuracy: false,
            timeout: 13 * 1000,
            maximumAge: 120 * MILLISECONDS_PER_MINUTE,
        };

        console.log(`Waiting for GPS ${Date.now()}`);

        // Get the current position
        geolocation.getCurrentPosition(
            (position) => {
                const end = Date.now();
                const minutes = (end - start) / (60 * 1000);
                const cached = loadCache();
                const timeSinceLastWeather =
                    (end - (cached?.timestamp || 0)) / (60 * 1000);
                console.log(
                    `GPS found after ${minutes} minutes. Weather is ${timeSinceLastWeather} minutes old.`
                );

                if (timeSinceLastWeather > 4) {
                    fetchOpenWeather(
                        apiKey,
                        position.coords.latitude,
                        position.coords.longitude
                    )
                        .then(resolve)
                        .catch(reject);
                }
            },
            (e) => {
                console.log(
                    `GPS fail. Using ${JSON.stringify(location)} ${Date.now()}`
                );
                if (location) {
                    fetchOpenWeather(apiKey, location.lat, location.lon)
                        .then(resolve)
                        .catch(reject);
                }
            },
            positionOptions
        );
    });
};
