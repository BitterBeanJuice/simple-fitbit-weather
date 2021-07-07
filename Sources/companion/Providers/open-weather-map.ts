import { Conditions, Forecast, Weather } from "../../common";
import { OpenWeather } from "./OpenWeatherMapTypes";

const mapping_codes = {
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

const tempToC = (value: number) => value - 273.15;
const tempToF = (value: number) => ((value - 273.15) * 9) / 5 + 32;
const getCondition = (value: number) => {
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
export function fetchWeather(
  apiKey: string,
  latitude: number,
  longitude: number
): Promise<Forecast> {
  return new Promise<Forecast>((resolve, reject) => {
    const url =
      "https://api.openweathermap.org/data/2.5/onecall?appid=" +
      apiKey +
      "&lat=" +
      latitude +
      "&lon=" +
      longitude +
      "&exclude=hourly,minutely";

    console.log(url);

    fetch(encodeURI(url))
      .then((response) => response.json())
      .then((data: OpenWeather) => {
        if (data.current === undefined) {
          reject(data.message);
          return;
        }

        const currentCondition = (data.current.weather || [])[0].id;

        const response: Forecast = {
          daily: data.daily?.map((d): Weather => {
            const condition = (d.weather || [])[0].id;
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
        };
        resolve(response);
      })
      .catch((e) => reject(e.message));
  });
}
