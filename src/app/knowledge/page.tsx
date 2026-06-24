'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// --- Custom Node Component for Windows XP Style ---
const CustomNode = ({ data }: any) => {
  const getColors = (type: string) => {
    switch (type) {
      case 'Application': return { bg: 'var(--app-blue-dark)', text: 'var(--app-window-bg)', icon: '🏢' };
      case 'Library': return { bg: '#D83B01', text: 'var(--app-window-bg)', icon: '📚' };
      case 'Controller': return { bg: '#008080', text: 'var(--app-window-bg)', icon: '🌐' };
      case 'Service': return { bg: '#3a93ff', text: 'var(--app-window-bg)', icon: '⚙️' };
      case 'Entity': return { bg: '#107C10', text: 'var(--app-window-bg)', icon: '💾' };
      case 'Module': return { bg: '#D83B01', text: 'var(--app-window-bg)', icon: '📦' };
      case 'CommandHandler': return { bg: '#6B69D6', text: 'var(--app-window-bg)', icon: '⚡' };
      case 'EventHandler': return { bg: '#8764B8', text: 'var(--app-window-bg)', icon: '📡' };
      case 'Endpoint': return { bg: '#FFB900', text: 'var(--app-text)', icon: '🔌' };
      default: return { bg: 'var(--app-bg)', text: 'var(--app-text)', icon: '📄' };
    }
  };

  const colors = getColors(data.nodeType);

  return (
    <div style={{
      background: 'var(--xp-bg)',
      border: '2px solid #0058e6',
      borderRadius: '4px',
      boxShadow: '2px 2px 4px rgba(0,0,0,0.3)',
      minWidth: '150px',
      fontFamily: 'Tahoma, sans-serif'
    }}>
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
      <div style={{
        background: `linear-gradient(to right, ${colors.bg}, #0058e6)`,
        color: 'var(--app-window-bg)',
        padding: '4px 8px',
        fontWeight: 'bold',
        fontSize: '11px',
        borderBottom: '1px solid var(--app-text)'
      }}>
        {colors.icon} {data.nodeType}
      </div>
      <div style={{ padding: '8px', fontSize: '11px', color: 'var(--app-text)' }}>
        <strong>{data.label}</strong>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
    </div>
  );
};

const nodeTypes = {
  customNode: CustomNode,
};

import { useTheme } from 'next-themes';
import { KnowledgeGraphProps } from './components/types';
import KnowledgeXP from './components/KnowledgeXP';
import KnowledgeDarkside from './components/KnowledgeDarkside';
import KnowledgeGlass from './components/KnowledgeGlass';

export default function KnowledgeGraphPage() {
  const { theme } = useTheme();
  const [repoPath, setRepoPath] = useState('/Users/mrppy/worklife-core-hr-service');
  const [scanMode, setScanMode] = useState<'macro' | 'micro'>('macro');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [rfInstance, setRfInstance] = useState<any>(null);

  // Folder Browser State
  const [showBrowser, setShowBrowser] = useState(false);
  const [browserPath, setBrowserPath] = useState('/Users/mrppy');
  const [browserDirectories, setBrowserDirectories] = useState<string[]>([]);
  const [browserLoading, setBrowserLoading] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const loadDirectories = async (targetPath: string) => {
    setBrowserLoading(true);
    try {
      const res = await fetch('/api/fs/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetPath }),
      });
      const data = await res.json();
      if (data.success) {
        setBrowserDirectories(data.directories);
        setBrowserPath(targetPath);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBrowserLoading(false);
    }
  };

  const handleOpenBrowser = () => {
    setShowBrowser(true);
    loadDirectories(browserPath);
  };

  const handleDirClick = (dirName: string) => {
    const newPath = browserPath === '/' ? `/${dirName}` : `${browserPath}/${dirName}`;
    loadDirectories(newPath);
  };

  const handleGoUp = () => {
    if (browserPath === '/') return;
    const parts = browserPath.split('/');
    parts.pop();
    const newPath = parts.join('/') || '/';
    loadDirectories(newPath);
  };

  const handleSelectFolder = () => {
    setRepoPath(browserPath);
    setShowBrowser(false);
  };

  const handleScan = async (overrideMode?: 'macro' | 'micro', overridePath?: string) => {
    setLoading(true);
    setError(null);
    setSelectedNode(null);
    try {
      const modeToUse = overrideMode || scanMode;
      const pathToUse = overridePath || repoPath;

      const res = await fetch('/api/graph/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoPath: pathToUse, mode: modeToUse }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();
      
      if (data.nodes.length > 5000) {
        throw new Error(`Graph is too massive (${data.nodes.length} nodes). Please select a more specific module.`);
      }

      // Backend already calculated layout positions via Dagre
      setNodes(data.nodes);
      setEdges(data.edges);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = (event: React.MouseEvent, node: any) => {
    setSelectedNode(node);
  };

  const handleNodeDoubleClick = (event: React.MouseEvent, node: any) => {
    if (node.data.nodeType === 'Application' || node.data.nodeType === 'Library') {
      setRepoPath(node.data.file);
      setScanMode('micro');
      handleScan('micro', node.data.file);
    }
  };

  const handlePaneClick = () => {
    setSelectedNode(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || nodes.length === 0) return;

    const query = searchQuery.toLowerCase();
    const foundNode = nodes.find((n: any) => 
      n.data.label.toLowerCase().includes(query) || 
      n.data.nodeType.toLowerCase().includes(query)
    );

    if (foundNode) {
      focusNode(foundNode);
    } else {
      alert(`ไม่พบข้อมูลที่ตรงกับ "${searchQuery}" ในกราฟนี้ครับ`);
    }
  };

  const focusNode = (node: any) => {
    setSelectedNode(node);
    if (rfInstance) {
      rfInstance.fitView({
        nodes: [{ id: node.id }],
        duration: 800,
        maxZoom: 1.2,
      });
    }
  };

  const handleExportForAI = () => {
    if (!selectedNode) return;

    const connected = new Set<string>();
    const queue = [selectedNode.id];
    connected.add(selectedNode.id);

    while (queue.length > 0) {
      const current = queue.shift()!;
      edges.forEach((edge) => {
        if (edge.source === current && !connected.has(edge.target)) {
          connected.add(edge.target);
          queue.push(edge.target);
        }
        // For AI export, we usually want the downstream flow, but keeping upstream is also good context
        if (edge.target === current && !connected.has(edge.source)) {
          connected.add(edge.source);
          queue.push(edge.source);
        }
      });
    }

    const flowNodes = nodes.filter((n: any) => connected.has(n.id)).map((n: any) => ({
      name: n.data.label,
      type: n.data.nodeType,
      filePath: n.data.file,
      ...(n.data.methodName && { method: n.data.methodName }),
      ...(n.data.payloads && { parameters: n.data.payloads }),
      ...(n.data.logicSnippet && { logic_snippet: n.data.logicSnippet }),
    }));
    
    const flowEdges = edges.filter((e: any) => connected.has(e.source) && connected.has(e.target)).map((e: any) => ({
      from: nodes.find((n: any) => n.id === e.source)?.data?.label || e.source,
      to: nodes.find((n: any) => n.id === e.target)?.data?.label || e.target,
      relation: e.label
    }));

    const exportData = {
      system_prompt: "You are an AI assistant helping a developer with a specific architectural flow.",
      focus_component: selectedNode.data.label,
      components: flowNodes,
      flow_relationships: flowEdges
    };

    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
    alert('✅ Copied JSON Flow to clipboard! Paste it to ChatGPT, Claude, or Gemini.');
  };

  const getDependencies = (nodeId: string) => edges.filter((e) => e.source === nodeId);
  const getDependents = (nodeId: string) => edges.filter((e) => e.target === nodeId);

  // --- Sub-Graph Highlighting Logic via useEffect ---
  useEffect(() => {
    if (nodes.length === 0) return;

    if (!selectedNode) {
      setNodes((nds) => nds.map((n) => ({ ...n, style: { ...n.style, opacity: 1 } })));
      setEdges((eds) => eds.map((e) => ({ ...e, style: { ...e.style, opacity: 1 }, animated: e.label === 'USES_REPO' })));
      return;
    }

    const connected = new Set<string>();
    const queue = [selectedNode.id];
    connected.add(selectedNode.id);

    while (queue.length > 0) {
      const current = queue.shift()!;
      edges.forEach((edge) => {
        if (edge.source === current && !connected.has(edge.target)) {
          connected.add(edge.target);
          queue.push(edge.target);
        }
        if (edge.target === current && !connected.has(edge.source)) {
          connected.add(edge.source);
          queue.push(edge.source);
        }
      });
    }

    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        style: { ...n.style, opacity: connected.has(n.id) ? 1 : 0.15 },
      }))
    );

    setEdges((eds) =>
      eds.map((e) => {
        const isActive = connected.has(e.source) && connected.has(e.target);
        return {
          ...e,
          style: { ...e.style, opacity: isActive ? 1 : 0.15, strokeWidth: isActive ? 2 : 1 },
          animated: isActive,
        };
      })
    );
  }, [selectedNode]); // Only run when selectedNode changes!

  const props: KnowledgeGraphProps = {
    repoPath, scanMode, loading, error, searchQuery,
    showBrowser, browserPath, browserDirectories, browserLoading,
    nodes, edges, selectedNode, nodeTypes,
    setRepoPath, setScanMode, setSearchQuery, setShowBrowser, setBrowserPath,
    onNodesChange, onEdgesChange, onConnect, setRfInstance,
    handleOpenBrowser, handleDirClick, handleGoUp, handleSelectFolder,
    handleScan, handleNodeClick, handleNodeDoubleClick, handlePaneClick,
    handleSearch, focusNode, handleExportForAI, getDependencies, getDependents
  };

  switch (theme) {
    case 'darkside':
      return <KnowledgeDarkside {...props} />;
    case 'glass':
      return <KnowledgeGlass {...props} />;
    case 'xp':
    default:
      return <KnowledgeXP {...props} />;
  }
}
