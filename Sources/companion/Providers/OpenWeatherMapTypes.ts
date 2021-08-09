export interface OWWeather {
    lat: number;
    lon: number;
    timezone: string;
    timezone_offset: number;
    current: OWCurrent;
    hourly?: OWHourlyEntity[] | null;
    daily?: OWDailyEntity[] | null;
    message?: string;
}
export interface OWCurrent {
    dt: number;
    sunrise: number;
    sunset: number;
    temp: number;
    feels_like: number;
    pressure: number;
    humidity: number;
    dew_point: number;
    uvi: number;
    clouds: number;
    visibility: number;
    wind_speed: number;
    wind_deg: number;
    weather?: OWWeatherEntity[] | null;
}
export interface OWWeatherEntity {
    id: number;
    main: string;
    description: string;
    icon: string;
}
export interface OWHourlyEntity {
    dt: number;
    temp: number;
    feels_like: number;
    pressure: number;
    humidity: number;
    dew_point: number;
    uvi: number;
    clouds: number;
    visibility: number;
    wind_speed: number;
    wind_deg: number;
    wind_gust: number;
    weather?: OWWeatherEntity[] | null;
    pop: number;
}
export interface OWDailyEntity {
    dt: number;
    sunrise: number;
    sunset: number;
    moonrise: number;
    moonset: number;
    moon_phase: number;
    temp: OWTemp;
    feels_like: OWFeelsLike;
    pressure: number;
    humidity: number;
    dew_point: number;
    wind_speed: number;
    wind_deg: number;
    wind_gust: number;
    weather?: OWWeatherEntity[] | null;
    clouds: number;
    pop: number;
    uvi: number;
}
export interface OWTemp {
    day: number;
    min: number;
    max: number;
    night: number;
    eve: number;
    morn: number;
}
export interface OWFeelsLike {
    day: number;
    night: number;
    eve: number;
    morn: number;
}
