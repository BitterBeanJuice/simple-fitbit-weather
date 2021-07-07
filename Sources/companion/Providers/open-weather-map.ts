import { Conditions, Forecast, Weather } from "../../common";
import { OpenWeather } from "./OpenWeatherMapTypes";

const mapping_codes = {
  200: Conditions.Thunderstorm,
  201: Conditions.Thunderstorm,
  202: Conditions.Thunderstorm,
  210: Conditions.Thunderstorm,
  211: Conditions.Thunderstorm,
  212: Conditions.Thunderstorm,
  221: Conditions.Thunderstorm,
  230: Conditions.Thunderstorm,
  231: Conditions.Thunderstorm,
  232: Conditions.Thunderstorm,
  300: Conditions.Snow,
  301: Conditions.Snow,
  302: Conditions.Snow,
  310: Conditions.Snow,
  311: Conditions.Snow,
  312: Conditions.Snow,
  313: Conditions.Snow,
  314: Conditions.Snow,
  321: Conditions.Snow,
  500: Conditions.Rain,
  501: Conditions.Rain,
  502: Conditions.Rain,
  503: Conditions.Rain,
  504: Conditions.Rain,
  511: Conditions.Rain,
  520: Conditions.ShowerRain,
  521: Conditions.ShowerRain,
  522: Conditions.ShowerRain,
  531: Conditions.ShowerRain,
  600: Conditions.Snow,
  601: Conditions.Snow,
  602: Conditions.Snow,
  611: Conditions.Snow,
  612: Conditions.Snow,
  615: Conditions.Snow,
  616: Conditions.Snow,
  620: Conditions.Snow,
  621: Conditions.Snow,
  622: Conditions.Snow,
  701: Conditions.Mist,
  711: Conditions.Mist,
  721: Conditions.Mist,
  731: Conditions.Mist,
  741: Conditions.Mist,
  800: Conditions.ClearSky,
  801: Conditions.FewClouds,
  802: Conditions.ScatteredClouds,
  803: Conditions.BrokenClouds,
  804: Conditions.BrokenClouds,
};

const tempToC = (value: number) => value - 273.15;
const tempToF = (value: number) => ((value - 273.15) * 9) / 5 + 32;

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
              conditionCode: mapping_codes[condition] || Conditions.Unknown,
              realConditionCode: condition.toString(),
            };
          }),
          current: {
            temperatureC: tempToC(data.current.temp),
            temperatureF: tempToF(data.current.temp),
            timestamp: data.current.dt,
            conditionCode:
              mapping_codes[currentCondition] || Conditions.Unknown,
            realConditionCode: currentCondition.toString(),
          },
        };
        resolve(response);
      })
      .catch((e) => reject(e.message));
  });
}
