/**
 * File name
 */
export declare const WEATHER_FILE = "weather.cbor";
/**
 * Message type (used in socket messages)
 */
export declare const MESSAGE_TYPE = "weather";
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
export declare const Conditions: {
    ClearSky: number;
    FewClouds: number;
    ScatteredClouds: number;
    BrokenClouds: number;
    ShowerRain: number;
    Rain: number;
    Thunderstorm: number;
    Snow: number;
    Mist: number;
    Unknown: number;
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
