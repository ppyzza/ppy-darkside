
import React from 'react';
import { TerragruntProps } from './types';

export default function TerragruntDarkside(props: TerragruntProps) {
  const {
    currentPath, setCurrentPath, directories, files, fsError, loadingFs,
    selectedFiles, scanning, scanError, environments, allKeys, sidebarOpen,
    setSidebarOpen, edits, commitMessage, setCommitMessage, committing,
    commitError, loadDirectory, navigateUp, navigateInto, addFile, removeFile,
    handleCompare, handleEditChange, handleCommit
  } = props;

  const pendingEditsCount = Object.keys(edits).length;

  return (
    <div className="app-window" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--app-border)' }} style={{ height: '100%', maxWidth: '1600px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
      <div className="app-titlebar" style={{ background: 'var(--app-panel)', color: 'var(--app-text)', padding: '16px', fontSize: '14px', borderBottom: '1px solid var(--app-border)' }}>
        <span>Terragrunt File Browser & Compare 🌍</span>
        <div className="app-titlebar-buttons">
          <div className="app-titlebar-btn">X</div>
        </div>
      </div>

      <div className="app-content" style={{ display: 'flex', flex: 1, padding: 0, overflow: 'hidden', position: 'relative' }}>
        
        {/* Left Panel: File Browser */}
        {sidebarOpen && (
          <div style={{ width: '400px', display: 'flex', flexDirection: 'column', borderRight: '2px solid var(--app-border)', background: 'var(--app-window-bg)' }}>
            <div style={{ background: 'var(--app-blue-dark)', color: 'white', padding: '4px 8px', fontSize: '11px', fontWeight: 'bold' }}>
              Local File Explorer
            </div>
            <div style={{ padding: '8px', background: 'var(--app-bg)', borderBottom: '1px solid var(--app-border)', display: 'flex', gap: '4px', alignItems: 'center' }}>
              <button onClick={navigateUp} style={{ padding: '2px 8px', fontSize: '11px' }}>⬆️ Up</button>
              <input 
                type="text" 
                value={currentPath} 
                onChange={e => setCurrentPath(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loadDirectory(currentPath)}
                style={{ flex: 1, fontSize: '11px', padding: '2px 4px' }} 
              />
              <button onClick={() => loadDirectory(currentPath)} style={{ padding: '2px 8px', fontSize: '11px' }}>Go</button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px', fontSize: '12px' }}>
              {loadingFs ? <div>Loading...</div> : fsError ? <div style={{ color: 'red' }}>Error: {fsError}</div> : (
                <div>
                  {directories.map(dir => (
                    <div 
                      key={dir} 
                      onClick={() => navigateInto(dir)}
                      style={{ cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      📁 {dir}
                    </div>
                  ))}
                  {files.map(file => (
                    <div 
                      key={file}
                      style={{ padding: '4px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        📄 {file}
                      </div>
                      <button onClick={() => addFile(file)} style={{ fontSize: '10px', padding: '2px 6px', cursor: 'pointer' }}>+ Add</button>
                    </div>
                  ))}
                  {directories.length === 0 && files.length === 0 && <div style={{ color: '#888' }}>Folder is empty.</div>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right Panel: Cart & Compare */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--app-bg)', minWidth: 0 }}>
          
          <div style={{ padding: '16px', borderBottom: '2px solid var(--app-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ marginTop: 0, fontSize: '14px' }}>Comparison Cart 🛒</h3>
              <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ fontSize: '11px', padding: '2px 8px', cursor: 'pointer' }}>
                {sidebarOpen ? '◀ Hide Sidebar' : '▶ Show Sidebar'}
              </button>
            </div>
            {selectedFiles.length === 0 ? (
              <div style={{ fontSize: '11px', color: '#666' }}>Browse folders on the left and click "+ Add" to select terragrunt.hcl files.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '150px', overflowY: 'auto', background: 'var(--app-window-bg)', border: '1px solid var(--app-border)', borderRadius: '8px', padding: '8px' }}>
                {selectedFiles.map(sf => (
                  <div key={sf} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', background: 'var(--app-panel)', padding: '4px' }}>
                    <span>{sf}</span>
                    <button onClick={() => removeFile(sf)} style={{ color: 'red', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
                  </div>
                ))}
              </div>
            )}
            
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button className="btn btn-primary" style={{ borderRadius: '6px', padding: '8px 16px', background: 'var(--app-blue)' }} onClick={handleCompare} disabled={scanning || selectedFiles.length < 2}>
                {scanning ? 'Comparing...' : 'Compare Selected Files ⚖️'}
              </button>
              {scanError && <div style={{ color: 'red', fontSize: '11px', fontWeight: 'bold' }}>{scanError}</div>}
            </div>
          </div>

          {/* Results Grid */}
          <div style={{ flex: 1, overflow: 'auto', padding: '16px', background: 'var(--app-window-bg)', paddingBottom: pendingEditsCount > 0 ? '100px' : '16px' }}>
            {!environments ? (
              <div style={{ textAlign: 'center', color: '#888', marginTop: '40px', fontSize: '12px' }}>
                Select files and click Compare to view the config differences.
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '16px', fontSize: '12px' }}>
                  Comparing <b>{Object.keys(environments).length}</b> environments. <br/>
                  Total unique config keys: <b>{allKeys.length}</b>
                </div>

                <table className="no-hover" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: 'monospace' }}>
                  <thead>
                    <tr style={{ background: 'var(--app-blue-dark)', color: 'white' }}>
                      <th style={{ padding: '8px', textAlign: 'left', border: '1px solid var(--app-border)', borderRadius: '8px' }}>Variable Key</th>
                      {Object.keys(environments).sort().map(env => (
                        <th key={env} style={{ padding: '8px', textAlign: 'center', border: '1px solid var(--app-border)', borderRadius: '8px', textTransform: 'uppercase' }}>
                          {env}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allKeys.map(key => {
                      const valuesList = Object.keys(environments).map(env => {
                        const envData = environments[env];
                        return envData.service_environment[key] ?? envData.service_secrets[key] ?? envData.specs[key];
                      }).filter(v => v !== undefined);
                      
                      const uniqueValues = new Set(valuesList);
                      const isDiff = uniqueValues.size > 1;

                      return (
                        <tr key={key} style={{ borderBottom: '1px solid var(--app-border)' }}>
                          <td style={{ padding: '6px 8px', border: '1px solid var(--app-border)', borderRadius: '8px', fontWeight: 'bold', background: '#F9F9F9' }}>
                            {key}
                          </td>
                          {Object.keys(environments).sort().map(env => {
                            const envData = environments[env];
                            const envVal = envData.service_environment[key];
                            const secVal = envData.service_secrets[key];
                            const specVal = envData.specs[key];

                            const exists = envVal !== undefined || secVal !== undefined || specVal !== undefined;
                            const originalVal = envVal ?? secVal ?? specVal;
                            
                            let typeStr = '';
                            if (envVal !== undefined) typeStr = 'Env';
                            if (secVal !== undefined) typeStr = 'Secret';
                            if (specVal !== undefined) typeStr = 'Spec';

                            const editKey = `${envData.path}::${key}`;
                            const isPending = !!edits[editKey];
                            const currentVal = isPending ? edits[editKey].newValue : originalVal;

                            const bg = !exists ? '#FFEBEB' : (isPending ? '#DDEEFE' : (isDiff ? 'var(--app-window-bg)4CC' : 'rgba(16, 185, 129, 0.1)'));

                            return (
                              <td key={env} style={{ padding: '4px 8px', border: '1px solid var(--app-border)', borderRadius: '8px', textAlign: 'center', background: bg, maxWidth: '250px' }}>
                                {exists ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ fontSize: '9px', color: '#888' }}>[{typeStr}]</span>
                                    <input 
                                      value={currentVal}
                                      onChange={e => handleEditChange(envData.path, key, originalVal, e.target.value, typeStr)}
                                      style={{
                                        width: '100%',
                                        background: isPending ? 'var(--app-window-bg)' : 'transparent',
                                        border: isPending ? '1px solid #0058e6' : '1px dashed transparent',
                                        color: isPending ? 'var(--app-text)' : (isDiff ? '#B8860B' : 'green'),
                                        fontFamily: 'monospace',
                                        fontSize: '11px',
                                        padding: '2px',
                                        textAlign: 'center'
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <span style={{ color: 'red', fontWeight: 'bold' }}>❌ Missing</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Commit Bar */}
          {pendingEditsCount > 0 && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--app-bg)', borderTop: '2px solid var(--app-border)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 -2px 10px rgba(0,0,0,0.1)' }}>
              <div style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--app-blue-dark)' }}>
                ✍️ {pendingEditsCount} Pending Changes
              </div>
              <input 
                type="text" 
                placeholder="Enter commit message (e.g. fix: update min_desired_count in UAT)" 
                value={commitMessage}
                onChange={e => setCommitMessage(e.target.value)}
                style={{ flex: 1, padding: '6px', fontSize: '12px' }}
              />
              <button className="btn btn-primary" style={{ borderRadius: '6px', padding: '8px 16px', background: 'var(--app-blue)' }} onClick={handleCommit} disabled={committing}>
                {committing ? 'Committing...' : '💾 Save & Commit Changes'}
              </button>
              {commitError && <div style={{ color: 'red', fontSize: '11px', fontWeight: 'bold' }}>{commitError}</div>}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
