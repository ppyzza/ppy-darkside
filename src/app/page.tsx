'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import S3ExplorerXP from './components/S3ExplorerXP';
import S3ExplorerDarkside from './components/S3ExplorerDarkside';
import S3ExplorerGlass from './components/S3ExplorerGlass';
import { S3ExplorerProps } from './components/types';

export default function S3Page() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
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
    setMounted(true);
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

  const props: S3ExplorerProps = {
    buckets, selectedBucket, objects, loading, uploading, fileInputRef,
    showFolderModal, newFolderName, creatingFolder,
    showBucketModal, newBucketName, creatingBucket,
    changingClassFor, newStorageClass, classLoading,
    currentPrefix, STORAGE_CLASSES, errorMsg, breadcrumbs,
    setSelectedBucket, setCurrentPrefix, setShowBucketModal, setNewBucketName,
    setShowFolderModal, setNewFolderName, setChangingClassFor, setNewStorageClass,
    handleCreateBucket, handleDeleteBucket, handleEmptyBucket, handleFileUpload,
    handleDeleteObject, submitChangeStorageClass, handleCreateFolder
  };

  if (!mounted) return null;

  switch (theme) {
    case 'darkside':
      return <S3ExplorerDarkside {...props} />;
    case 'glass':
      return <S3ExplorerGlass {...props} />;
    case 'xp':
    default:
      return <S3ExplorerXP {...props} />;
  }
}
