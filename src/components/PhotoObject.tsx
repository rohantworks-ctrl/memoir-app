import React, { useRef, useCallback, useEffect } from 'react';
import type { ScrapbookObject } from '../types';

interface PhotoObjectProps {
  obj: ScrapbookObject;
  isActive: boolean;
  onUpdate: (partial: Partial<ScrapbookObject>) => void;
  onDelete: () => void;
}

export const PhotoObject: React.FC<PhotoObjectProps> = ({ obj, isActive, onUpdate, onDelete }) => {
  const elRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const isRotating = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const objStart = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const rotateStart = useRef({ angle: 0, rotation: 0 });

  const getCenter = () => {
    const el = elRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }
    return { x: obj.x + obj.width / 2, y: obj.y + obj.height / 2 };
  };

  const handlePointerDownDrag = useCallback((e: React.PointerEvent) => {
    if (!isActive) return;
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    objStart.current = { x: obj.x, y: obj.y, width: obj.width, height: obj.height };
    onUpdate({ zIndex: obj.zIndex + 1 });
  }, [isActive, obj, onUpdate]);

  const handlePointerDownResize = useCallback((e: React.PointerEvent) => {
    if (!isActive) return;
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isResizing.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    objStart.current = { x: obj.x, y: obj.y, width: obj.width, height: obj.height };
  }, [isActive, obj]);

  const handlePointerDownRotate = useCallback((e: React.PointerEvent) => {
    if (!isActive) return;
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isRotating.current = true;
    const center = getCenter();
    const angle = Math.atan2(e.clientY - center.y, e.clientX - center.x) * (180 / Math.PI);
    rotateStart.current = { angle, rotation: obj.rotation };
  }, [isActive, obj]);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (isDragging.current) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      onUpdate({ x: objStart.current.x + dx, y: objStart.current.y + dy });
    } else if (isResizing.current) {
      const dx = e.clientX - dragStart.current.x;
      const newW = Math.max(60, objStart.current.width + dx);
      const ratio = obj.height > 0 ? obj.height / obj.width : 1;
      onUpdate({ width: newW, height: newW * ratio });
    } else if (isRotating.current) {
      const center = getCenter();
      const angle = Math.atan2(e.clientY - center.y, e.clientX - center.x) * (180 / Math.PI);
      onUpdate({ rotation: rotateStart.current.rotation + (angle - rotateStart.current.angle) });
    }
  }, [obj, onUpdate]);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
    isResizing.current = false;
    isRotating.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  return (
    <div
      ref={elRef}
      className="absolute select-none"
      style={{
        left: obj.x,
        top: obj.y,
        width: obj.width,
        height: obj.height || 'auto',
        transform: `rotate(${obj.rotation}deg)`,
        zIndex: obj.zIndex,
        pointerEvents: isActive ? 'auto' : 'none',
      }}
    >
      <img
        src={obj.content}
        alt="scrapbook"
        className="w-full h-full object-cover rounded-sm shadow-md"
        style={{ display: 'block', userSelect: 'none', WebkitUserSelect: 'none', pointerEvents: 'none' }}
        draggable={false}
        onLoad={(e) => {
          const img = e.currentTarget;
          if (obj.height === 0) {
            const aspect = img.naturalHeight / img.naturalWidth;
            onUpdate({ height: obj.width * aspect });
          }
        }}
      />

      {isActive && (
        <>
          {/* Drag overlay */}
          <div
            className="absolute inset-0 cursor-move"
            onPointerDown={handlePointerDownDrag}
          />
          {/* Resize handle (bottom-right) */}
          <div
            className="absolute bottom-0 right-0 w-5 h-5 bg-white border-2 border-pink-400 rounded-full cursor-se-resize z-10 flex items-center justify-center"
            style={{ transform: 'translate(50%,50%)' }}
            onPointerDown={handlePointerDownResize}
          >
            <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1 7 L7 1 M4 7 L7 4" stroke="#ec4899" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          {/* Rotate handle (top-center) */}
          <div
            className="absolute top-0 left-1/2 w-5 h-5 bg-white border-2 border-sky-400 rounded-full cursor-grab z-10 flex items-center justify-center"
            style={{ transform: 'translate(-50%,-150%)' }}
            onPointerDown={handlePointerDownRotate}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round"><path d="M5 1 A4 4 0 1 1 1.5 2.5"/><path d="M5 1 L3 3 M5 1 L7 3"/></svg>
          </div>
          {/* Delete handle (top-right) */}
          <div
            className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white rounded-full z-10 flex items-center justify-center text-xs cursor-pointer font-bold"
            style={{ transform: 'translate(50%,-50%)' }}
            onPointerDown={(e) => { e.stopPropagation(); onDelete(); }}
          >×</div>
        </>
      )}
    </div>
  );
};
