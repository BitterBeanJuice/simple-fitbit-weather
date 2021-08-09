import { Conditions, } from "../../common";
var mapping_codes = {
    511: Conditions.Snow,
    520: Conditions.ShowerRain,
    521: Conditions.ShowerRain,
    522: Conditions.ShowerRain,
    531: Conditions.ShowerRain,
    800: Conditions.ClearSky,
    801: Conditions.FewClouds,
    802: Conditions.ScatteredClouds,
    803: Conditions.BrokenClouds,
    804: Conditions.BrokenClouds,
};
var tempToC = function (value) { return value - 273.15; };
var tempToF = function (value) { return ((value - 273.15) * 9) / 5 + 32; };
var getCondition = function (value) {
    if (mapping_codes[value] !== undefined) {
        return mapping_codes[value];
    }
    if (value >= 200 && value < 300) {
        return Conditions.Thunderstorm;
    }
    if (value >= 300 && value < 400) {
        return Conditions.Rain;
    }
    if (value >= 500 && value < 600) {
        return Conditions.Rain;
    }
    if (value >= 600 && value < 700) {
        return Conditions.Snow;
    }
    if (value >= 700 && value < 800) {
        return Conditions.Mist;
    }
    return Conditions.Unknown;
};
/**
 * Fetch data from Open Weather Map
 */
export function fetchOpenWeather(apiKey, latitude, longitude) {
    return new Promise(function (resolve, reject) {
        var url = "https://api.openweathermap.org/data/2.5/onecall?appid=" +
            apiKey +
            "&lat=" +
            latitude +
            "&lon=" +
            longitude +
            "&exclude=minutely" +
            "&units=imperial";
        console.log("Call Weather API " + Date.now());
        fetch(encodeURI(url))
            .then(function (response) { return response.json(); })
            .then(function (data) {
            var _a, _b;
            if (data.current === undefined) {
                reject(data.message);
                return;
            }
            var currentCondition = (data.current.weather || [])[0].id;
            console.log(data.hourly[0].dt + " " + Date.now());
            if (data.hourly[0].dt * 1000 < Date.now()) {
                // Remove first hourly data if it's old
                data.hourly.splice(0, 1);
            }
            var response = {
                daily: (_a = data.daily) === null || _a === void 0 ? void 0 : _a.map(function (d) {
                    var condition = (d.weather || [])[0].id;
                    return {
                        maxF: d.temp.max,
                        minF: d.temp.min,
                        timestamp: d.dt * 1000,
                        condition: getCondition(condition),
                        uvIndex: d.uvi,
                    };
                }).slice(0, 7),
                hourly: (_b = data.hourly) === null || _b === void 0 ? void 0 : _b.map(function (d) {
                    var condition = (d.weather || [])[0].id;
                    return {
                        tempF: d.temp,
                        timestamp: d.dt * 1000,
                        condition: getCondition(condition),
                        uvIndex: d.uvi,
                    };
                }).slice(0, 24),
                current: {
                    tempF: data.current.temp,
                    timestamp: data.current.dt * 1000,
                    condition: getCondition(currentCondition),
                    uvIndex: data.current.uvi,
                },
                timestamp: Date.now(),
                location: {
                    lat: latitude,
                    lon: longitude,
                },
            };
            resolve(response);
        })
            .catch(function (e) { return reject(e.message); });
    });
}
