import { Conditions } from "../../common";
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
            "&exclude=hourly,minutely";
        console.log("Call Weather API " + Date.now());
        fetch(encodeURI(url))
            .then(function (response) { return response.json(); })
            .then(function (data) {
            var _a;
            if (data.current === undefined) {
                reject(data.message);
                return;
            }
            var currentCondition = (data.current.weather || [])[0].id;
            var response = {
                daily: (_a = data.daily) === null || _a === void 0 ? void 0 : _a.map(function (d) {
                    var condition = (d.weather || [])[0].id;
                    return {
                        temperatureC: tempToC(d.temp.max),
                        temperatureF: tempToF(d.temp.max),
                        timestamp: d.dt,
                        conditionCode: getCondition(condition),
                        realConditionCode: condition.toString(),
                    };
                }),
                current: {
                    temperatureC: tempToC(data.current.temp),
                    temperatureF: tempToF(data.current.temp),
                    timestamp: data.current.dt,
                    conditionCode: getCondition(currentCondition),
                    realConditionCode: currentCondition.toString(),
                },
                timestamp: Date.now(),
                location: {
                    lat: latitude,
                    lon: longitude,
                },
            };
            console.log(JSON.stringify(response.current));
            resolve(response);
        })
            .catch(function (e) { return reject(e.message); });
    });
}
