import React from 'react';
import { KnowledgeGraphProps } from './types';
import { ReactFlow, MiniMap, Controls, Background } from '@xyflow/react';
import { Folder, Search, Crosshair, Cpu, Eye, Box, Database, HardDrive, Layout, ChevronUp, Check, Play, TerminalSquare, Share2 } from 'lucide-react';

export default function KnowledgeDarkside(props: KnowledgeGraphProps) {
  const {
    repoPath, scanMode, loading, error, searchQuery,
    showBrowser, browserPath, browserDirectories, browserLoading,
    nodes, edges, selectedNode, nodeTypes,
    setRepoPath, setScanMode, setSearchQuery, setShowBrowser, setBrowserPath,
    onNodesChange, onEdgesChange, onConnect, setRfInstance,
    handleOpenBrowser, handleDirClick, handleGoUp, handleSelectFolder,
    handleScan, handleNodeClick, handleNodeDoubleClick, handlePaneClick,
    handleSearch, focusNode, handleExportForAI, getDependencies, getDependents
  } = props;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px', padding: '16px', background: 'var(--app-bg)' }}>
      
      {/* Folder Browser Modal */}
      {showBrowser && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            width: '500px', height: '500px', background: 'var(--app-window-bg)', border: '1px solid var(--app-border)',
            borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', overflow: 'hidden'
          }}>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--app-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}><Folder size={18} color="var(--app-blue)" /> Select Repository</div>
              <button onClick={() => setShowBrowser(false)} style={{ background: 'transparent', border: 'none', color: 'var(--app-text-muted)', cursor: 'pointer' }}>✕</button>
            </div>
            
            <div style={{ padding: '12px', display: 'flex', gap: '8px', background: 'var(--app-bg)', borderBottom: '1px solid var(--app-border)' }}>
              <button onClick={handleGoUp} disabled={browserPath === '/'} style={{ padding: '6px 12px', background: 'var(--app-panel)', border: '1px solid var(--app-border)', color: 'var(--app-text)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}><ChevronUp size={16} /> Up</button>
              <input type="text" value={browserPath} readOnly style={{ flex: 1, padding: '8px 12px', background: 'var(--app-window-bg)', border: '1px solid var(--app-border)', color: 'var(--app-text)', borderRadius: '6px' }} />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {browserLoading ? (
                <div style={{ textAlign: 'center', color: 'var(--app-text-muted)', marginTop: '20px' }}>Loading...</div>
              ) : browserDirectories.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--app-text-muted)', marginTop: '20px' }}>No subfolders</div>
              ) : (
                browserDirectories.map(dir => (
                  <div 
                    key={dir} 
                    onClick={() => handleDirClick(dir)}
                    style={{ cursor: 'pointer', padding: '10px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Folder size={16} color="var(--app-blue)" /> {dir}
                  </div>
                ))
              )}
            </div>

            <div style={{ padding: '16px', borderTop: '1px solid var(--app-border)', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'var(--app-bg)' }}>
              <button onClick={() => setShowBrowser(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--app-border)', color: 'var(--app-text)', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSelectFolder} style={{ padding: '8px 16px', background: 'var(--app-blue)', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={16} /> Select This Folder</button>
            </div>
          </div>
        </div>
      )}

      {/* Top Toolbar */}
      <div style={{ padding: '16px', background: 'var(--app-window-bg)', border: '1px solid var(--app-border)', borderRadius: '8px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '300px' }}>
          <Folder size={16} color="var(--app-text-muted)" />
          <input 
            type="text" 
            value={repoPath} 
            onChange={(e) => setRepoPath(e.target.value)}
            style={{ flex: 1, padding: '8px 12px', background: 'var(--app-bg)', border: '1px solid var(--app-border)', color: 'var(--app-text)', borderRadius: '6px', outline: 'none' }}
          />
          <button onClick={handleOpenBrowser} style={{ padding: '8px 12px', background: 'var(--app-panel)', border: '1px solid var(--app-border)', color: 'var(--app-text)', borderRadius: '6px', cursor: 'pointer' }}>
            Browse
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select 
            value={scanMode} 
            onChange={(e) => setScanMode(e.target.value as any)}
            style={{ padding: '8px 12px', background: 'var(--app-bg)', border: '1px solid var(--app-border)', color: 'var(--app-text)', borderRadius: '6px', outline: 'none' }}
          >
            <option value="macro">Macro View (Apps & Libs)</option>
            <option value="micro">Micro View (Deep AST Scan)</option>
          </select>
          <button onClick={() => handleScan()} disabled={loading} style={{ padding: '8px 16px', background: 'var(--app-blue)', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', opacity: loading ? 0.7 : 1 }}>
            <Cpu size={16} /> {loading ? 'Scanning...' : 'Scan'}
          </button>
        </div>

        <div style={{ width: '1px', height: '24px', background: 'var(--app-border)' }}></div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} color="var(--app-text-muted)" style={{ position: 'absolute', left: '10px', top: '11px' }} />
            <input 
              type="text" 
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '200px', padding: '8px 12px 8px 32px', background: 'var(--app-bg)', border: '1px solid var(--app-border)', color: 'var(--app-text)', borderRadius: '6px', outline: 'none' }}
            />
          </div>
          <button type="submit" style={{ padding: '8px 12px', background: 'var(--app-panel)', border: '1px solid var(--app-border)', color: 'var(--app-text)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Crosshair size={14} /> Focus
          </button>
        </form>

        {error && <span style={{ color: 'var(--app-danger)', fontSize: '13px' }}>{error}</span>}
      </div>

      {/* Main Workspace */}
      <div style={{ display: 'flex', flex: 1, gap: '16px', minHeight: 0 }}>
        
        {/* API Endpoints Sidebar */}
        {scanMode === 'micro' && (
          <div style={{ width: '320px', display: 'flex', flexDirection: 'column', background: 'var(--app-window-bg)', border: '1px solid var(--app-border)', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--app-border)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
              <TerminalSquare size={16} color="var(--app-blue)" /> API Endpoints
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
              {nodes.filter(n => n.data.nodeType === 'Endpoint').map(node => {
                const label = node.data.label;
                const method = label.split(' ')[0];
                const path = label.split(' ').slice(1).join(' ');
                let methodColor = 'var(--app-text)';
                if (method === 'GET') methodColor = '#3b82f6';
                if (method === 'POST') methodColor = '#22c55e';
                if (method === 'PUT') methodColor = '#f59e0b';
                if (method === 'DELETE') methodColor = '#ef4444';
                if (method === 'PATCH') methodColor = '#a855f7';

                return (
                  <div 
                    key={node.id} 
                    style={{ 
                      fontSize: '12px', padding: '10px 12px', cursor: 'pointer', 
                      borderRadius: '6px', display: 'flex', gap: '12px', alignItems: 'center',
                      transition: 'background 0.2s'
                    }}
                    onClick={() => focusNode(node)}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontWeight: 'bold', color: methodColor, width: '45px' }}>{method}</span>
                    <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Monaco, monospace', color: 'var(--app-text-muted)', wordBreak: 'break-all' }}>{path}</span>
                  </div>
                );
              })}
              {nodes.length > 0 && nodes.filter(n => n.data.nodeType === 'Endpoint').length === 0 && (
                <div style={{ color: 'var(--app-text-muted)', fontSize: '13px', padding: '16px', textAlign: 'center' }}>No API endpoints found.</div>
              )}
            </div>
          </div>
        )}

        {/* Graph Canvas */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--app-window-bg)', border: '1px solid var(--app-border)', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 10, display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.5)', padding: '6px 12px', borderRadius: '20px', backdropFilter: 'blur(4px)', border: '1px solid var(--app-border)', fontSize: '12px', color: 'var(--app-text-muted)' }}>
            <Eye size={14} /> ReactFlow Explorer
          </div>
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
            proOptions={{ hideAttribution: true }}
          >
            <Controls style={{ background: 'var(--app-panel)', border: '1px solid var(--app-border)', borderRadius: '8px', overflow: 'hidden' }} />
            <MiniMap style={{ background: 'var(--app-panel)', border: '1px solid var(--app-border)', borderRadius: '8px' }} maskColor="rgba(0,0,0,0.5)" nodeColor="var(--app-blue)" />
            <Background gap={16} size={1} color="rgba(255,255,255,0.05)" />
          </ReactFlow>
        </div>

        {/* Right Panel - Node Details */}
        <div style={{ width: '320px', display: 'flex', flexDirection: 'column', background: 'var(--app-window-bg)', border: '1px solid var(--app-border)', borderRadius: '8px', overflowY: 'auto' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--app-border)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
            <Layout size={16} color="var(--app-blue)" /> Node Details
          </div>
          <div style={{ padding: '16px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {!selectedNode ? (
              <div style={{ color: 'var(--app-text-muted)', textAlign: 'center', marginTop: '40px' }}>
                <Box size={48} style={{ opacity: 0.2, margin: '0 auto 16px auto' }} />
                Select a node in the graph to view its dependencies and details.
              </div>
            ) : (
              <>
                <div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: 'var(--app-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Box size={16} color="var(--app-blue)" /> {selectedNode.data.label}
                  </h3>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ padding: '2px 8px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--app-blue)', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>{selectedNode.data.nodeType}</span>
                  </div>
                  <div style={{ color: 'var(--app-text-muted)', fontSize: '11px', wordBreak: 'break-all', fontFamily: 'monospace' }}>{selectedNode.data.file}</div>
                </div>

                {/* Dependencies */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  <div>
                    <h4 style={{ margin: '0 0 8px 0', color: 'var(--app-text)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Used By (Dependents)</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {getDependents(selectedNode.id).map(e => (
                        <div key={e.id} style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--app-border)', borderRadius: '4px', fontSize: '12px' }}>{e.source}</div>
                      ))}
                      {getDependents(selectedNode.id).length === 0 && <span style={{ color: 'var(--app-text-muted)', fontStyle: 'italic' }}>None</span>}
                    </div>
                  </div>

                  <div>
                    <h4 style={{ margin: '0 0 8px 0', color: 'var(--app-text)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Depends On</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {getDependencies(selectedNode.id).map(e => (
                        <div key={e.id} style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--app-border)', borderRadius: '4px', fontSize: '12px' }}>{e.target}</div>
                      ))}
                      {getDependencies(selectedNode.id).length === 0 && <span style={{ color: 'var(--app-text-muted)', fontStyle: 'italic' }}>None</span>}
                    </div>
                  </div>

                </div>

                {/* Method Details */}
                {selectedNode.data.payloads && selectedNode.data.payloads.length > 0 && (
                  <div>
                    <h4 style={{ margin: '0 0 8px 0', color: 'var(--app-text)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Parameters / DTOs</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontFamily: 'monospace', fontSize: '11px', color: 'var(--app-warning)' }}>
                      {selectedNode.data.payloads.map((p: string, i: number) => (
                        <div key={i} style={{ padding: '4px 8px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '4px' }}>{p}</div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedNode.data.logicSnippet && (
                  <div>
                    <h4 style={{ margin: '0 0 8px 0', color: 'var(--app-text)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Logic Snippet</h4>
                    <pre style={{ 
                      background: 'rgba(0,0,0,0.3)', padding: '12px', border: '1px solid var(--app-border)', borderRadius: '6px',
                      overflowX: 'auto', fontSize: '11px', maxHeight: '200px', color: '#a5b4fc', margin: 0
                    }}>
                      <code>{selectedNode.data.logicSnippet}</code>
                    </pre>
                  </div>
                )}

                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                  <strong style={{ color: 'var(--app-blue)', display: 'block', marginBottom: '4px' }}>Impact Analysis</strong>
                  <span style={{ color: 'var(--app-text-muted)' }}>Modifying this will directly impact <strong>{getDependents(selectedNode.id).length}</strong> downstream component(s).</span>
                </div>

                <button 
                  style={{ marginTop: 'auto', padding: '10px', background: 'var(--app-panel)', border: '1px solid var(--app-border)', color: 'var(--app-text)', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  onClick={handleExportForAI}
                >
                  <Share2 size={16} /> Export Flow for AI
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
