export const ToolType = {
  CURSOR: 'cursor',
  PENCIL: 'pencil',
  PEN: 'pen',
  BRUSH: 'brush',
  CRAYON: 'crayon',
  SPRAY: 'spray',
  ERASER: 'eraser',
} as const;

export type ToolType = typeof ToolType[keyof typeof ToolType];

export type PenType = 'pen' | 'pencil' | 'brush' | 'crayon' | 'spray' | 'eraser';

export interface Point {
  x: number;
  y: number;
  pressure?: number;
}

export interface Stroke {
  id: string;
  points: Point[];
  color: string;
  size: number;
  tool: ToolType;
  opacity: number;
}

export interface ScrapbookObject {
  id: string;
  type: 'image' | 'sticker';
  content: string; // URL or emoji
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // degrees
  zIndex: number;
}

export interface PageData {
  id: string;
  date: string; // ISO date string
  strokes: Stroke[];
  objects: ScrapbookObject[];
  backgroundColor: string;
}
