
'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import TerragruntXP from './components/TerragruntXP';
import TerragruntDarkside from './components/TerragruntDarkside';
import TerragruntGlass from './components/TerragruntGlass';

type EnvData = {
  service_environment: Record<string, string>;
  service_secrets: Record<string, string>;
  specs: Record<string, string>;
  path: string;
};

export default function TerragruntPage() {
  const { theme } = useTheme();
  const [currentPath, setCurrentPath] = useState('/Users/mrppy/deployments/live/ap-southeast-1');
  const [directories, setDirectories] = useState<string[]>([]);
  const [files, setFiles] = useState<string[]>([]);
  const [fsError, setFsError] = useState('');
  const [loadingFs, setLoadingFs] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  
  const [environments, setEnvironments] = useState<Record<string, EnvData> | null>(null);
  const [allKeys, setAllKeys] = useState<string[]>([]);

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // --- Inline Editor State ---
  type EditChange = { filePath: string; key: string; newValue: string; type: 'Env' | 'Secret' | 'Spec' };
  const [edits, setEdits] = useState<Record<string, EditChange>>({});
  const [commitMessage, setCommitMessage] = useState('');
  const [committing, setCommitting] = useState(false);
  const [commitError, setCommitError] = useState('');

  const loadDirectory = async (path: string) => {
    setLoadingFs(true);
    setFsError('');
    try {
      const res = await fetch('/api/fs/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetPath: path })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      
      setDirectories(data.directories);
      setFiles(data.files);
      setCurrentPath(path);
    } catch (err: any) {
      setFsError(err.message);
    } finally {
      setLoadingFs(false);
    }
  };

  useEffect(() => {
    loadDirectory(currentPath);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigateUp = () => {
    const parts = currentPath.split('/');
    parts.pop();
    const newPath = parts.join('/') || '/';
    loadDirectory(newPath);
  };

  const navigateInto = (dir: string) => {
    const newPath = currentPath.endsWith('/') ? `${currentPath}${dir}` : `${currentPath}/${dir}`;
    loadDirectory(newPath);
  };

  const addFile = (file: string) => {
    const fullPath = currentPath.endsWith('/') ? `${currentPath}${file}` : `${currentPath}/${file}`;
    if (!selectedFiles.includes(fullPath)) {
      setSelectedFiles([...selectedFiles, fullPath]);
    }
  };

  const removeFile = (fullPath: string) => {
    setSelectedFiles(selectedFiles.filter(f => f !== fullPath));
  };

  const handleCompare = async () => {
    if (selectedFiles.length < 2) {
      setScanError('Please select at least 2 files to compare.');
      return;
    }

    setScanning(true);
    setScanError('');
    setEnvironments(null);
    setAllKeys([]);
    setEdits({}); // clear edits on rescan

    try {
      const res = await fetch('/api/terragrunt/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: selectedFiles })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      
      setEnvironments(data.environments);
      setAllKeys(data.allKeys);
      setSidebarOpen(false); // Auto-hide sidebar to give more space for comparison
    } catch (err: any) {
      setScanError(err.message);
    } finally {
      setScanning(false);
    }
  };

  const handleEditChange = (filePath: string, key: string, originalValue: string, newValue: string, typeStr: string) => {
    const editKey = `${filePath}::${key}`;
    const type = typeStr as 'Env' | 'Secret' | 'Spec';

    if (newValue === originalValue) {
      const newEdits = { ...edits };
      delete newEdits[editKey];
      setEdits(newEdits);
    } else {
      setEdits({
        ...edits,
        [editKey]: { filePath, key, newValue, type }
      });
    }
  };

  const handleCommit = async () => {
    if (!commitMessage) {
      setCommitError('Please enter a commit message.');
      return;
    }
    
    setCommitting(true);
    setCommitError('');

    try {
      const changes = Object.values(edits);
      const res = await fetch('/api/terragrunt/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changes, commitMessage })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      // Successfully committed. Clear edits and rescan
      setEdits({});
      setCommitMessage('');
      await handleCompare(); // Reload data
      alert('Changes successfully saved and committed!');

    } catch (err: any) {
      setCommitError(err.message);
    } finally {
      setCommitting(false);
    }
  };

  
  
  const pendingEditsCount = Object.keys(edits).length;

  const props: any = {
    currentPath, setCurrentPath, directories, setDirectories, files, setFiles,
    fsError, setFsError, loadingFs, setLoadingFs, selectedFiles, setSelectedFiles,
    scanning, setScanning, scanError, setScanError, environments, setEnvironments,
    allKeys, setAllKeys, sidebarOpen, setSidebarOpen, edits, setEdits,
    commitMessage, setCommitMessage, committing, setCommitting, commitError, setCommitError,
    loadDirectory, navigateUp, navigateInto, addFile, removeFile,
    handleCompare, handleEditChange, handleCommit
  };

  switch (theme) {
    case 'darkside':
      return <TerragruntDarkside {...props} />;
    case 'glass':
      return <TerragruntGlass {...props} />;
    case 'xp':
    default:
      return <TerragruntXP {...props} />;
  }
}
