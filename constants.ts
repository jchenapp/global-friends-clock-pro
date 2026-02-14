
import { CityData } from './types';

export const ALL_CITIES: CityData[] = [
  { name: "Taiwan", zone: "Asia/Taipei" },
  { name: "Estonia", zone: "Europe/Tallinn" },
  { name: "France", zone: "Europe/Paris" },
  { name: "Japan", zone: "Asia/Tokyo" },
  { name: "London", zone: "Europe/London" },
  { name: "Mexico City", zone: "America/Mexico_City" },
  { name: "New York", zone: "America/New_York" },
  { name: "India", zone: "Asia/Kolkata" },
  { name: "Portugal", zone: "Europe/Lisbon" },
  { name: "Ukraine", zone: "Europe/Kyiv" },
  { name: "Sydney", zone: "Australia/Sydney" },
  { name: "Turkey", zone: "Europe/Istanbul" },
  { name: "California", zone: "America/Los_Angeles" },
  { name: "Vancouver", zone: "America/Vancouver" },
  { name: "Singapore", zone: "Asia/Singapore" },
  { name: "Berlin", zone: "Europe/Berlin" },
  { name: "Dubai", zone: "Asia/Dubai" },
  { name: "Seoul", zone: "Asia/Seoul" }
];

export const HOUR_COLORS: Record<number, string> = {
  0: "#0a0a14",
  5: "#97739E",
  8: "#2980b9",
  12: "#64C9ED",
  17: "#d35400",
  19: "#2c3e50",
  22: "#0f0f0f"
};

export const STORAGE_KEY = 'global_friends_clock_v2';
