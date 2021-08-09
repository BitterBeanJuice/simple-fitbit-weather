/**
 * File name
 */
export const WEATHER_FILE = "weather.cbor";

/**
 * Message type (used in socket messages)
 */
export const MESSAGE_TYPE = "weather";

/**
 * Message send via socket via sockets
 */
export interface Message {
    type: string;
    weather: Forecast;
}

/**
 * Conditions
 */
export const Conditions = {
    ClearSky: 0,
    FewClouds: 1,
    ScatteredClouds: 2,
    BrokenClouds: 3,
    ShowerRain: 4,
    Rain: 5,
    Thunderstorm: 6,
    Snow: 7,
    Mist: 8,
    Unknown: 9,
};

export interface CurrentWeather {
    tempF: number;
    condition: number;
    timestamp: number;
    uvIndex: number;
}

export interface DailyWeather {
    maxF: number;
    minF: number;
    condition: number;
    timestamp: number;
    uvIndex: number;
}

export interface HourlyWeather {
    tempF: number;
    condition: number;
    timestamp: number;
    uvIndex: number;
}

export interface Location {
    lat: number;
    lon: number;
}

export interface Forecast {
    current: CurrentWeather;
    daily: DailyWeather[];
    hourly: HourlyWeather[];
    timestamp: number;
    location: Location;
}
