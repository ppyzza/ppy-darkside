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
      case 'Application': return { bg: '#0A246A', text: '#FFFFFF', icon: '🏢' };
      case 'Library': return { bg: '#D83B01', text: '#FFFFFF', icon: '📚' };
      case 'Controller': return { bg: '#008080', text: '#FFFFFF', icon: '🌐' };
      case 'Service': return { bg: '#3a93ff', text: '#FFFFFF', icon: '⚙️' };
      case 'Entity': return { bg: '#107C10', text: '#FFFFFF', icon: '💾' };
      case 'Module': return { bg: '#D83B01', text: '#FFFFFF', icon: '📦' };
      case 'CommandHandler': return { bg: '#6B69D6', text: '#FFFFFF', icon: '⚡' };
      case 'EventHandler': return { bg: '#8764B8', text: '#FFFFFF', icon: '📡' };
      case 'Endpoint': return { bg: '#FFB900', text: '#000000', icon: '🔌' };
      default: return { bg: '#ECE9D8', text: '#000000', icon: '📄' };
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
        color: '#FFFFFF',
        padding: '4px 8px',
        fontWeight: 'bold',
        fontSize: '11px',
        borderBottom: '1px solid #000'
      }}>
        {colors.icon} {data.nodeType}
      </div>
      <div style={{ padding: '8px', fontSize: '11px', color: '#000' }}>
        <strong>{data.label}</strong>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
    </div>
  );
};

const nodeTypes = {
  customNode: CustomNode,
};

export default function KnowledgeGraphPage() {
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px', position: 'relative' }}>
      
      {/* Folder Browser Modal */}
      {showBrowser && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '500px', height: '400px', background: 'var(--xp-bg)', border: '2px solid #0058e6',
          boxShadow: '4px 4px 10px rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ background: 'linear-gradient(to right, #0A246A, #0058e6)', color: '#fff', padding: '4px 8px', fontWeight: 'bold', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Browse for Folder</span>
            <button onClick={() => setShowBrowser(false)} style={{ background: '#d83b01', color: '#fff', border: '1px solid #fff', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
          </div>
          <div style={{ padding: '8px', display: 'flex', gap: '8px', background: '#ece9d8', borderBottom: '1px solid #aca899' }}>
            <button className="btn" onClick={handleGoUp} disabled={browserPath === '/'}>⬆️ Up</button>
            <input type="text" value={browserPath} readOnly style={{ flex: 1, padding: '2px 4px' }} />
          </div>
          <div style={{ flex: 1, background: '#fff', overflowY: 'auto', padding: '8px' }}>
            {browserLoading ? (
              <div style={{ fontSize: '11px', color: '#666' }}>Loading...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {browserDirectories.map(dir => (
                  <div 
                    key={dir} 
                    onClick={() => handleDirClick(dir)}
                    style={{ cursor: 'pointer', padding: '4px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#316ac5'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span>📁</span>
                    <span style={{ color: 'inherit' }}>{dir}</span>
                  </div>
                ))}
                {browserDirectories.length === 0 && <div style={{ fontSize: '11px', color: '#666' }}>No subfolders</div>}
              </div>
            )}
          </div>
          <div style={{ padding: '8px', background: '#ece9d8', borderTop: '1px solid #aca899', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button className="btn" onClick={handleSelectFolder}>OK</button>
            <button className="btn" onClick={() => setShowBrowser(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Top Toolbar */}
      <div className="window-panel" style={{ padding: '8px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '11px', fontWeight: 'bold' }}>Target Repository:</span>
        <input 
          type="text" 
          value={repoPath} 
          onChange={(e) => setRepoPath(e.target.value)}
          style={{ width: '400px', padding: '4px', border: '1px solid #7F9DB9' }}
        />
        <button className="btn" onClick={handleOpenBrowser}>
          📂 Browse...
        </button>
        <select 
          value={scanMode} 
          onChange={(e) => setScanMode(e.target.value as any)}
          style={{ padding: '4px', border: '1px solid #7F9DB9' }}
        >
          <option value="macro">🌊 Macro View (Apps & Libs)</option>
          <option value="micro">🔬 Micro View (Deep AST Scan)</option>
        </select>
        <button className="btn" onClick={() => handleScan()} disabled={loading}>
          {loading ? 'Scanning...' : '🔍 Scan Code'}
        </button>

        <div style={{ width: '1px', height: '24px', background: '#aca899', margin: '0 8px' }}></div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold' }}>Search:</span>
          <input 
            type="text" 
            placeholder="e.g. GET /time-off or ServiceName"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '200px', padding: '4px', border: '1px solid #7F9DB9' }}
          />
          <button type="submit" className="btn">🎯 Focus</button>
        </form>

        {error && <span style={{ color: 'red', fontSize: '11px', marginLeft: 'auto' }}>{error}</span>}
      </div>

      {/* Main Workspace */}
      <div style={{ display: 'flex', flex: 1, gap: '12px', minHeight: 0 }}>
        
        {/* Swagger-like Endpoints Sidebar */}
        {scanMode === 'micro' && (
          <div className="window-panel" style={{ width: '320px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: 'linear-gradient(to right, #0A246A, #0058e6)', color: 'white', padding: '4px 8px', fontSize: '11px', fontWeight: 'bold' }}>
              🔌 API Endpoints
            </div>
            <div style={{ flex: 1, background: '#FFFFFF', overflowY: 'auto', padding: '4px' }}>
              {nodes.filter(n => n.data.nodeType === 'Endpoint').map(node => {
                const label = node.data.label;
                const method = label.split(' ')[0];
                const path = label.split(' ').slice(1).join(' ');
                let methodColor = '#000';
                if (method === 'GET') methodColor = '#0058e6';
                if (method === 'POST') methodColor = '#107C10';
                if (method === 'PUT') methodColor = '#D83B01';
                if (method === 'DELETE') methodColor = '#D13438';
                if (method === 'PATCH') methodColor = '#6B69D6';

                return (
                  <div 
                    key={node.id} 
                    style={{ 
                      fontSize: '11px', padding: '6px', cursor: 'pointer', 
                      borderBottom: '1px solid #f0f0f0', display: 'flex', gap: '8px', alignItems: 'center'
                    }}
                    onClick={() => focusNode(node)}
                    onMouseOver={(e) => e.currentTarget.style.background = '#eef3fc'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontWeight: 'bold', color: methodColor, width: '45px' }}>{method}</span>
                    <span style={{ fontFamily: 'monospace', wordBreak: 'break-all', color: '#333' }}>{path}</span>
                  </div>
                );
              })}
              {nodes.length > 0 && nodes.filter(n => n.data.nodeType === 'Endpoint').length === 0 && (
                <div style={{ color: '#888', fontSize: '11px', padding: '8px', textAlign: 'center' }}>No API endpoints found.</div>
              )}
            </div>
          </div>
        )}

        {/* Graph Canvas */}
        <div className="window-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: '#0A246A', color: 'white', padding: '2px 6px', fontSize: '11px', fontWeight: 'bold' }}>
            Knowledge Graph Explorer (ReactFlow)
          </div>
          <div style={{ flex: 1, background: '#FFFFFF' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={handleNodeClick}
              onNodeDoubleClick={handleNodeDoubleClick}
              onPaneClick={handlePaneClick}
              onInit={setRfInstance}
              nodeTypes={nodeTypes}
              fitView
            >
              <Controls />
              <MiniMap />
              <Background gap={12} size={1} />
            </ReactFlow>
          </div>
        </div>

        {/* Right Panel - Node Details */}
        <div className="window-panel" style={{ width: '300px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ background: '#0A246A', color: 'white', padding: '2px 6px', fontSize: '11px', fontWeight: 'bold' }}>
            Node Details
          </div>
          <div style={{ padding: '8px', fontSize: '11px', background: '#FFFFFF', flex: 1 }}>
            {!selectedNode ? (
              <div style={{ color: '#666', fontStyle: 'italic' }}>Select a node in the graph to view details.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#0A246A' }}>{selectedNode.data.label}</h3>
                  <div><strong>Type:</strong> {selectedNode.data.nodeType}</div>
                  <div style={{ color: '#666', fontSize: '10px', wordBreak: 'break-all' }}>{selectedNode.data.file}</div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #E0DFE3', margin: 0 }} />

                {/* Used By (Dependents) */}
                <div>
                  <h4 style={{ margin: '0 0 4px 0', color: '#D83B01' }}>Used By (Dependents)</h4>
                  <ul style={{ paddingLeft: '16px', margin: 0 }}>
                    {getDependents(selectedNode.id).map(e => (
                      <li key={e.id}>{e.source}</li>
                    ))}
                    {getDependents(selectedNode.id).length === 0 && <span style={{ color: '#aaa' }}>None</span>}
                  </ul>
                </div>

                {/* Depends On (Dependencies) */}
                <div>
                  <h4 style={{ margin: '0 0 4px 0', color: '#107C10' }}>Depends On (Dependencies)</h4>
                  <ul style={{ paddingLeft: '20px', margin: '4px 0' }}>
                    {getDependencies(selectedNode.id).map(e => (
                      <li key={e.id}>{e.target}</li>
                    ))}
                    {getDependencies(selectedNode.id).length === 0 && <span style={{ color: '#aaa' }}>None</span>}
                  </ul>
                </div>

                {/* API Method Details (If Available) */}
                {selectedNode.data.payloads && selectedNode.data.payloads.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <h4 style={{ margin: '0 0 4px 0', color: '#D83B01' }}>📥 Parameters / DTOs</h4>
                    <ul style={{ paddingLeft: '20px', margin: '4px 0', fontSize: '11px', fontFamily: 'monospace' }}>
                      {selectedNode.data.payloads.map((p: string, i: number) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedNode.data.logicSnippet && (
                  <div style={{ marginTop: '12px' }}>
                    <h4 style={{ margin: '0 0 4px 0', color: '#6B69D6' }}>⚙️ Logic Snippet ({selectedNode.data.methodName})</h4>
                    <pre style={{ 
                      background: '#f4f4f4', padding: '8px', border: '1px solid #ccc', 
                      overflowX: 'auto', fontSize: '10px', maxHeight: '150px' 
                    }}>
                      <code>{selectedNode.data.logicSnippet}</code>
                    </pre>
                  </div>
                )}

                <div style={{ background: '#FFFFE1', padding: '8px', border: '1px solid #000', marginTop: '12px' }}>
                  <strong>💡 Impact Analysis:</strong><br/>
                  If you modify <code>{selectedNode.data.label}</code>, it will directly impact {getDependents(selectedNode.id).length} other component(s).
                </div>

                <button 
                  className="btn" 
                  style={{ marginTop: '12px', width: '100%', padding: '8px', fontWeight: 'bold', background: '#107C10', color: 'white' }}
                  onClick={handleExportForAI}
                >
                  🤖 Export JSON for AI
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
