
import { ZonedTime } from '../types';
import { HOUR_COLORS } from '../constants';

export const getZonedTime = (date: Date, timeZone: string): ZonedTime => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  }).formatToParts(date);

  const p: Record<string, string> = {};
  parts.forEach(part => p[part.type] = part.value);

  const zonedDate = new Date(new Intl.DateTimeFormat('en-US', { timeZone }).format(date));

  return {
    day: parseInt(p.day),
    hour: parseInt(p.hour),
    minute: parseInt(p.minute),
    second: parseInt(p.second),
    absDay: zonedDate.getTime() / 86400000,
    fullDate: zonedDate
  };
};

const hexToRgb = (hex: string) => {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? {
    r: parseInt(r[1], 16),
    g: parseInt(r[2], 16),
    b: parseInt(r[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

export const getInterpolatedColor = (h: number): string => {
  const hours = Object.keys(HOUR_COLORS).map(Number).sort((a, b) => a - b);
  let h1: number, h2: number;

  if (h >= hours[hours.length - 1]) {
    h1 = hours[hours.length - 1];
    h2 = hours[0] + 24;
  } else {
    h1 = hours[0];
    h2 = hours[1];
    for (let i = 0; i < hours.length - 1; i++) {
      if (h >= hours[i] && h < hours[i + 1]) {
        h1 = hours[i];
        h2 = hours[i + 1];
        break;
      }
    }
  }

  const c1 = hexToRgb(HOUR_COLORS[h1 % 24]);
  const c2 = hexToRgb(HOUR_COLORS[h2 % 24]);
  const ratio = (h - h1) / (h2 - h1);
  const mix = (v1: number, v2: number) => Math.round(v1 + (v2 - v1) * ratio);

  return `rgb(${mix(c1.r, c2.r)}, ${mix(c1.g, c2.g)}, ${mix(c1.b, c2.b)})`;
};
