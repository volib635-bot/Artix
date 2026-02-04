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
  Panel,
  MarkerType,
  type Node,
  type Edge,
  EdgeLabelRenderer,
  BaseEdge,
  getStraightPath,
  getBezierPath,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ArrowLeft, Save, Plus, Database, Server, Monitor, Cloud, Cpu, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SystemDesign, BoardState } from '@/hooks/useSystemDesigns';
import { ArchitectNode } from './ArchitectNode';
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

const nodeTemplates = [
  { type: 'database', label: 'Database', icon: 'Database', color: 'blue' },
  { type: 'server', label: 'Server', icon: 'Server', color: 'green' },
  { type: 'frontend', label: 'Frontend', icon: 'Monitor', color: 'purple' },
  { type: 'cloud', label: 'Cloud Service', icon: 'Cloud', color: 'cyan' },
  { type: 'api', label: 'API', icon: 'Cpu', color: 'orange' },
  { type: 'storage', label: 'Storage', icon: 'HardDrive', color: 'pink' },
];

interface SystemArchitectProps {
  design: SystemDesign;
  onSave: (boardState: BoardState) => Promise<unknown>;
  onBack: () => void;
}

export function SystemArchitect({ design, onSave, onBack }: SystemArchitectProps) {
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
      label: e.label || '',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: 'hsl(var(--primary))' },
      labelStyle: { fill: 'hsl(var(--foreground))', fontWeight: 500 },
      labelBgStyle: { fill: 'hsl(var(--card))', fillOpacity: 0.9 },
      labelBgPadding: [8, 4] as [number, number],
      labelBgBorderRadius: 4,
    }))
  );

  // Edge label editing state
  const [editingEdge, setEditingEdge] = useState<Edge | null>(null);
  const [edgeLabelInput, setEdgeLabelInput] = useState('');

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
      };
      await onSave(boardState);
    }, 1000);
  }, [nodes, edges, onSave]);

  useEffect(() => {
    triggerAutoSave();
  }, [nodes, edges, triggerAutoSave]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            label: '',
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: 'hsl(var(--primary))' },
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

  const addNode = (template: (typeof nodeTemplates)[0]) => {
    nodeIdCounter.current += 1;
    const newNode: ArchitectFlowNode = {
      id: `node-${nodeIdCounter.current}`,
      type: 'architect',
      position: { x: 250 + Math.random() * 100, y: 150 + Math.random() * 100 },
      data: {
        label: template.label,
        nodeType: template.type,
        icon: template.icon,
        color: template.color,
      },
    };
    setNodes((nds) => [...nds, newNode]);
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
    };
    await onSave(boardState);
    toast.success('Design saved');
  };

  return (
    <div className="h-screen w-full bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur flex items-center h-14 px-4 gap-4 shrink-0">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-foreground truncate">{design.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Node
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {nodeTemplates.map((template) => (
                <DropdownMenuItem key={template.type} onClick={() => addNode(template)}>
                  {template.icon === 'Database' && <Database className="h-4 w-4 mr-2" />}
                  {template.icon === 'Server' && <Server className="h-4 w-4 mr-2" />}
                  {template.icon === 'Monitor' && <Monitor className="h-4 w-4 mr-2" />}
                  {template.icon === 'Cloud' && <Cloud className="h-4 w-4 mr-2" />}
                  {template.icon === 'Cpu' && <Cpu className="h-4 w-4 mr-2" />}
                  {template.icon === 'HardDrive' && <HardDrive className="h-4 w-4 mr-2" />}
                  {template.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleManualSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </header>

      {/* Canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeDoubleClick={onEdgeDoubleClick}
          nodeTypes={nodeTypes}
          fitView
          deleteKeyCode={['Backspace', 'Delete']}
          className="bg-background"
          defaultEdgeOptions={{
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: 'hsl(var(--primary))' },
          }}
        >
          <Background color="hsl(var(--muted-foreground) / 0.2)" gap={20} />
          <Controls className="bg-card border border-border rounded-lg" />
          <MiniMap
            className="bg-card border border-border rounded-lg"
            nodeColor="hsl(var(--primary))"
            maskColor="hsl(var(--background) / 0.8)"
          />
          <Panel position="bottom-center" className="bg-card/80 backdrop-blur border border-border rounded-lg px-4 py-2 text-sm text-muted-foreground">
            Drag to connect • Double-click to edit labels • Select + Delete/Backspace to remove
          </Panel>
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
