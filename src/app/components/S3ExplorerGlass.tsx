import React from 'react';
import { S3ExplorerProps } from './types';
import { Folder, File, UploadCloud, Trash2, ArrowLeft, Plus, Settings2, Download, HardDrive } from 'lucide-react';

export default function S3ExplorerGlass(props: S3ExplorerProps) {
  const {
    buckets, selectedBucket, objects, loading, uploading, fileInputRef,
    showFolderModal, newFolderName, creatingFolder,
    showBucketModal, newBucketName, creatingBucket,
    changingClassFor, newStorageClass, classLoading,
    currentPrefix, STORAGE_CLASSES, errorMsg, breadcrumbs,
    setSelectedBucket, setCurrentPrefix, setShowBucketModal, setNewBucketName,
    setShowFolderModal, setNewFolderName, setChangingClassFor, setNewStorageClass,
    handleCreateBucket, handleDeleteBucket, handleEmptyBucket, handleFileUpload,
    handleDeleteObject, submitChangeStorageClass, handleCreateFolder
  } = props;

  return (
    <div style={{ flex: 1, display: 'flex', gap: '20px', padding: '24px', overflow: 'hidden' }}>
      
      {/* Buckets Sidebar */}
      <div style={{ 
        width: '320px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '20px',
        background: 'var(--app-window-bg)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--app-border)',
        borderRadius: '24px',
        padding: '24px',
        boxShadow: 'var(--app-shadow)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px', background: 'linear-gradient(135deg, var(--app-blue), #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HardDrive size={20} color="var(--app-blue)" /> Buckets
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--app-text-muted)', margin: 0 }}>Storage Containers</p>
          </div>
          <button onClick={() => setShowBucketModal(true)} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--app-blue)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title="New Bucket">
            <Plus size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflow: 'auto', flex: 1 }}>
          {loading && !selectedBucket && <div style={{ color: 'var(--app-text-muted)', fontSize: '13px', textAlign: 'center', marginTop: '20px' }}>Loading...</div>}
          {buckets.map(b => (
            <div 
              key={b.Name} 
              onClick={() => { setSelectedBucket(b.Name); setCurrentPrefix(''); }}
              style={{ 
                padding: '12px', 
                borderRadius: '12px', 
                background: selectedBucket === b.Name ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.03)', 
                border: `1px solid ${selectedBucket === b.Name ? 'var(--app-blue)' : 'var(--app-border)'}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--app-panel)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Folder size={18} color="var(--app-blue)" />
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--app-text)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{b.Name}</div>
                <div style={{ fontSize: '11px', color: 'var(--app-text-muted)' }}>{new Date(b.CreationDate).toLocaleDateString()}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button onClick={(e) => { e.stopPropagation(); handleEmptyBucket(b.Name, e); }} style={{ background: 'none', border: 'none', color: 'var(--app-warning)', cursor: 'pointer' }} title="Empty Bucket"><Trash2 size={14} /></button>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteBucket(b.Name, e); }} style={{ background: 'none', border: 'none', color: 'var(--app-danger)', cursor: 'pointer' }} title="Delete Bucket"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
          {errorMsg && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '12px', color: 'var(--app-danger)', fontSize: '12px' }}>
              {errorMsg}
            </div>
          )}
        </div>
      </div>

      {/* Explorer Content */}
      <div style={{ 
        flex: 1, 
        background: 'var(--app-window-bg)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--app-border)',
        borderRadius: '24px',
        boxShadow: 'var(--app-shadow)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {!selectedBucket ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--app-text-muted)' }}>
            <Folder size={64} style={{ opacity: 0.1, marginBottom: '16px' }} />
            <p>Select a bucket to view its contents.</p>
          </div>
        ) : (
          <>
            {/* Toolbar Area */}
            <div style={{ padding: '24px', borderBottom: '1px solid var(--app-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
              
              {/* Breadcrumbs */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', background: 'var(--app-panel)', padding: '8px 16px', borderRadius: '12px' }}>
                <button onClick={() => { setSelectedBucket(null); setCurrentPrefix(''); }} style={{ background: 'none', border: 'none', color: 'var(--app-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <ArrowLeft size={16} />
                </button>
                <span style={{ width: '1px', height: '16px', background: 'var(--app-border)', margin: '0 4px' }}></span>
                <span style={{ cursor: 'pointer', color: currentPrefix === '' ? 'var(--app-text)' : 'var(--app-text-muted)', fontWeight: currentPrefix === '' ? '600' : 'normal' }} onClick={() => setCurrentPrefix('')}>
                  {selectedBucket}
                </span>
                {breadcrumbs.map((crumb, idx) => {
                  const path = breadcrumbs.slice(0, idx + 1).join('/') + '/';
                  const isLast = currentPrefix === path;
                  return (
                    <span key={path} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--app-text-muted)' }}>/</span>
                      <span style={{ cursor: 'pointer', color: isLast ? 'var(--app-text)' : 'var(--app-text-muted)', fontWeight: isLast ? '600' : 'normal' }} onClick={() => setCurrentPrefix(path)}>
                        {crumb}
                      </span>
                    </span>
                  );
                })}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setShowFolderModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'rgba(255,255,255,0.05)', color: 'var(--app-text)', borderRadius: '12px', border: '1px solid var(--app-border)', fontWeight: '500', cursor: 'pointer' }}>
                  <Folder size={16} /> New Folder
                </button>
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
                <button onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--app-blue)', color: 'white', borderRadius: '12px', border: 'none', fontWeight: '500', cursor: 'pointer', opacity: uploading ? 0.7 : 1, boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
                  <UploadCloud size={16} /> {uploading ? 'Uploading...' : 'Upload File'}
                </button>
              </div>
            </div>

            {/* Objects Table */}
            <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
              {loading && !uploading ? (
                <div style={{ textAlign: 'center', color: 'var(--app-text-muted)', marginTop: '40px' }}>Loading objects...</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                  <thead style={{ position: 'sticky', top: '-16px', background: 'var(--app-bg)', backdropFilter: 'blur(8px)', zIndex: 10 }}>
                    <tr>
                      <th style={{ padding: '8px 16px', fontSize: '12px', fontWeight: '500', color: 'var(--app-text-muted)', textAlign: 'left', border: 'none' }}>Name</th>
                      <th style={{ padding: '8px 16px', fontSize: '12px', fontWeight: '500', color: 'var(--app-text-muted)', textAlign: 'left', border: 'none' }}>Size</th>
                      <th style={{ padding: '8px 16px', fontSize: '12px', fontWeight: '500', color: 'var(--app-text-muted)', textAlign: 'left', border: 'none' }}>Storage Class</th>
                      <th style={{ padding: '8px 16px', fontSize: '12px', fontWeight: '500', color: 'var(--app-text-muted)', textAlign: 'right', border: 'none' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPrefix !== '' && (
                      <tr onClick={() => {
                        const newPath = breadcrumbs.slice(0, -1).join('/');
                        setCurrentPrefix(newPath ? newPath + '/' : '');
                      }} style={{ background: 'rgba(255, 255, 255, 0.02)', boxShadow: 'inset 0 0 0 1px var(--app-border)', borderRadius: '12px', cursor: 'pointer' }}>
                        <td style={{ padding: '16px', border: 'none', borderRadius: '12px 0 0 12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Folder color="var(--app-blue)" size={20} /> <span style={{ fontWeight: '500' }}>..</span>
                        </td>
                        <td colSpan={3} style={{ border: 'none', borderRadius: '0 12px 12px 0' }}></td>
                      </tr>
                    )}
                    
                    {objects.map(obj => {
                      const currentClass = obj.StorageClass || 'STANDARD';
                      const isFolder = obj.isFolder;
                      const displayName = obj.Key.slice(currentPrefix.length);

                      return (
                        <tr key={obj.Key} onClick={() => isFolder && setCurrentPrefix(obj.Key)} style={{ background: 'rgba(255, 255, 255, 0.02)', boxShadow: 'inset 0 0 0 1px var(--app-border)', borderRadius: '12px', cursor: isFolder ? 'pointer' : 'default' }}>
                          <td style={{ padding: '16px', border: 'none', borderRadius: '12px 0 0 12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {isFolder ? <Folder color="var(--app-blue)" size={20} /> : <File color="var(--app-text-muted)" size={20} />}
                            <span style={{ fontWeight: '500' }}>{displayName}</span>
                          </td>
                          <td style={{ padding: '16px', border: 'none', color: 'var(--app-text-muted)', fontSize: '13px' }}>
                            {isFolder ? '-' : `${(obj.Size / 1024).toFixed(2)} KB`}
                          </td>
                          <td style={{ padding: '16px', border: 'none' }}>
                            {!isFolder && (
                              <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '6px', color: 'var(--app-text-muted)' }}>
                                {currentClass}
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '16px', border: 'none', textAlign: 'right', borderRadius: '0 12px 12px 0' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              {!isFolder && (
                                <>
                                  <button onClick={(e) => { e.stopPropagation(); setChangingClassFor({ key: obj.Key, current: currentClass }); setNewStorageClass(currentClass); }} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--app-text)', cursor: 'pointer', padding: '6px', borderRadius: '6px' }} title="Change Storage Class">
                                    <Settings2 size={16} />
                                  </button>
                                  <a href={obj.url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--app-text)', padding: '6px', borderRadius: '6px', display: 'inline-block' }} title="Download">
                                    <Download size={16} />
                                  </a>
                                </>
                              )}
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteObject(obj.Key); }} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: 'var(--app-danger)', cursor: 'pointer', padding: '6px', borderRadius: '6px' }} title="Delete">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {objects.length === 0 && (
                      <tr><td colSpan={4} style={{ padding: '48px', textAlign: 'center', color: 'var(--app-text-muted)' }}>Folder is empty.</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {(showBucketModal || showFolderModal || changingClassFor) && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ width: '400px', background: 'var(--app-window-bg)', border: '1px solid var(--app-border)', borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--app-shadow)', padding: '24px' }}>
            
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 'bold', background: 'linear-gradient(135deg, var(--app-blue), #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {showBucketModal ? 'New Bucket' : showFolderModal ? 'New Folder' : 'Modify Storage Class'}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              {showBucketModal && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--app-text-muted)', marginBottom: '8px' }}>Bucket Name</label>
                  <input type="text" style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--app-border)', color: 'var(--app-text)', borderRadius: '12px', outline: 'none' }} value={newBucketName} onChange={e => setNewBucketName(e.target.value)} autoFocus />
                </div>
              )}
              {showFolderModal && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--app-text-muted)', marginBottom: '8px' }}>Folder Name</label>
                  <input type="text" style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--app-border)', color: 'var(--app-text)', borderRadius: '12px', outline: 'none' }} value={newFolderName} onChange={e => setNewFolderName(e.target.value)} autoFocus />
                </div>
              )}
              {changingClassFor && (
                <>
                  <div style={{ fontSize: '13px', color: 'var(--app-text-muted)' }}>Target: <span style={{ color: 'var(--app-text)', fontWeight: '500' }}>{changingClassFor.key}</span></div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--app-text-muted)', marginBottom: '8px' }}>Storage Class</label>
                    <select style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--app-border)', color: 'var(--app-text)', borderRadius: '12px', outline: 'none' }} value={newStorageClass} onChange={e => setNewStorageClass(e.target.value)}>
                      {STORAGE_CLASSES.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                    </select>
                  </div>
                </>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => { setShowBucketModal(false); setShowFolderModal(false); setChangingClassFor(null); }} 
                style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--app-text)', cursor: 'pointer', fontWeight: '500', borderRadius: '12px' }}
              >
                Cancel
              </button>
              <button 
                onClick={showBucketModal ? handleCreateBucket : showFolderModal ? handleCreateFolder : submitChangeStorageClass}
                disabled={creatingBucket || creatingFolder || classLoading || (showBucketModal && !newBucketName) || (showFolderModal && !newFolderName) || (changingClassFor && newStorageClass === changingClassFor.current)}
                style={{ padding: '10px 20px', background: 'var(--app-blue)', color: 'white', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '500', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}
              >
                Confirm
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
