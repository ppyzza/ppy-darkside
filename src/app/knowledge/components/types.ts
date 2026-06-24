export interface KnowledgeGraphProps {
  repoPath: string;
  scanMode: 'macro' | 'micro';
  loading: boolean;
  error: string | null;
  searchQuery: string;
  rfInstance: any;
  showBrowser: boolean;
  browserPath: string;
  browserDirectories: string[];
  browserLoading: boolean;
  nodes: any[];
  edges: any[];
  selectedNode: any | null;
  nodeTypes: any;

  setRepoPath: (path: string) => void;
  setScanMode: (mode: 'macro' | 'micro') => void;
  setSearchQuery: (query: string) => void;
  setShowBrowser: (show: boolean) => void;
  setBrowserPath: (path: string) => void;
  
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (params: any) => void;
  setRfInstance: (instance: any) => void;

  handleOpenBrowser: () => void;
  handleDirClick: (dirName: string) => void;
  handleGoUp: () => void;
  handleSelectFolder: () => void;
  handleScan: (overrideMode?: 'macro' | 'micro', overridePath?: string) => Promise<void>;
  handleNodeClick: (event: React.MouseEvent, node: any) => void;
  handleNodeDoubleClick: (event: React.MouseEvent, node: any) => void;
  handlePaneClick: () => void;
  handleSearch: (e: React.FormEvent) => void;
  focusNode: (node: any) => void;
  handleExportForAI: () => void;
  getDependencies: (nodeId: string) => any[];
  getDependents: (nodeId: string) => any[];
}
