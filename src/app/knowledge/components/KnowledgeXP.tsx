import React from 'react';
import { KnowledgeGraphProps } from './types';
import { ReactFlow, MiniMap, Controls, Background } from '@xyflow/react';

export default function KnowledgeXP(props: KnowledgeGraphProps) {
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px', position: 'relative' }}>
      
      {/* Folder Browser Modal */}
      {showBrowser && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '500px', height: '400px', background: 'var(--xp-bg)', border: '2px solid #0058e6',
          boxShadow: '4px 4px 10px rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ background: 'linear-gradient(to right, var(--app-blue-dark), #0058e6)', color: 'var(--app-window-bg)', padding: '4px 8px', fontWeight: 'bold', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Browse for Folder</span>
            <button onClick={() => setShowBrowser(false)} style={{ background: '#d83b01', color: 'var(--app-window-bg)', border: '1px solid var(--app-window-bg)', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
          </div>
          <div style={{ padding: '8px', display: 'flex', gap: '8px', background: 'var(--app-bg)', borderBottom: '1px solid var(--app-border)' }}>
            <button className="btn" onClick={handleGoUp} disabled={browserPath === '/'}>⬆️ Up</button>
            <input type="text" value={browserPath} readOnly style={{ flex: 1, padding: '2px 4px' }} />
          </div>
          <div style={{ flex: 1, background: 'var(--app-window-bg)', overflowY: 'auto', padding: '8px' }}>
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
          <div style={{ padding: '8px', background: 'var(--app-bg)', borderTop: '1px solid var(--app-border)', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
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
          style={{ width: '400px', padding: '4px', border: '1px solid var(--app-border)' }}
        />
        <button className="btn" onClick={handleOpenBrowser}>
          📂 Browse...
        </button>
        <select 
          value={scanMode} 
          onChange={(e) => setScanMode(e.target.value as any)}
          style={{ padding: '4px', border: '1px solid var(--app-border)' }}
        >
          <option value="macro">🌊 Macro View (Apps & Libs)</option>
          <option value="micro">🔬 Micro View (Deep AST Scan)</option>
        </select>
        <button className="btn" onClick={() => handleScan()} disabled={loading}>
          {loading ? 'Scanning...' : '🔍 Scan Code'}
        </button>

        <div style={{ width: '1px', height: '24px', background: 'var(--app-border)', margin: '0 8px' }}></div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold' }}>Search:</span>
          <input 
            type="text" 
            placeholder="e.g. GET /time-off or ServiceName"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '200px', padding: '4px', border: '1px solid var(--app-border)' }}
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
            <div style={{ background: 'linear-gradient(to right, var(--app-blue-dark), #0058e6)', color: 'white', padding: '4px 8px', fontSize: '11px', fontWeight: 'bold' }}>
              🔌 API Endpoints
            </div>
            <div style={{ flex: 1, background: 'var(--app-window-bg)', overflowY: 'auto', padding: '4px' }}>
              {nodes.filter(n => n.data.nodeType === 'Endpoint').map(node => {
                const label = node.data.label;
                const method = label.split(' ')[0];
                const path = label.split(' ').slice(1).join(' ');
                let methodColor = 'var(--app-text)';
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
                      borderBottom: '1px solid var(--app-panel)', display: 'flex', gap: '8px', alignItems: 'center'
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
          <div style={{ background: 'var(--app-blue-dark)', color: 'white', padding: '2px 6px', fontSize: '11px', fontWeight: 'bold' }}>
            Knowledge Graph Explorer (ReactFlow)
          </div>
          <div style={{ flex: 1, background: 'var(--app-window-bg)' }}>
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
          <div style={{ background: 'var(--app-blue-dark)', color: 'white', padding: '2px 6px', fontSize: '11px', fontWeight: 'bold' }}>
            Node Details
          </div>
          <div style={{ padding: '8px', fontSize: '11px', background: 'var(--app-window-bg)', flex: 1 }}>
            {!selectedNode ? (
              <div style={{ color: '#666', fontStyle: 'italic' }}>Select a node in the graph to view details.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', color: 'var(--app-blue-dark)' }}>{selectedNode.data.label}</h3>
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
                      background: 'var(--app-panel)', padding: '8px', border: '1px solid var(--app-border)', 
                      overflowX: 'auto', fontSize: '10px', maxHeight: '150px' 
                    }}>
                      <code>{selectedNode.data.logicSnippet}</code>
                    </pre>
                  </div>
                )}

                <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '8px', border: '1px solid var(--app-text)', marginTop: '12px' }}>
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
