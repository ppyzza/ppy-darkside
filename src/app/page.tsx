'use client';

import { useState, useEffect, useRef } from 'react';

export default function S3Page() {
  const [buckets, setBuckets] = useState<any[]>([]);
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null);
  const [objects, setObjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);

  const [showBucketModal, setShowBucketModal] = useState(false);
  const [newBucketName, setNewBucketName] = useState('');
  const [creatingBucket, setCreatingBucket] = useState(false);

  const [changingClassFor, setChangingClassFor] = useState<{key: string, current: string} | null>(null);
  const [newStorageClass, setNewStorageClass] = useState('STANDARD');
  const [classLoading, setClassLoading] = useState(false);

  const [currentPrefix, setCurrentPrefix] = useState('');

  const STORAGE_CLASSES = [
    'STANDARD',
    'REDUCED_REDUNDANCY',
    'STANDARD_IA',
    'ONEZONE_IA',
    'INTELLIGENT_TIERING',
    'GLACIER',
    'DEEP_ARCHIVE',
    'OUTPOSTS',
    'GLACIER_IR',
    'SNOW',
    'EXPRESS_ONEZONE'
  ];

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchBuckets = () => {
    setLoading(true);
    fetch('/api/s3')
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setErrorMsg(data.error);
          setBuckets([]);
        } else {
          setBuckets(data);
          setErrorMsg(null);
        }
        setLoading(false);
      })
      .catch(err => {
        setErrorMsg(err.message);
        setBuckets([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBuckets();
  }, []);

  const fetchObjects = (bucket: string, prefix: string) => {
    setLoading(true);
    fetch(`/api/s3/objects?bucket=${bucket}&prefix=${encodeURIComponent(prefix)}`)
      .then(res => res.json())
      .then(data => {
        setObjects(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (selectedBucket) {
      fetchObjects(selectedBucket, currentPrefix);
    }
  }, [selectedBucket, currentPrefix]);

  const handleCreateBucket = async () => {
    if (!newBucketName) return;
    setCreatingBucket(true);
    try {
      const res = await fetch('/api/s3/buckets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bucket: newBucketName })
      });
      const data = await res.json();
      if (data.success) {
        setShowBucketModal(false);
        setNewBucketName('');
        fetchBuckets();
      } else {
        alert('❌ Error creating bucket: ' + data.error);
      }
    } catch (err: any) {
      alert('❌ Error creating bucket: ' + err.message);
    } finally {
      setCreatingBucket(false);
    }
  };

  const handleDeleteBucket = async (bucket: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm(`Are you sure you want to delete the bucket "${bucket}"? It must be empty first!`)) return;
    try {
      const res = await fetch(`/api/s3/buckets/delete?bucket=${encodeURIComponent(bucket)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        if (selectedBucket === bucket) {
          setSelectedBucket(null);
          setCurrentPrefix('');
        }
        fetchBuckets();
      } else {
        alert('❌ Error deleting bucket: ' + data.error);
      }
    } catch (err: any) {
      alert('❌ Error deleting bucket: ' + err.message);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedBucket) return;

    setUploading(true);
    const formData = new FormData();
    const fileKey = currentPrefix + file.name;
    
    formData.append('file', file);
    formData.append('bucket', selectedBucket);
    formData.append('key', fileKey);

    try {
      const res = await fetch('/api/s3/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        fetchObjects(selectedBucket, currentPrefix);
      } else {
        alert('❌ Error uploading: ' + data.error);
      }
    } catch (err: any) {
      alert('❌ Error uploading: ' + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteObject = async (key: string) => {
    if (!selectedBucket) return;
    if (!confirm(`Are you sure you want to delete ${key}?`)) return;

    try {
      const res = await fetch(`/api/s3/delete?bucket=${encodeURIComponent(selectedBucket)}&key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchObjects(selectedBucket, currentPrefix);
      } else {
        alert('❌ Error deleting: ' + data.error);
      }
    } catch (err: any) {
      alert('❌ Error deleting: ' + err.message);
    }
  };

  const submitChangeStorageClass = async () => {
    if (!selectedBucket || !changingClassFor) return;
    setClassLoading(true);
    
    try {
      const res = await fetch('/api/s3/storage-class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bucket: selectedBucket,
          key: changingClassFor.key,
          storageClass: newStorageClass
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchObjects(selectedBucket, currentPrefix);
        setChangingClassFor(null);
      } else {
        alert('❌ Error changing storage class: ' + data.error);
      }
    } catch (err: any) {
      alert('❌ Error changing storage class: ' + err.message);
    } finally {
      setClassLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!selectedBucket || !newFolderName) return;
    setCreatingFolder(true);
    
    try {
      const fullFolderName = currentPrefix + newFolderName.replace(/\/$/, '') + '/';
      const res = await fetch('/api/s3/create-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bucket: selectedBucket,
          folderName: fullFolderName
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowFolderModal(false);
        setNewFolderName('');
        fetchObjects(selectedBucket, currentPrefix);
      } else {
        alert('❌ Error creating folder: ' + data.error);
      }
    } catch (err: any) {
      alert('❌ Error creating folder: ' + err.message);
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleEmptyBucket = async (bucket: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm(`🚨 WARNING: Are you sure you want to NUKE everything in "${bucket}"?\nThis will delete ALL files and folders permanently.`)) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/s3/buckets/empty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bucket })
      });
      const data = await res.json();
      if (data.success) {
        alert(`☢️ BOOM! Emptied ${data.deletedCount} objects from ${bucket}.`);
        if (selectedBucket === bucket) {
          fetchObjects(bucket, currentPrefix);
        } else {
          setLoading(false);
        }
      } else {
        alert('❌ Error emptying bucket: ' + data.error);
        setLoading(false);
      }
    } catch (err: any) {
      alert('❌ Error emptying bucket: ' + err.message);
      setLoading(false);
    }
  };

  const breadcrumbs = currentPrefix.split('/').filter(p => p);

  return (
    <div className="app-window" style={{ height: '100%' }}>
      <div className="app-titlebar">
        <span>S3 Explorer {selectedBucket ? `- ${selectedBucket}` : ''}</span>
        <div className="app-titlebar-buttons">
          <div className="app-titlebar-btn">X</div>
        </div>
      </div>
      
      <div className="app-content flex-col" style={{ display: 'flex', flexDirection: 'column' }}>
        
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '8px', paddingBottom: '8px', borderBottom: '1px solid #ACA899', marginBottom: '8px' }}>
          {!selectedBucket ? (
            <button className="btn" onClick={() => setShowBucketModal(true)}>✨ New Bucket</button>
          ) : (
            <>
              <button className="btn" onClick={() => { setSelectedBucket(null); setCurrentPrefix(''); }}>⬅️ Back</button>
              <div style={{ width: '1px', background: '#ACA899', margin: '0 4px' }}></div>
              <button className="btn" onClick={() => setShowFolderModal(true)}>📁 New Folder</button>
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
              <button className="btn" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? 'Uploading...' : '📤 Upload File'}
              </button>
              <div style={{ width: '1px', background: '#ACA899', margin: '0 4px' }}></div>
              <button className="btn" onClick={() => handleEmptyBucket(selectedBucket)}>☢️ Empty Bucket</button>
              <button className="btn btn-danger" onClick={() => handleDeleteBucket(selectedBucket)}>🗑️ Delete Bucket</button>
            </>
          )}
        </div>

        {/* Address Bar */}
        {selectedBucket && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--xp-text-muted)' }}>Address</span>
            <div style={{ flex: 1, background: '#FFFFFF', border: '1px solid #7F9DB9', padding: '2px 6px', display: 'flex', gap: '4px', fontSize: '11px' }}>
              <span style={{ cursor: 'pointer', color: currentPrefix === '' ? '#000' : '#0000EE', textDecoration: currentPrefix === '' ? 'none' : 'underline' }} onClick={() => setCurrentPrefix('')}>
                {selectedBucket}
              </span>
              {breadcrumbs.map((crumb, idx) => {
                const path = breadcrumbs.slice(0, idx + 1).join('/') + '/';
                const isLast = currentPrefix === path;
                return (
                  <span key={path} style={{ display: 'flex', gap: '4px' }}>
                    <span style={{ color: '#7F9DB9' }}>\</span>
                    <span style={{ cursor: 'pointer', color: isLast ? '#000' : '#0000EE', textDecoration: isLast ? 'none' : 'underline' }} onClick={() => setCurrentPrefix(path)}>
                      {crumb}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="window-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          {!selectedBucket ? (
            // Bucket List
            <div style={{ flex: 1, overflow: 'auto', background: '#FFFFFF' }}>
              {loading ? (
                <div style={{ padding: '8px' }}>Loading buckets...</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: '20px' }}></th>
                      <th>Name</th>
                      <th>Creation Date</th>
                      <th style={{ width: '150px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buckets.map(b => (
                      <tr key={b.Name} onDoubleClick={() => { setSelectedBucket(b.Name); setCurrentPrefix(''); }} style={{ cursor: 'pointer' }}>
                        <td style={{ textAlign: 'center' }}>🪣</td>
                        <td>{b.Name}</td>
                        <td>{new Date(b.CreationDate).toLocaleString()}</td>
                        <td>
                          <div className="flex gap-1">
                            <button className="btn" onClick={(e) => handleEmptyBucket(b.Name, e)} title="Empty">☢️</button>
                            <button className="btn" onClick={(e) => handleDeleteBucket(b.Name, e)} title="Delete">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {errorMsg && (
                      <tr><td colSpan={4} style={{ padding: '16px 8px', textAlign: 'center', color: '#CC0000' }}>
                        <div>⚠️ LocalStack is not running or S3 is not enabled.</div>
                        <div style={{ fontSize: '10px', marginTop: '4px', opacity: 0.8 }}>({errorMsg})</div>
                      </td></tr>
                    )}
                    {buckets.length === 0 && !errorMsg && (
                      <tr><td colSpan={4} style={{ padding: '8px', textAlign: 'center' }}>No buckets found.</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            // Object List
            <div style={{ flex: 1, overflow: 'auto', background: '#FFFFFF' }}>
              {loading && !uploading ? (
                <div style={{ padding: '8px' }}>Loading objects...</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: '20px' }}></th>
                      <th>Name</th>
                      <th>Size</th>
                      <th>Storage Class</th>
                      <th style={{ width: '150px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPrefix !== '' && (
                      <tr onDoubleClick={() => {
                        const newPath = breadcrumbs.slice(0, -1).join('/');
                        setCurrentPrefix(newPath ? newPath + '/' : '');
                      }} style={{ cursor: 'pointer' }}>
                        <td style={{ textAlign: 'center' }}>📁</td>
                        <td colSpan={4}>..</td>
                      </tr>
                    )}
                    {objects.map(obj => {
                      const currentClass = obj.StorageClass || 'STANDARD';
                      const isFolder = obj.isFolder;
                      const displayName = obj.Key.slice(currentPrefix.length);

                      return (
                        <tr key={obj.Key} onDoubleClick={() => isFolder && setCurrentPrefix(obj.Key)} style={{ cursor: isFolder ? 'pointer' : 'default' }}>
                          <td style={{ textAlign: 'center' }}>{isFolder ? '📁' : '📄'}</td>
                          <td>{displayName}</td>
                          <td>{isFolder ? '-' : `${(obj.Size / 1024).toFixed(2)} KB`}</td>
                          <td>
                            {!isFolder && (
                              <span className="badge badge-gray">{currentClass}</span>
                            )}
                          </td>
                          <td>
                            <div className="flex gap-1">
                              {!isFolder && (
                                <>
                                  <button className="btn" onClick={(e) => { e.stopPropagation(); setChangingClassFor({ key: obj.Key, current: currentClass }); setNewStorageClass(currentClass); }} title="Change Class">🔄</button>
                                  <a href={obj.url} target="_blank" className="btn" style={{ textDecoration: 'none' }} title="Download">⬇️</a>
                                </>
                              )}
                              <button className="btn btn-danger" onClick={(e) => { e.stopPropagation(); handleDeleteObject(obj.Key); }} title="Delete">🗑️</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {objects.length === 0 && (
                      <tr><td colSpan={5} style={{ padding: '8px', textAlign: 'center' }}>Folder is empty.</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Modals */}
      
      {showBucketModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="app-window" style={{ width: '300px' }}>
            <div className="app-titlebar"><span>Create Bucket</span><div className="app-titlebar-buttons"><div className="app-titlebar-btn" onClick={() => { setShowBucketModal(false); setNewBucketName(''); }}>X</div></div></div>
            <div className="app-content">
              <div style={{ marginBottom: '8px', fontSize: '11px' }}>Bucket Name:</div>
              <input type="text" style={{ width: '100%', marginBottom: '16px' }} value={newBucketName} onChange={e => setNewBucketName(e.target.value)} autoFocus />
              <div className="flex justify-end gap-2">
                <button className="btn btn-primary" onClick={handleCreateBucket} disabled={creatingBucket || !newBucketName}>OK</button>
                <button className="btn" onClick={() => { setShowBucketModal(false); setNewBucketName(''); }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFolderModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="app-window" style={{ width: '300px' }}>
            <div className="app-titlebar"><span>Create Folder</span><div className="app-titlebar-buttons"><div className="app-titlebar-btn" onClick={() => { setShowFolderModal(false); setNewFolderName(''); }}>X</div></div></div>
            <div className="app-content">
              <div style={{ marginBottom: '8px', fontSize: '11px' }}>Folder Name:</div>
              <input type="text" style={{ width: '100%', marginBottom: '16px' }} value={newFolderName} onChange={e => setNewFolderName(e.target.value)} autoFocus />
              <div className="flex justify-end gap-2">
                <button className="btn btn-primary" onClick={handleCreateFolder} disabled={creatingFolder || !newFolderName}>OK</button>
                <button className="btn" onClick={() => { setShowFolderModal(false); setNewFolderName(''); }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {changingClassFor && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="app-window" style={{ width: '300px' }}>
            <div className="app-titlebar"><span>Properties</span><div className="app-titlebar-buttons"><div className="app-titlebar-btn" onClick={() => setChangingClassFor(null)}>X</div></div></div>
            <div className="app-content">
              <div style={{ marginBottom: '4px', fontSize: '11px' }}>File: {changingClassFor.key}</div>
              <div style={{ marginBottom: '8px', fontSize: '11px' }}>Storage Class:</div>
              <select style={{ width: '100%', marginBottom: '16px' }} value={newStorageClass} onChange={e => setNewStorageClass(e.target.value)}>
                {STORAGE_CLASSES.map(cls => <option key={cls} value={cls}>{cls}</option>)}
              </select>
              <div className="flex justify-end gap-2">
                <button className="btn btn-primary" onClick={submitChangeStorageClass} disabled={classLoading || newStorageClass === changingClassFor.current}>Apply</button>
                <button className="btn" onClick={() => setChangingClassFor(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
