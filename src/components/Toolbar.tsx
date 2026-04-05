import React, { useState } from 'react';
import { ToolType } from '../types';
import {
  MousePointer2, Pen, Pencil, Paintbrush, Eraser,
  ImagePlus, Undo2, Plus, Minus, ChevronLeft, ChevronRight, Smile
} from 'lucide-react';
import { StickerPicker } from './StickerPicker';

interface ToolbarProps {
  activeTool: ToolType;
  setActiveTool: (t: ToolType) => void;
  penType: string;
  setPenType: (p: 'pen' | 'pencil' | 'brush' | 'crayon' | 'spray') => void;
  color: string;
  setColor: (c: string) => void;
  brushSize: number;
  setBrushSize: (s: number) => void;
  onUndo: () => void;
  onAddImage: () => void;
  onAddSticker: (url: string) => void;
  onAddPage: () => void;
  currentPage: number;
  totalPages: number;
  onFlipTo: (index: number) => void;
  canUndo: boolean;
}

const PRESET_COLORS = [
  '#000000', '#1a1a2e', '#4B5563', '#7c3aed', '#be185d',
  '#dc2626', '#ea580c', '#d97706', '#16a34a', '#0891b2',
  '#1d4ed8', '#9d174d', '#7e22ce', '#FFFFFF', '#FDE68A',
  '#A7F3D0', '#BFDBFE', '#FCA5A5', '#c4b5fd', '#f9a8d4',
];

const toolDefs = [
  { tool: ToolType.CURSOR, icon: <MousePointer2 size={18} />, label: 'Select' },
  { tool: ToolType.PEN, icon: <Pen size={18} />, label: 'Pen' },
  { tool: ToolType.PENCIL, icon: <Pencil size={18} />, label: 'Pencil' },
  { tool: ToolType.BRUSH, icon: <Paintbrush size={18} />, label: 'Brush' },
  { tool: ToolType.CRAYON, icon: <span style={{ fontSize: 18, lineHeight: 1 }}>🖍️</span>, label: 'Crayon' },
  { tool: ToolType.SPRAY, icon: <span style={{ fontSize: 18, lineHeight: 1 }}>💨</span>, label: 'Spray' },
  { tool: ToolType.ERASER, icon: <Eraser size={18} />, label: 'Eraser' },
];

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool, setActiveTool, color, setColor,
  brushSize, setBrushSize, onUndo, onAddImage, onAddSticker, onAddPage,
  currentPage, totalPages, onFlipTo, canUndo,
}) => {

  const [showColorPanel, setShowColorPanel] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 flex justify-center items-end z-50 pb-3 pointer-events-none"
      style={{ touchAction: 'none' }}
    >
      <div
        className="pointer-events-auto flex flex-col items-center gap-2"
        style={{ maxWidth: '98vw' }}
      >
        {/* Sticker Picker panel */}
        {showStickerPicker && <StickerPicker onSelect={onAddSticker} onClose={() => setShowStickerPicker(false)} />}

        {/* Color wheel panel */}
        {showColorPanel && (
          <div
            className="flex flex-wrap gap-1.5 p-3 rounded-2xl mb-1 max-w-xs"
            style={{
              background: 'rgba(30,20,40,0.92)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-125 active:scale-90"
                style={{
                  background: c,
                  borderColor: color === c ? '#fff' : 'rgba(255,255,255,0.25)',
                }}
                title={c}
              />
            ))}
            {/* Hex input */}
            <div className="w-full flex items-center gap-2 mt-1">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                title="Custom colour"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setColor(v);
                }}
                className="flex-1 bg-transparent text-white text-xs font-mono border border-white/20 rounded-lg px-2 py-1 focus:outline-none focus:border-white/60"
                maxLength={7}
                placeholder="#000000"
              />
            </div>
          </div>
        )}

        {/* Main toolbar pill */}
        <div
          className="flex items-center gap-1 px-3 py-2 rounded-2xl"
          style={{
            background: 'rgba(20,15,30,0.88)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.06) inset',
            border: '1px solid rgba(255,255,255,0.08)',
            gap: '2px',
          }}
        >
          {/* Tools */}
          {toolDefs.map(({ tool, icon, label }) => (
            <button
              key={tool}
              onClick={() => setActiveTool(tool)}
              title={label}
              className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-150 relative"
              style={{
                background: activeTool === tool
                  ? 'rgba(167,139,250,0.25)'
                  : 'transparent',
                color: activeTool === tool ? '#c4b5fd' : 'rgba(255,255,255,0.6)',
                boxShadow: activeTool === tool ? '0 0 0 1.5px rgba(167,139,250,0.5)' : 'none',
                transform: activeTool === tool ? 'scale(1.08)' : 'scale(1)',
              }}
            >
              {icon}
            </button>
          ))}

          {/* Divider */}
          <div className="w-px h-7 bg-white/10 mx-1" />

          {/* Colour picker button */}
          <button
            onClick={() => setShowColorPanel(!showColorPanel)}
            className="flex items-center justify-center w-9 h-9 rounded-xl relative transition-all"
            title="Colour"
            style={{
              background: showColorPanel ? 'rgba(167,139,250,0.25)' : 'transparent',
              boxShadow: showColorPanel ? '0 0 0 1.5px rgba(167,139,250,0.5)' : 'none',
            }}
          >
            <div
              className="w-6 h-6 rounded-full border-2 border-white/40 shadow-md"
              style={{ background: color }}
            />
          </button>

          {/* Divider */}
          <div className="w-px h-7 bg-white/10 mx-1" />

          {/* Brush size */}
          <button onClick={() => setBrushSize(Math.max(1, brushSize - 1))}
            className="flex items-center justify-center w-7 h-7 rounded-lg text-white/60 hover:text-white/90 hover:bg-white/10 transition-all">
            <Minus size={14} />
          </button>
          <div className="flex flex-col items-center mx-0.5">
            <div
              className="rounded-full bg-white/80"
              style={{
                width: Math.max(4, Math.min(20, brushSize * 2.5)),
                height: Math.max(4, Math.min(20, brushSize * 2.5)),
                transition: 'all 0.15s',
              }}
            />
          </div>
          <button onClick={() => setBrushSize(Math.min(30, brushSize + 1))}
            className="flex items-center justify-center w-7 h-7 rounded-lg text-white/60 hover:text-white/90 hover:bg-white/10 transition-all">
            <Plus size={14} />
          </button>

          {/* Divider */}
          <div className="w-px h-7 bg-white/10 mx-1" />

          {/* Undo */}
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo"
            className="flex items-center justify-center w-9 h-9 rounded-xl transition-all"
            style={{
              color: canUndo ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.25)',
              background: 'transparent',
            }}
          >
            <Undo2 size={18} />
          </button>

          {/* Add photo */}
          <button
            onClick={onAddImage}
            title="Add Photo"
            className="flex items-center justify-center w-9 h-9 rounded-xl text-white/70 hover:text-pink-300 hover:bg-pink-400/10 transition-all"
          >
            <ImagePlus size={18} />
          </button>

          {/* Add sticker */}
          <button
            onClick={() => setShowStickerPicker(!showStickerPicker)}
            title="Add Sticker"
            className="flex items-center justify-center w-9 h-9 rounded-xl text-white/70 hover:text-amber-300 hover:bg-amber-400/10 transition-all relative"
          >
            <Smile size={18} />
          </button>

          {/* Add page */}
          <button
            onClick={onAddPage}
            title="Add Page"
            className="flex items-center justify-center w-9 h-9 rounded-xl text-white/70 hover:text-violet-300 hover:bg-violet-400/10 transition-all"
          >
            <Plus size={16} />
          </button>

          {/* Divider */}
          <div className="w-px h-7 bg-white/10 mx-1" />

          {/* Page navigation */}
          <button onClick={() => onFlipTo(Math.max(0, currentPage - 1))}
            className="flex items-center justify-center w-7 h-7 text-white/60 hover:text-white/90 hover:bg-white/10 rounded-lg transition-all">
            <ChevronLeft size={16} />
          </button>
          <span className="text-white/50 text-xs font-mono w-12 text-center select-none">
            {currentPage + 1}/{totalPages}
          </span>
          <button onClick={() => onFlipTo(Math.min(totalPages - 1, currentPage + 1))}
            className="flex items-center justify-center w-7 h-7 text-white/60 hover:text-white/90 hover:bg-white/10 rounded-lg transition-all">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
