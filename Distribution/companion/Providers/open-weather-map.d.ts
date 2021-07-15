import { Forecast } from "../../common";
/**
 * Fetch data from Open Weather Map
 */
export declare function fetchOpenWeather(apiKey: string, latitude: number, longitude: number): Promise<Forecast>;
