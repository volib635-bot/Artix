import { useRef, useState, useCallback, useId } from 'react';
import { useReactFlow, useViewport } from '@xyflow/react';
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
const MASK_EXTENT = 100000;

/**
 * SVG-based drawing layer that renders inside React Flow's viewport.
 * Strokes are stored in world (flow) coordinates so they pan/zoom with nodes.
 */
export function DrawingCanvas({ isActive, strokes, onStrokesChange }: DrawingCanvasProps) {
  const { screenToFlowPosition } = useReactFlow();
  const viewport = useViewport();
  const maskIdPrefix = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const isDrawingRef = useRef(false);
  const currentPointsRef = useRef<{ x: number; y: number }[]>([]);
  const [livePoints, setLivePoints] = useState<{ x: number; y: number }[] | null>(null);
  const [color, setColor] = useState('#3b82f6');
  const [width, setWidth] = useState(4);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');

  const toWorld = useCallback((e: React.PointerEvent) => {
    return screenToFlowPosition({ x: e.clientX, y: e.clientY });
  }, [screenToFlowPosition]);

  const handlePointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!isActive) return;
    e.preventDefault();
    e.stopPropagation();
    (e.target as SVGSVGElement).setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    const pos = toWorld(e);
    currentPointsRef.current = [pos];
    setLivePoints([pos]);
  }, [isActive, toWorld]);

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    const pos = toWorld(e);
    currentPointsRef.current.push(pos);
    setLivePoints([...currentPointsRef.current]);
  }, [toWorld]);

  const handlePointerUp = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    isDrawingRef.current = false;
    const pts = currentPointsRef.current;
    if (pts.length > 1) {
      const newStroke: Stroke = {
        points: pts,
        color: tool === 'eraser' ? 'eraser' : color,
        width: tool === 'eraser' ? 20 : width,
      };
      onStrokesChange([...strokes, newStroke]);
    }
    currentPointsRef.current = [];
    setLivePoints(null);
  }, [tool, color, width, strokes, onStrokesChange]);

  const handleClear = () => onStrokesChange([]);

  const pointsToPath = (points: { x: number; y: number }[]) => {
    if (points.length < 2) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`;
    }
    return d;
  };

  const renderStrokePath = (stroke: Stroke, key: string, strokeColor = stroke.color) => (
    <path
      key={key}
      d={pointsToPath(stroke.points)}
      fill="none"
      stroke={strokeColor}
      strokeWidth={stroke.width}
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
    />
  );

  const buildStrokeLayers = (items: Stroke[]) => {
    const defs: JSX.Element[] = [];
    let content: JSX.Element | null = null;
    let maskIndex = 0;

    items.forEach((stroke, index) => {
      if (stroke.points.length < 2) return;

      if (stroke.color === 'eraser') {
        const maskId = `${maskIdPrefix}-${maskIndex}`;

        defs.push(
          <mask key={maskId} id={maskId} maskUnits="userSpaceOnUse">
            <rect
              x={-MASK_EXTENT}
              y={-MASK_EXTENT}
              width={MASK_EXTENT * 2}
              height={MASK_EXTENT * 2}
              fill="white"
            />
            {renderStrokePath(stroke, `${maskId}-eraser`, 'black')}
          </mask>
        );

        content = content ? <g mask={`url(#${maskId})`}>{content}</g> : null;
        maskIndex += 1;
        return;
      }

      content = (
        <>
          {content}
          {renderStrokePath(stroke, `stroke-${index}`)}
        </>
      );
    });

    return { defs, content };
  };

  const allStrokes = livePoints
    ? [...strokes, { points: livePoints, color: tool === 'eraser' ? 'eraser' : color, width: tool === 'eraser' ? 20 : width }]
    : strokes;
  const { defs, content } = buildStrokeLayers(allStrokes);

  if (!isActive && strokes.length === 0) return null;

  return (
    <>
      {/* SVG layer in world-space, rendered inside ReactFlow viewport */}
      <svg
        ref={svgRef}
        className="react-flow__drawing-layer"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'visible',
          pointerEvents: isActive ? 'all' : 'none',
          cursor: isActive ? 'crosshair' : 'default',
          zIndex: isActive ? 5 : 0,
          touchAction: 'none',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheelCapture={(e) => {
          // Let wheel events pass through to ReactFlow for zooming
          e.currentTarget.style.pointerEvents = 'none';
          requestAnimationFrame(() => {
            if (svgRef.current) svgRef.current.style.pointerEvents = isActive ? 'all' : 'none';
          });
        }}
      >
        <defs>{defs}</defs>
        {/* Apply viewport transform so strokes are in world-space */}
        <g transform={`translate(${viewport.x}, ${viewport.y}) scale(${viewport.zoom})`} style={{ isolation: 'isolate' } as React.CSSProperties}>
          {content}
        </g>
      </svg>

      {/* Toolbar - fixed to screen */}
      {isActive && (
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-card/95 backdrop-blur border border-border rounded-xl px-4 py-2 shadow-lg"
          style={{ pointerEvents: 'auto', zIndex: 20 }}
        >
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
