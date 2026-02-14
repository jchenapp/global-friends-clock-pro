
export interface Friend {
  id: string;
  name: string;      // The custom display name (e.g., "Mom")
  cityName: string;  // The original city name (e.g., "Taipei")
  timezone: string;
}

export interface CityData {
  name: string;
  zone: string;
}

export interface ZonedTime {
  day: number;
  hour: number;
  minute: number;
  second: number;
  absDay: number;
  fullDate: Date;
}
