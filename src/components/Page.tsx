import React, { useRef, useEffect, useCallback } from 'react';
import type { PageData, Stroke, Point } from '../types';
import { ToolType } from '../types';
import { PhotoObject } from './PhotoObject';
import { PageDecoration } from './PageDecoration';
import { CatCorner } from './CatCorner';
import { DateLabel } from './DateLabel';

interface PageProps {
  pageData: PageData;
  activeTool: ToolType;
  color: string;
  brushSize: number;
  onUpdatePage: (id: string, data: Partial<PageData>) => void;
  width: number;
  height: number;
  pageIndex: number;
}

function sprayDots(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  size: number
) {
  const density = 30;
  const radius = size * 4;
  ctx.fillStyle = color;
  for (let i = 0; i < density; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * radius;
    const sx = x + r * Math.cos(angle);
    const sy = y + r * Math.sin(angle);
    ctx.beginPath();
    ctx.arc(sx, sy, Math.random() * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function crayonStroke(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  color: string,
  size: number
) {
  if (points.length < 2) return;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (let i = 1; i < points.length; i++) {
    const [p0, p1] = [points[i - 1], points[i]];
    for (let t = 0; t < 3; t++) {
      ctx.globalAlpha = 0.25 + Math.random() * 0.2;
      ctx.strokeStyle = color;
      ctx.lineWidth = size * (0.7 + Math.random() * 0.6);
      ctx.beginPath();
      ctx.moveTo(p0.x + (Math.random() - 0.5) * size * 0.5, p0.y + (Math.random() - 0.5) * size * 0.5);
      ctx.lineTo(p1.x + (Math.random() - 0.5) * size * 0.5, p1.y + (Math.random() - 0.5) * size * 0.5);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
  if (stroke.points.length === 0) return;
  ctx.save();

  if (stroke.tool === ToolType.ERASER) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
    ctx.lineWidth = stroke.size * 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (const p of stroke.points.slice(1)) ctx.lineTo(p.x, p.y);
    ctx.stroke();
  } else if (stroke.tool === ToolType.SPRAY) {
    ctx.globalCompositeOperation = 'source-over';
    for (const p of stroke.points) sprayDots(ctx, p.x, p.y, stroke.color, stroke.size);
  } else if (stroke.tool === ToolType.CRAYON) {
    ctx.globalCompositeOperation = 'source-over';
    crayonStroke(ctx, stroke.points, stroke.color, stroke.size);
  } else if (stroke.tool === ToolType.BRUSH) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.6;
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size * 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = stroke.color;
    ctx.shadowBlur = stroke.size * 2;
    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length - 1; i++) {
      const mid = { x: (stroke.points[i].x + stroke.points[i + 1].x) / 2, y: (stroke.points[i].y + stroke.points[i + 1].y) / 2 };
      ctx.quadraticCurveTo(stroke.points[i].x, stroke.points[i].y, mid.x, mid.y);
    }
    if (stroke.points.length > 1) {
      const last = stroke.points[stroke.points.length - 1];
      ctx.lineTo(last.x, last.y);
    }
    ctx.stroke();
  } else if (stroke.tool === ToolType.PENCIL) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.7;
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (const p of stroke.points.slice(1)) ctx.lineTo(p.x, p.y);
    ctx.stroke();
  } else {
    // PEN - smooth bezier
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = stroke.opacity;
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length - 1; i++) {
      const mid = { x: (stroke.points[i].x + stroke.points[i + 1].x) / 2, y: (stroke.points[i].y + stroke.points[i + 1].y) / 2 };
      ctx.quadraticCurveTo(stroke.points[i].x, stroke.points[i].y, mid.x, mid.y);
    }
    if (stroke.points.length > 1) {
      const last = stroke.points[stroke.points.length - 1];
      ctx.lineTo(last.x, last.y);
    }
    ctx.stroke();
  }

  ctx.restore();
}

function redrawAll(ctx: CanvasRenderingContext2D, strokes: Stroke[], w: number, h: number) {
  ctx.clearRect(0, 0, w, h);
  for (const stroke of strokes) drawStroke(ctx, stroke);
}

export const Page = React.forwardRef<HTMLDivElement, PageProps>(({ pageData, activeTool, color, brushSize, onUpdatePage, width, height, pageIndex }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const currentStroke = useRef<Stroke | null>(null);

  // Redraw all strokes whenever they change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    redrawAll(ctx, pageData.strokes, width, height);
  }, [pageData.strokes, width, height]);

  const getPoint = useCallback((e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (width / rect.width),
      y: (e.clientY - rect.top) * (height / rect.height),
      pressure: e.pressure ?? 0.5,
    };
  }, [width, height]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activeTool === ToolType.CURSOR) return;
    e.preventDefault();
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    isDrawing.current = true;
    const point = getPoint(e);
    currentStroke.current = {
      id: `stroke-${Date.now()}`,
      points: [point],
      color,
      size: brushSize,
      tool: activeTool,
      opacity: 1,
    };
    // Immediately preview for spray
    if (activeTool === ToolType.SPRAY) {
      const ctx = canvasRef.current!.getContext('2d')!;
      sprayDots(ctx, point.x, point.y, color, brushSize);
    }
  }, [activeTool, color, brushSize, getPoint]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !currentStroke.current || activeTool === ToolType.CURSOR) return;
    e.preventDefault();
    const point = getPoint(e);
    const pts = currentStroke.current.points;
    const lastPoint = pts[pts.length - 1];
    pts.push(point);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    if (activeTool === ToolType.SPRAY) {
      sprayDots(ctx, point.x, point.y, color, brushSize);
    } else if (activeTool === ToolType.CRAYON) {
      crayonStroke(ctx, pts.slice(-2), color, brushSize);
    } else {
      // Incremental draw instead of full redraw for performance
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (activeTool === ToolType.ERASER) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.lineWidth = brushSize * 4;
      } else if (activeTool === ToolType.BRUSH) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 0.6;
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize * 3;
        ctx.shadowColor = color;
        ctx.shadowBlur = brushSize * 2;
      } else if (activeTool === ToolType.PENCIL) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 0.7;
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
      } else {
        // PEN
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
      }

      ctx.beginPath();
      // To keep it smooth, we use a simple lineTo for incremental drawing
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
      ctx.restore();
    }
  }, [activeTool, color, brushSize, getPoint]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !currentStroke.current) return;
    e.preventDefault();
    isDrawing.current = false;
    const stroke = currentStroke.current;
    currentStroke.current = null;
    if (stroke.points.length > 0) {
      onUpdatePage(pageData.id, { strokes: [...pageData.strokes, stroke] });
    }
  }, [pageData.id, pageData.strokes, onUpdatePage]);

  const canDraw = activeTool !== ToolType.CURSOR;

  return (
    <div
      ref={ref}
      className="absolute inset-0 overflow-hidden page-wrapper"
      style={{
        background: pageData.backgroundColor,
        width,
        height,
      }}
    >
      {/* Background decoration (abstract sockets) */}
      <PageDecoration pageIndex={pageIndex} width={width} height={height} />

      {/* Photos — rendered below the drawing layer */}
      {pageData.objects.map((obj) => (
        <PhotoObject
          key={obj.id}
          obj={obj}
          isActive={activeTool === ToolType.CURSOR}
          onUpdate={(updated) => {
            onUpdatePage(pageData.id, {
              objects: pageData.objects.map((o) => (o.id === obj.id ? { ...o, ...updated } : o)),
            });
          }}
          onDelete={() => {
            onUpdatePage(pageData.id, {
              objects: pageData.objects.filter((o) => o.id !== obj.id),
            });
          }}
        />
      ))}

      {/* Drawing Canvas */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="absolute inset-0"
        style={{
          touchAction: 'none',
          cursor: canDraw
            ? activeTool === ToolType.ERASER
              ? 'cell'
              : 'crosshair'
            : 'default',
          zIndex: canDraw ? 20 : -1,
          pointerEvents: canDraw ? 'auto' : 'none',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />

      {/* Date label */}
      <DateLabel
        date={pageData.date}
        onDateChange={(date) => onUpdatePage(pageData.id, { date })}
      />

      {/* Cat animations */}
      <CatCorner pageIndex={pageIndex} />
    </div>
  );
});

Page.displayName = 'Page';
