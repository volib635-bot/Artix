import { useRef, useState, useCallback, useEffect } from 'react';
import { Pencil, Eraser, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface Stroke {
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

interface DrawingCanvasProps {
  isActive: boolean;
  strokes: Stroke[];
  onStrokesChange: (strokes: Stroke[]) => void;
}

const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#3b82f6', '#8b5cf6', '#ec4899', '#ffffff',
];

const WIDTHS = [2, 4, 6, 10];

export function DrawingCanvas({ isActive, strokes, onStrokesChange }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const currentStrokeRef = useRef<Stroke | null>(null);
  const [color, setColor] = useState('#3b82f6');
  const [width, setWidth] = useState(4);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const allStrokes = [...strokes];
    if (currentStrokeRef.current) allStrokes.push(currentStrokeRef.current);

    for (const stroke of allStrokes) {
      if (stroke.points.length < 2) continue;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.globalCompositeOperation = stroke.color === 'eraser' ? 'destination-out' : 'source-over';
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
  }, [strokes]);

  useEffect(() => {
    redraw();
  }, [redraw, strokes]);

  useEffect(() => {
    const handleResize = () => redraw();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [redraw]);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isActive) return;
    isDrawingRef.current = true;
    const pos = getPos(e);
    currentStrokeRef.current = {
      points: [pos],
      color: tool === 'eraser' ? 'eraser' : color,
      width: tool === 'eraser' ? 20 : width,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !currentStrokeRef.current) return;
    currentStrokeRef.current.points.push(getPos(e));
    redraw();
  };

  const handleMouseUp = () => {
    if (!isDrawingRef.current || !currentStrokeRef.current) return;
    isDrawingRef.current = false;
    if (currentStrokeRef.current.points.length > 1) {
      onStrokesChange([...strokes, currentStrokeRef.current]);
    }
    currentStrokeRef.current = null;
  };

  const handleClear = () => {
    onStrokesChange([]);
  };

  return (
    <>
      {/* Drawing canvas overlay */}
      <canvas
        ref={canvasRef}
        className={cn(
          'absolute inset-0 z-50',
          isActive ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* Drawing toolbar */}
      {isActive && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-card/95 backdrop-blur border border-border rounded-xl px-4 py-2 shadow-lg">
          <Button
            variant={tool === 'pen' ? 'default' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setTool('pen')}
            title="Pen"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant={tool === 'eraser' ? 'default' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setTool('eraser')}
            title="Eraser"
          >
            <Eraser className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Colors */}
          {COLORS.map((c) => (
            <button
              key={c}
              className={cn(
                'w-6 h-6 rounded-full border-2 transition-transform',
                color === c && tool === 'pen' ? 'scale-125 border-foreground' : 'border-transparent hover:scale-110'
              )}
              style={{ backgroundColor: c }}
              onClick={() => { setColor(c); setTool('pen'); }}
            />
          ))}

          <div className="w-px h-6 bg-border mx-1" />

          {/* Widths */}
          {WIDTHS.map((w) => (
            <button
              key={w}
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-md transition-colors',
                width === w && tool === 'pen' ? 'bg-primary/20' : 'hover:bg-muted'
              )}
              onClick={() => { setWidth(w); setTool('pen'); }}
            >
              <div
                className="rounded-full bg-foreground"
                style={{ width: w + 2, height: w + 2 }}
              />
            </button>
          ))}

          <div className="w-px h-6 bg-border mx-1" />

          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={handleClear} title="Clear drawing">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </>
  );
}