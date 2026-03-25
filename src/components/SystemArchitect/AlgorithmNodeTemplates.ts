export interface NodeTemplate {
  type: string;
  label: string;
  icon: string;
  color: string;
  category?: string;
}

export const systemDesignTemplates: NodeTemplate[] = [
  { type: 'database', label: 'Database', icon: 'Database', color: 'blue' },
  { type: 'server', label: 'Server', icon: 'Server', color: 'green' },
  { type: 'frontend', label: 'Frontend', icon: 'Monitor', color: 'purple' },
  { type: 'cloud', label: 'Cloud Service', icon: 'Cloud', color: 'cyan' },
  { type: 'api', label: 'API', icon: 'Cpu', color: 'orange' },
  { type: 'storage', label: 'Storage', icon: 'HardDrive', color: 'pink' },
];

export const algorithmTemplates: NodeTemplate[] = [
  // Sorting
  { type: 'array', label: 'Array', icon: 'LayoutList', color: 'blue', category: 'Sorting' },
  { type: 'comparator', label: 'Comparator', icon: 'ArrowUpDown', color: 'orange', category: 'Sorting' },
  { type: 'swap', label: 'Swap', icon: 'Repeat', color: 'pink', category: 'Sorting' },
  { type: 'partition', label: 'Partition', icon: 'Split', color: 'cyan', category: 'Sorting' },

  // Graph / Tree
  { type: 'tree-node', label: 'Tree Node', icon: 'GitBranch', color: 'green', category: 'Graph & Tree' },
  { type: 'graph-vertex', label: 'Vertex', icon: 'Circle', color: 'purple', category: 'Graph & Tree' },
  { type: 'visited', label: 'Visited', icon: 'CheckCircle', color: 'green', category: 'Graph & Tree' },
  { type: 'queue-bfs', label: 'BFS Queue', icon: 'ListOrdered', color: 'blue', category: 'Graph & Tree' },
  { type: 'stack-dfs', label: 'DFS Stack', icon: 'Layers', color: 'orange', category: 'Graph & Tree' },

  // Data Structures
  { type: 'linked-node', label: 'Linked Node', icon: 'Link', color: 'cyan', category: 'Data Structures' },
  { type: 'stack', label: 'Stack', icon: 'Layers', color: 'purple', category: 'Data Structures' },
  { type: 'queue', label: 'Queue', icon: 'ListOrdered', color: 'blue', category: 'Data Structures' },
  { type: 'hash-table', label: 'Hash Table', icon: 'Hash', color: 'orange', category: 'Data Structures' },
  { type: 'heap', label: 'Heap', icon: 'Triangle', color: 'pink', category: 'Data Structures' },

  // General
  { type: 'variable', label: 'Variable', icon: 'Variable', color: 'green', category: 'General' },
  { type: 'pointer', label: 'Pointer', icon: 'MousePointer', color: 'pink', category: 'General' },
  { type: 'condition', label: 'Condition', icon: 'HelpCircle', color: 'orange', category: 'General' },
  { type: 'output', label: 'Output', icon: 'Terminal', color: 'cyan', category: 'General' },
];