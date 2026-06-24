import React from 'react';
import { KnowledgeGraphProps } from './types';
import { ReactFlow, MiniMap, Controls, Background } from '@xyflow/react';
import { Folder, Search, Crosshair, Cpu, Eye, Box, Database, HardDrive, Layout, ChevronUp, Check, Play, TerminalSquare, Share2 } from 'lucide-react';

export default function KnowledgeGlass(props: KnowledgeGraphProps) {
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '20px', padding: '24px' }}>
      
      {/* Folder Browser Modal */}
      {showBrowser && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            width: '500px', height: '500px', background: 'var(--app-window-bg)', border: '1px solid var(--app-border)',
            borderRadius: '24px', boxShadow: 'var(--app-shadow)', display: 'flex', flexDirection: 'column', overflow: 'hidden'
          }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--app-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '16px' }}><Folder size={20} color="var(--app-blue)" /> Select Repository</div>
              <button onClick={() => setShowBrowser(false)} style={{ background: 'transparent', border: 'none', color: 'var(--app-text-muted)', cursor: 'pointer', padding: '4px' }}>✕</button>
            </div>
            
            <div style={{ padding: '16px', display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid var(--app-border)' }}>
              <button onClick={handleGoUp} disabled={browserPath === '/'} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--app-border)', color: 'var(--app-text)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', transition: 'background 0.2s' }}><ChevronUp size={16} /> Up</button>
              <input type="text" value={browserPath} readOnly style={{ flex: 1, padding: '10px 16px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--app-border)', color: 'var(--app-text)', borderRadius: '12px', fontSize: '14px' }} />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {browserLoading ? (
                <div style={{ textAlign: 'center', color: 'var(--app-text-muted)', marginTop: '20px' }}>Loading...</div>
              ) : browserDirectories.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--app-text-muted)', marginTop: '20px' }}>No subfolders</div>
              ) : (
                browserDirectories.map(dir => (
                  <div 
                    key={dir} 
                    onClick={() => handleDirClick(dir)}
                    style={{ cursor: 'pointer', padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s', border: '1px solid transparent' }}
                    onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'; e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                  >
                    <Folder size={18} color="var(--app-blue)" /> <span style={{ fontSize: '14px' }}>{dir}</span>
                  </div>
                ))
              )}
            </div>

            <div style={{ padding: '20px', borderTop: '1px solid var(--app-border)', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'rgba(255,255,255,0.02)' }}>
              <button onClick={() => setShowBrowser(false)} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--app-text)', borderRadius: '12px', cursor: 'pointer', fontWeight: '500' }}>Cancel</button>
              <button onClick={handleSelectFolder} style={{ padding: '10px 24px', background: 'var(--app-blue)', border: 'none', color: 'white', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}><Check size={16} /> Select</button>
            </div>
          </div>
        </div>
      )}

      {/* Top Toolbar */}
      <div style={{ padding: '20px', background: 'var(--app-window-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--app-border)', borderRadius: '24px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap', boxShadow: 'var(--app-shadow)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '350px' }}>
          <div style={{ padding: '8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px' }}><Folder size={18} color="var(--app-blue)" /></div>
          <input 
            type="text" 
            value={repoPath} 
            onChange={(e) => setRepoPath(e.target.value)}
            style={{ flex: 1, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--app-border)', color: 'var(--app-text)', borderRadius: '12px', outline: 'none', fontSize: '14px', transition: 'border-color 0.2s' }}
          />
          <button onClick={handleOpenBrowser} style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--app-border)', color: 'var(--app-text)', borderRadius: '12px', cursor: 'pointer', fontWeight: '500', transition: 'background 0.2s' }}>
            Browse
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <select 
              value={scanMode} 
              onChange={(e) => setScanMode(e.target.value as any)}
              style={{ padding: '12px 32px 12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--app-border)', color: 'var(--app-text)', borderRadius: '12px', outline: 'none', fontSize: '14px', appearance: 'none', transition: 'border-color 0.2s' }}
            >
              <option value="macro">Macro View (Apps & Libs)</option>
              <option value="micro">Micro View (Deep Scan)</option>
            </select>
            <div style={{ position: 'absolute', right: '12px', top: '14px', pointerEvents: 'none', color: 'var(--app-text-muted)' }}>▼</div>
          </div>
          <button onClick={() => handleScan()} disabled={loading} style={{ padding: '12px 24px', background: 'linear-gradient(135deg, var(--app-blue), #6366f1)', border: 'none', color: 'white', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500', opacity: loading ? 0.7 : 1, boxShadow: loading ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.3)', transition: 'all 0.2s' }}>
            <Cpu size={18} /> {loading ? 'Scanning...' : 'Scan'}
          </button>
        </div>

        <div style={{ width: '1px', height: '32px', background: 'var(--app-border)' }}></div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--app-text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            <input 
              type="text" 
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '220px', padding: '12px 16px 12px 36px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--app-border)', color: 'var(--app-text)', borderRadius: '12px', outline: 'none', fontSize: '14px', transition: 'border-color 0.2s' }}
            />
          </div>
          <button type="submit" style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--app-border)', color: 'var(--app-text)', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500', transition: 'background 0.2s' }}>
            <Crosshair size={16} /> Focus
          </button>
        </form>

        {error && <span style={{ color: 'var(--app-danger)', fontSize: '14px', padding: '8px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px' }}>{error}</span>}
      </div>

      {/* Main Workspace */}
      <div style={{ display: 'flex', flex: 1, gap: '20px', minHeight: 0 }}>
        
        {/* API Endpoints Sidebar */}
        {scanMode === 'micro' && (
          <div style={{ width: '340px', display: 'flex', flexDirection: 'column', background: 'var(--app-window-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--app-border)', borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--app-shadow)' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--app-border)', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ padding: '8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px' }}><TerminalSquare size={18} color="var(--app-blue)" /></div>
              <span style={{ fontWeight: '600', fontSize: '15px' }}>API Endpoints</span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
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
                      fontSize: '13px', padding: '12px 16px', cursor: 'pointer', 
                      borderRadius: '12px', display: 'flex', gap: '16px', alignItems: 'center',
                      transition: 'all 0.2s', border: '1px solid transparent'
                    }}
                    onClick={() => focusNode(node)}
                    onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                  >
                    <span style={{ fontWeight: 'bold', color: methodColor, width: '45px' }}>{method}</span>
                    <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Monaco, monospace', color: 'var(--app-text)', wordBreak: 'break-all' }}>{path}</span>
                  </div>
                );
              })}
              {nodes.length > 0 && nodes.filter(n => n.data.nodeType === 'Endpoint').length === 0 && (
                <div style={{ color: 'var(--app-text-muted)', fontSize: '14px', padding: '24px', textAlign: 'center' }}>No API endpoints found.</div>
              )}
            </div>
          </div>
        )}

        {/* Graph Canvas */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--app-window-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--app-border)', borderRadius: '24px', overflow: 'hidden', position: 'relative', boxShadow: 'var(--app-shadow)' }}>
          <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.4)', padding: '8px 16px', borderRadius: '16px', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '13px', color: 'rgba(255,255,255,0.9)', fontWeight: '500', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
            <Eye size={16} /> Graph Explorer
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
            <Controls style={{ background: 'var(--app-panel)', border: '1px solid var(--app-border)', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--app-shadow)' }} />
            <MiniMap style={{ background: 'var(--app-panel)', border: '1px solid var(--app-border)', borderRadius: '12px', boxShadow: 'var(--app-shadow)' }} maskColor="rgba(0,0,0,0.4)" nodeColor="var(--app-blue)" />
            <Background gap={20} size={1} color="rgba(255,255,255,0.05)" />
          </ReactFlow>
        </div>

        {/* Right Panel - Node Details */}
        <div style={{ width: '360px', display: 'flex', flexDirection: 'column', background: 'var(--app-window-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--app-border)', borderRadius: '24px', overflowY: 'auto', boxShadow: 'var(--app-shadow)' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--app-border)', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ padding: '8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px' }}><Layout size={18} color="var(--app-blue)" /></div>
            <span style={{ fontWeight: '600', fontSize: '15px' }}>Node Details</span>
          </div>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {!selectedNode ? (
              <div style={{ color: 'var(--app-text-muted)', textAlign: 'center', marginTop: '60px', fontSize: '14px', lineHeight: '1.6' }}>
                <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', border: '1px solid var(--app-border)' }}>
                  <Box size={40} style={{ opacity: 0.3 }} color="var(--app-blue)" />
                </div>
                Select a node in the graph to view its dependencies and internal details.
              </div>
            ) : (
              <>
                <div>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: 'var(--app-text)', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}>
                    <Box size={20} color="var(--app-blue)" /> {selectedNode.data.label}
                  </h3>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ padding: '4px 12px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', borderRadius: '16px', fontSize: '12px', fontWeight: '600', border: '1px solid rgba(59, 130, 246, 0.3)' }}>{selectedNode.data.nodeType}</span>
                  </div>
                  <div style={{ color: 'var(--app-text-muted)', fontSize: '12px', wordBreak: 'break-all', fontFamily: 'ui-monospace, SFMono-Regular, Monaco, monospace', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--app-border)' }}>{selectedNode.data.file}</div>
                </div>

                {/* Dependencies */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  <div>
                    <h4 style={{ margin: '0 0 12px 0', color: 'var(--app-text)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Used By (Dependents)</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {getDependents(selectedNode.id).map(e => (
                        <div key={e.id} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--app-border)', borderRadius: '8px', fontSize: '13px' }}>{e.source}</div>
                      ))}
                      {getDependents(selectedNode.id).length === 0 && <span style={{ color: 'var(--app-text-muted)', fontStyle: 'italic', fontSize: '13px' }}>None</span>}
                    </div>
                  </div>

                  <div>
                    <h4 style={{ margin: '0 0 12px 0', color: 'var(--app-text)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Depends On</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {getDependencies(selectedNode.id).map(e => (
                        <div key={e.id} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--app-border)', borderRadius: '8px', fontSize: '13px' }}>{e.target}</div>
                      ))}
                      {getDependencies(selectedNode.id).length === 0 && <span style={{ color: 'var(--app-text-muted)', fontStyle: 'italic', fontSize: '13px' }}>None</span>}
                    </div>
                  </div>

                </div>

                {/* Method Details */}
                {selectedNode.data.payloads && selectedNode.data.payloads.length > 0 && (
                  <div>
                    <h4 style={{ margin: '0 0 12px 0', color: 'var(--app-text)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Parameters / DTOs</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'ui-monospace, SFMono-Regular, Monaco, monospace', fontSize: '12px', color: '#f59e0b' }}>
                      {selectedNode.data.payloads.map((p: string, i: number) => (
                        <div key={i} style={{ padding: '8px 12px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>{p}</div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedNode.data.logicSnippet && (
                  <div>
                    <h4 style={{ margin: '0 0 12px 0', color: 'var(--app-text)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Logic Snippet</h4>
                    <pre style={{ 
                      background: 'rgba(0,0,0,0.3)', padding: '16px', border: '1px solid var(--app-border)', borderRadius: '12px',
                      overflowX: 'auto', fontSize: '12px', maxHeight: '250px', color: '#a5b4fc', margin: 0, fontFamily: 'ui-monospace, SFMono-Regular, Monaco, monospace', lineHeight: '1.6'
                    }}>
                      <code>{selectedNode.data.logicSnippet}</code>
                    </pre>
                  </div>
                )}

                <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                  <strong style={{ color: 'var(--app-blue)', display: 'block', marginBottom: '8px', fontSize: '14px' }}>💡 Impact Analysis</strong>
                  <span style={{ color: 'var(--app-text-muted)', fontSize: '13px', lineHeight: '1.5' }}>Modifying this will directly impact <strong style={{ color: 'var(--app-text)' }}>{getDependents(selectedNode.id).length}</strong> downstream component(s).</span>
                </div>

                <button 
                  style={{ marginTop: 'auto', padding: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--app-border)', color: 'var(--app-text)', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
                  onClick={handleExportForAI}
                  onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                >
                  <Share2 size={18} /> Export Flow for AI
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
