import { useCallback, useRef, useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  ConnectionLineType,
  Panel,
  MarkerType,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  ArrowLeft, Save, Plus, Pencil, Network, FlaskConical, Palette,
  Database, Server, Monitor, Cloud, Cpu, HardDrive,
  LayoutList, ArrowUpDown, Repeat, Split,
  GitBranch, Circle, CheckCircle, ListOrdered, Layers,
  Link, Hash, Triangle, Variable, MousePointer,
  HelpCircle, Terminal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SystemDesign, BoardState } from '@/hooks/useSystemDesigns';
import { ArchitectNode } from './ArchitectNode';
import { DrawingCanvas, Stroke } from './DrawingCanvas';
import { systemDesignTemplates, algorithmTemplates, NodeTemplate } from './AlgorithmNodeTemplates';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type ArchitectNodeData = Record<string, unknown> & {
  label: string;
  description?: string;
  nodeType: string;
  icon: string;
  color: string;
};

type ArchitectFlowNode = Node<ArchitectNodeData>;

const nodeTypes = {
  architect: ArchitectNode,
};

const allIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Database, Server, Monitor, Cloud, Cpu, HardDrive,
  LayoutList, ArrowUpDown, Repeat, Split,
  GitBranch, Circle, CheckCircle, ListOrdered, Layers,
  Link, Hash, Triangle, Variable, MousePointer,
  HelpCircle, Terminal, Palette,
};

interface SystemArchitectProps {
  design: SystemDesign;
  onSave: (boardState: BoardState) => Promise<unknown>;
  onUpdateName?: (name: string) => Promise<unknown>;
  onBack: () => void;
}

export function SystemArchitect({ design, onSave, onUpdateName, onBack }: SystemArchitectProps) {
  const initialNodes: ArchitectFlowNode[] = design.board_state.nodes.map((n) => ({
    id: n.id,
    type: 'architect',
    position: n.position,
    data: {
      label: n.data.label,
      description: n.data.description,
      nodeType: n.type,
      icon: getIconFromType(n.type),
      color: getColorFromType(n.type),
    },
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState<ArchitectFlowNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    design.board_state.edges.map((e) => ({
      ...e,
      type: 'smoothstep',
      label: e.label || '',
      markerEnd: { type: MarkerType.ArrowClosed, color: '#F59E0B', width: 20, height: 20 },
      style: { stroke: '#F59E0B', strokeWidth: 2 },
      labelStyle: { fill: 'hsl(var(--foreground))', fontWeight: 500 },
      labelBgStyle: { fill: 'hsl(var(--card))', fillOpacity: 0.9 },
      labelBgPadding: [8, 4] as [number, number],
      labelBgBorderRadius: 4,
    }))
  );

  // Edge label editing state
  const [editingEdge, setEditingEdge] = useState<Edge | null>(null);
  const [edgeLabelInput, setEdgeLabelInput] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [designName, setDesignName] = useState(design.name);
  const [mode, setMode] = useState<'system' | 'algorithm'>('system');
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>(
    (design.board_state as any).strokes || []
  );
  const [customNodeDialog, setCustomNodeDialog] = useState(false);
  const [customNodeColor, setCustomNodeColor] = useState('blue');
  const [customNodeLabel, setCustomNodeLabel] = useState('Custom Node');

  // Escape key exits draw mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawing) {
        setIsDrawing(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawing]);

  const groupedTemplates = mode === 'algorithm'
    ? algorithmTemplates.reduce<Record<string, NodeTemplate[]>>((acc, t) => {
        const cat = t.category || 'Other';
        (acc[cat] = acc[cat] || []).push(t);
        return acc;
      }, {})
    : null;

  const nodeIdCounter = useRef(nodes.length);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save with debounce
  const triggerAutoSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(async () => {
      const boardState: BoardState = {
        nodes: nodes.map((n) => ({
          id: n.id,
          type: n.data.nodeType,
          position: n.position,
          data: {
            label: n.data.label,
            description: n.data.description,
          },
        })),
        edges: edges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label as string | undefined,
        })),
        strokes,
      };
      await onSave(boardState);
    }, 1000);
  }, [nodes, edges, strokes, onSave]);

  useEffect(() => {
    triggerAutoSave();
  }, [nodes, edges, strokes, triggerAutoSave]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: 'smoothstep',
            label: '',
            markerEnd: { type: MarkerType.ArrowClosed, color: '#F59E0B', width: 20, height: 20 },
            style: { stroke: '#F59E0B', strokeWidth: 2 },
            labelStyle: { fill: 'hsl(var(--foreground))', fontWeight: 500 },
            labelBgStyle: { fill: 'hsl(var(--card))', fillOpacity: 0.9 },
            labelBgPadding: [8, 4] as [number, number],
            labelBgBorderRadius: 4,
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const onEdgeDoubleClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
    setEditingEdge(edge);
    setEdgeLabelInput((edge.label as string) || '');
  }, []);

  const handleEdgeLabelSave = useCallback(() => {
    if (editingEdge) {
      setEdges((eds) =>
        eds.map((e) =>
          e.id === editingEdge.id
            ? { ...e, label: edgeLabelInput }
            : e
        )
      );
      setEditingEdge(null);
      setEdgeLabelInput('');
    }
  }, [editingEdge, edgeLabelInput, setEdges]);

  const addNode = (template: NodeTemplate, overrideColor?: string, overrideLabel?: string) => {
    if (template.type === 'custom' && !overrideColor) {
      setCustomNodeDialog(true);
      return;
    }
    nodeIdCounter.current += 1;
    const newNode: ArchitectFlowNode = {
      id: `node-${nodeIdCounter.current}`,
      type: 'architect',
      position: { x: 250 + Math.random() * 100, y: 150 + Math.random() * 100 },
      data: {
        label: overrideLabel || template.label,
        nodeType: template.type,
        icon: template.icon,
        color: overrideColor || template.color,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleCustomNodeAdd = () => {
    const template = systemDesignTemplates.find(t => t.type === 'custom')!;
    addNode(template, customNodeColor, customNodeLabel.trim() || 'Custom Node');
    setCustomNodeDialog(false);
    setCustomNodeLabel('Custom Node');
    setCustomNodeColor('blue');
  };

  const handleManualSave = async () => {
    const boardState: BoardState = {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.data.nodeType,
        position: n.position,
        data: {
          label: n.data.label,
          description: n.data.description,
        },
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label as string | undefined,
      })),
        strokes,
    };
    await onSave(boardState);
    toast.success('Design saved');
  };

  const handleNameSave = async () => {
    const trimmedName = designName.trim();
    if (trimmedName && trimmedName !== design.name && onUpdateName) {
      await onUpdateName(trimmedName);
      toast.success('Design renamed');
    }
    setIsEditingName(false);
  };

  return (
    <div className="h-screen w-full bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur flex items-center h-14 px-4 gap-4 shrink-0">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          {isEditingName ? (
            <Input
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNameSave();
                if (e.key === 'Escape') {
                  setDesignName(design.name);
                  setIsEditingName(false);
                }
              }}
              className="h-8 max-w-xs"
              autoFocus
            />
          ) : (
            <h1
              className="font-semibold text-foreground truncate cursor-pointer hover:text-primary transition-colors"
              onClick={() => setIsEditingName(true)}
              title="Click to rename"
            >
              {design.name}
            </h1>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Mode toggle */}
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <Button
              variant={mode === 'system' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-none gap-1.5 h-9"
              onClick={() => setMode('system')}
            >
              <Network className="h-4 w-4" />
              System
            </Button>
            <Button
              variant={mode === 'algorithm' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-none gap-1.5 h-9"
              onClick={() => setMode('algorithm')}
            >
              <FlaskConical className="h-4 w-4" />
              Algorithm
            </Button>
          </div>

          {/* Draw toggle */}
          <Button
            variant={isDrawing ? 'default' : 'outline'}
            size="sm"
            className="gap-1.5 h-9"
            onClick={() => setIsDrawing(!isDrawing)}
          >
            <Pencil className="h-4 w-4" />
            Draw
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Node
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
              {mode === 'system' ? (
                systemDesignTemplates.map((template) => {
                  const Icon = allIcons[template.icon];
                  return (
                    <DropdownMenuItem key={template.type} onClick={() => addNode(template)}>
                      {Icon && <Icon className="h-4 w-4 mr-2" />}
                      {template.label}
                    </DropdownMenuItem>
                  );
                })
              ) : (
                Object.entries(groupedTemplates!).map(([category, templates]) => (
                  <div key={category}>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {category}
                    </div>
                    {templates.map((template) => {
                      const Icon = allIcons[template.icon];
                      return (
                        <DropdownMenuItem key={template.type} onClick={() => addNode(template)}>
                          {Icon && <Icon className="h-4 w-4 mr-2" />}
                          {template.label}
                        </DropdownMenuItem>
                      );
                    })}
                  </div>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleManualSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </header>

      {/* Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeDoubleClick={onEdgeDoubleClick}
          nodeTypes={nodeTypes}
          fitView
          deleteKeyCode={isDrawing ? [] : ['Backspace', 'Delete']}
          nodesDraggable={!isDrawing}
          elementsSelectable={!isDrawing}
          panOnDrag={!isDrawing}
          panOnScroll={false}
          zoomOnScroll={true}
          zoomOnPinch={true}
          zoomOnDoubleClick={!isDrawing}
          selectionOnDrag={false}
          className="bg-background"
          connectionLineType={ConnectionLineType.SmoothStep}
          connectionLineStyle={{ stroke: '#F59E0B', strokeWidth: 2, strokeDasharray: '6 3' }}
          defaultEdgeOptions={{
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed, color: '#F59E0B', width: 20, height: 20 },
            style: { stroke: '#F59E0B', strokeWidth: 2 },
          }}>
          <Background color="hsl(var(--muted-foreground) / 0.2)" gap={20} />
          <Controls className="bg-card border border-border rounded-lg" />
          <MiniMap
            className="bg-card border border-border rounded-lg"
            nodeColor="hsl(var(--primary))"
            maskColor="hsl(var(--background) / 0.8)"
          />
          <Panel position="bottom-center" className="bg-card/80 backdrop-blur border border-border rounded-lg px-4 py-2 text-sm text-muted-foreground z-0">
            {isDrawing
              ? 'Drawing mode active • Click Draw again to return to editing'
              : mode === 'algorithm'
                ? 'Algorithm mode • Add nodes to visualize data structures & algorithms'
                : 'Drag to connect • Double-click to edit labels • Delete/Backspace to remove'}
          </Panel>
          <DrawingCanvas
            isActive={isDrawing}
            strokes={strokes}
            onStrokesChange={setStrokes}
          />
        </ReactFlow>
      </div>

      {/* Edge Label Edit Dialog */}
      <Dialog open={!!editingEdge} onOpenChange={(open) => !open && setEditingEdge(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Connection Label</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edge-label">Label</Label>
              <Input
                id="edge-label"
                value={edgeLabelInput}
                onChange={(e) => setEdgeLabelInput(e.target.value)}
                placeholder="e.g., REST API, WebSocket, gRPC..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleEdgeLabelSave();
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingEdge(null)}>
              Cancel
            </Button>
            <Button onClick={handleEdgeLabelSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom Node Color Dialog */}
      <Dialog open={customNodeDialog} onOpenChange={setCustomNodeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Custom Node</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="custom-label">Node Name</Label>
              <Input
                id="custom-label"
                value={customNodeLabel}
                onChange={(e) => setCustomNodeLabel(e.target.value)}
                placeholder="Enter node name..."
                onKeyDown={(e) => { if (e.key === 'Enter') handleCustomNodeAdd(); }}
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {(['blue', 'green', 'purple', 'cyan', 'orange', 'pink'] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCustomNodeColor(c)}
                    className={cn(
                      'w-10 h-10 rounded-lg border-2 transition-all flex items-center justify-center text-xs font-medium capitalize',
                      customNodeColor === c
                        ? 'border-foreground scale-110 ring-2 ring-primary/50'
                        : 'border-transparent hover:scale-105',
                      c === 'blue' && 'bg-blue-500/20 text-blue-400',
                      c === 'green' && 'bg-green-500/20 text-green-400',
                      c === 'purple' && 'bg-purple-500/20 text-purple-400',
                      c === 'cyan' && 'bg-cyan-500/20 text-cyan-400',
                      c === 'orange' && 'bg-orange-500/20 text-orange-400',
                      c === 'pink' && 'bg-pink-500/20 text-pink-400',
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomNodeDialog(false)}>Cancel</Button>
            <Button onClick={handleCustomNodeAdd}>Add Node</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function getIconFromType(type: string): string {
  const map: Record<string, string> = {
    database: 'Database',
    server: 'Server',
    frontend: 'Monitor',
    cloud: 'Cloud',
    api: 'Cpu',
    storage: 'HardDrive',
  };
  return map[type] || 'Database';
}

function getColorFromType(type: string): string {
  const map: Record<string, string> = {
    database: 'blue',
    server: 'green',
    frontend: 'purple',
    cloud: 'cyan',
    api: 'orange',
    storage: 'pink',
  };
  return map[type] || 'blue';
}
