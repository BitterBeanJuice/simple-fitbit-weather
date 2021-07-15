import { Forecast, Location } from "../common";
import { Providers } from "./common";
/**
 * Get weather
 * @param provider
 * @param apiKey
 */
export declare function fetchWeather(provider: Providers, apiKey: string, location?: Location): Promise<Forecast>;
