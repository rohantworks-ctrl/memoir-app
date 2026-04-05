import type { PageData } from '../types';

export const PAGE_BG_COLORS = [
  '#FFF8F0', '#FFF0F5', '#F0FFF4', '#F0F4FF', '#FFFBF0',
  '#FDF4FF', '#F0FFFD', '#FFF5F5', '#F5FFFA', '#FFFFF0',
  '#FFF0E6', '#F0E6FF', '#E6F4FF', '#E6FFE6',
];

export const STICKERS = ['🌸', '💕', '⭐', '🌙', '🦋', '🌈', '💫', '🌺', '🎀', '💌', '🌻', '🍀', '✨', '💗', '🌷'];

export const FONT_FAMILIES = [
  "'Caveat', cursive",
  "'Patrick Hand', cursive",
  "'Pacifico', cursive",
  "'Kalam', cursive",
  "'Reenie Beanie', cursive",
];

export const generatePage = (index: number, dateOverride?: string): PageData => {
  const d = new Date(2026, 0, 1);
  d.setDate(d.getDate() + index);
  const isoDate = dateOverride ?? d.toISOString().split('T')[0];
  return {
    id: `page-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
    date: isoDate,
    strokes: [],
    objects: [],
    backgroundColor: PAGE_BG_COLORS[index % PAGE_BG_COLORS.length],
  };
};

export const TOTAL_PAGES = 365;
