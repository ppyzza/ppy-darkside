import React from 'react';
import { S3ExplorerProps } from './types';
import { Folder, File, UploadCloud, Trash2, ShieldAlert, ArrowLeft, Plus, Settings2, Download } from 'lucide-react';

export default function S3ExplorerDarkside(props: S3ExplorerProps) {
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
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', gap: '20px', overflow: 'hidden', background: 'var(--app-bg)' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--app-text)', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Folder size={28} color="var(--app-blue)" />
            {selectedBucket ? `Bucket: ${selectedBucket}` : 'S3 Explorer'}
          </h1>
          <p style={{ color: 'var(--app-text-muted)', marginTop: '8px' }}>
            {selectedBucket ? 'Manage your objects and folders below.' : 'Select a bucket or create a new one to begin.'}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          {!selectedBucket ? (
            <button onClick={() => setShowBucketModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--app-blue)', color: 'white', borderRadius: '8px', border: 'none', fontWeight: '500', cursor: 'pointer' }}>
              <Plus size={16} /> New Bucket
            </button>
          ) : (
            <>
              <button onClick={() => { setSelectedBucket(null); setCurrentPrefix(''); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--app-window-bg)', border: '1px solid var(--app-border)', color: 'var(--app-text)', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}>
                <ArrowLeft size={16} /> Back
              </button>
              <button onClick={() => setShowFolderModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--app-window-bg)', border: '1px solid var(--app-border)', color: 'var(--app-text)', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}>
                <Folder size={16} color="var(--app-warning)" /> New Folder
              </button>
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--app-blue)', color: 'white', borderRadius: '8px', border: 'none', fontWeight: '500', cursor: 'pointer', opacity: uploading ? 0.7 : 1 }}>
                <UploadCloud size={16} /> {uploading ? 'Uploading...' : 'Upload'}
              </button>
              <button onClick={() => handleEmptyBucket(selectedBucket)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--app-danger)', borderRadius: '8px', border: '1px solid var(--app-danger)', fontWeight: '500', cursor: 'pointer' }}>
                <ShieldAlert size={16} /> Empty
              </button>
            </>
          )}
        </div>
      </div>

      {errorMsg && (
        <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--app-danger)', borderRadius: '8px', color: 'var(--app-danger)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldAlert size={20} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Path Breadcrumbs */}
      {selectedBucket && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--app-panel)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--app-border)' }}>
          <span style={{ cursor: 'pointer', color: currentPrefix === '' ? 'var(--app-text)' : 'var(--app-blue)' }} onClick={() => setCurrentPrefix('')}>
            {selectedBucket}
          </span>
          {breadcrumbs.map((crumb, idx) => {
            const path = breadcrumbs.slice(0, idx + 1).join('/') + '/';
            const isLast = currentPrefix === path;
            return (
              <span key={path} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--app-text-muted)' }}>/</span>
                <span style={{ cursor: 'pointer', color: isLast ? 'var(--app-text)' : 'var(--app-blue)' }} onClick={() => setCurrentPrefix(path)}>
                  {crumb}
                </span>
              </span>
            );
          })}
        </div>
      )}

      {/* Main Table */}
      <div style={{ flex: 1, background: 'var(--app-window-bg)', border: '1px solid var(--app-border)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ overflow: 'auto', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead style={{ position: 'sticky', top: 0, background: 'var(--app-panel)', zIndex: 1, boxShadow: '0 1px 0 var(--app-border)' }}>
              <tr>
                <th style={{ padding: '16px', width: '48px', borderBottom: 'none' }}></th>
                <th style={{ padding: '16px', fontWeight: '600', color: 'var(--app-text-muted)', borderBottom: 'none' }}>Name</th>
                {!selectedBucket && <th style={{ padding: '16px', fontWeight: '600', color: 'var(--app-text-muted)', borderBottom: 'none' }}>Created</th>}
                {selectedBucket && (
                  <>
                    <th style={{ padding: '16px', fontWeight: '600', color: 'var(--app-text-muted)', borderBottom: 'none' }}>Size</th>
                    <th style={{ padding: '16px', fontWeight: '600', color: 'var(--app-text-muted)', borderBottom: 'none' }}>Class</th>
                  </>
                )}
                <th style={{ padding: '16px', fontWeight: '600', color: 'var(--app-text-muted)', borderBottom: 'none', width: '120px' }}></th>
              </tr>
            </thead>
            <tbody>
              {loading && !uploading && (
                <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--app-text-muted)' }}>Loading...</td></tr>
              )}
              
              {!loading && !selectedBucket && buckets.map(b => (
                <tr key={b.Name} style={{ borderBottom: '1px solid var(--app-border)', transition: 'background 0.2s', cursor: 'pointer' }} onClick={() => { setSelectedBucket(b.Name); setCurrentPrefix(''); }}>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}><Folder color="var(--app-blue)" size={20} /></td>
                  <td style={{ padding: '12px 16px', color: 'var(--app-text)', fontWeight: '500' }}>{b.Name}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--app-text-muted)' }}>{new Date(b.CreationDate).toLocaleString()}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteBucket(b.Name, e); }} style={{ background: 'transparent', border: 'none', color: 'var(--app-text-muted)', cursor: 'pointer', padding: '4px' }} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && selectedBucket && currentPrefix !== '' && (
                <tr onClick={() => {
                  const newPath = breadcrumbs.slice(0, -1).join('/');
                  setCurrentPrefix(newPath ? newPath + '/' : '');
                }} style={{ borderBottom: '1px solid var(--app-border)', cursor: 'pointer' }}>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}><Folder color="var(--app-warning)" size={20} /></td>
                  <td colSpan={4} style={{ padding: '12px 16px', color: 'var(--app-text-muted)' }}>...</td>
                </tr>
              )}

              {!loading && selectedBucket && objects.map(obj => {
                const currentClass = obj.StorageClass || 'STANDARD';
                const isFolder = obj.isFolder;
                const displayName = obj.Key.slice(currentPrefix.length);

                return (
                  <tr key={obj.Key} onClick={() => isFolder && setCurrentPrefix(obj.Key)} style={{ borderBottom: '1px solid var(--app-border)', cursor: isFolder ? 'pointer' : 'default' }}>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      {isFolder ? <Folder color="var(--app-warning)" size={20} /> : <File color="var(--app-text-muted)" size={20} />}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--app-text)' }}>{displayName}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--app-text-muted)' }}>{isFolder ? '-' : `${(obj.Size / 1024).toFixed(2)} KB`}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {!isFolder && (
                        <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--app-border)', padding: '2px 8px', borderRadius: '4px', color: 'var(--app-text-muted)' }}>
                          {currentClass}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {!isFolder && (
                          <>
                            <button onClick={(e) => { e.stopPropagation(); setChangingClassFor({ key: obj.Key, current: currentClass }); setNewStorageClass(currentClass); }} style={{ background: 'transparent', border: 'none', color: 'var(--app-text-muted)', cursor: 'pointer', padding: '4px' }} title="Change Storage Class">
                              <Settings2 size={16} />
                            </button>
                            <a href={obj.url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ color: 'var(--app-text-muted)', padding: '4px' }} title="Download">
                              <Download size={16} />
                            </a>
                          </>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteObject(obj.Key); }} style={{ background: 'transparent', border: 'none', color: 'var(--app-text-muted)', cursor: 'pointer', padding: '4px' }} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && selectedBucket && objects.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: 'var(--app-text-muted)' }}>No objects found in this path.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {(showBucketModal || showFolderModal || changingClassFor) && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ width: '400px', background: 'var(--app-window-bg)', border: '1px solid var(--app-border)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
            
            <div style={{ padding: '20px', borderBottom: '1px solid var(--app-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                {showBucketModal ? 'Create New Bucket' : showFolderModal ? 'Create New Folder' : 'Change Storage Class'}
              </h3>
            </div>
            
            <div style={{ padding: '20px' }}>
              {showBucketModal && (
                <>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--app-text-muted)', marginBottom: '8px' }}>Bucket Name</label>
                  <input type="text" style={{ width: '100%', padding: '10px 12px', background: 'var(--app-bg)', border: '1px solid var(--app-border)', color: 'var(--app-text)', borderRadius: '6px', outline: 'none' }} value={newBucketName} onChange={e => setNewBucketName(e.target.value)} autoFocus />
                </>
              )}
              {showFolderModal && (
                <>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--app-text-muted)', marginBottom: '8px' }}>Folder Name</label>
                  <input type="text" style={{ width: '100%', padding: '10px 12px', background: 'var(--app-bg)', border: '1px solid var(--app-border)', color: 'var(--app-text)', borderRadius: '6px', outline: 'none' }} value={newFolderName} onChange={e => setNewFolderName(e.target.value)} autoFocus />
                </>
              )}
              {changingClassFor && (
                <>
                  <div style={{ fontSize: '13px', color: 'var(--app-text-muted)', marginBottom: '16px' }}>Target: <span style={{ color: 'var(--app-text)' }}>{changingClassFor.key}</span></div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--app-text-muted)', marginBottom: '8px' }}>New Class</label>
                  <select style={{ width: '100%', padding: '10px 12px', background: 'var(--app-bg)', border: '1px solid var(--app-border)', color: 'var(--app-text)', borderRadius: '6px', outline: 'none' }} value={newStorageClass} onChange={e => setNewStorageClass(e.target.value)}>
                    {STORAGE_CLASSES.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                  </select>
                </>
              )}
            </div>

            <div style={{ padding: '16px 20px', background: 'var(--app-panel)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => { setShowBucketModal(false); setShowFolderModal(false); setChangingClassFor(null); }} 
                style={{ padding: '8px 16px', background: 'transparent', border: 'none', color: 'var(--app-text)', cursor: 'pointer', fontWeight: '500' }}
              >
                Cancel
              </button>
              <button 
                onClick={showBucketModal ? handleCreateBucket : showFolderModal ? handleCreateFolder : submitChangeStorageClass}
                disabled={creatingBucket || creatingFolder || classLoading || (showBucketModal && !newBucketName) || (showFolderModal && !newFolderName) || (changingClassFor && newStorageClass === changingClassFor.current)}
                style={{ padding: '8px 16px', background: 'var(--app-blue)', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '500' }}
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
