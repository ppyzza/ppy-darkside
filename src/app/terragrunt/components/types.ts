import React from 'react';

export type EnvData = {
  service_environment: Record<string, string>;
  service_secrets: Record<string, string>;
  specs: Record<string, string>;
  path: string;
};

export type EditChange = { filePath: string; key: string; newValue: string; type: 'Env' | 'Secret' | 'Spec' };

export interface TerragruntProps {
  currentPath: string;
  setCurrentPath: React.Dispatch<React.SetStateAction<string>>;
  directories: string[];
  setDirectories: React.Dispatch<React.SetStateAction<string[]>>;
  files: string[];
  setFiles: React.Dispatch<React.SetStateAction<string[]>>;
  fsError: string;
  setFsError: React.Dispatch<React.SetStateAction<string>>;
  loadingFs: boolean;
  setLoadingFs: React.Dispatch<React.SetStateAction<boolean>>;
  selectedFiles: string[];
  setSelectedFiles: React.Dispatch<React.SetStateAction<string[]>>;
  scanning: boolean;
  setScanning: React.Dispatch<React.SetStateAction<boolean>>;
  scanError: string;
  setScanError: React.Dispatch<React.SetStateAction<string>>;
  environments: Record<string, EnvData> | null;
  setEnvironments: React.Dispatch<React.SetStateAction<Record<string, EnvData> | null>>;
  allKeys: string[];
  setAllKeys: React.Dispatch<React.SetStateAction<string[]>>;
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  edits: Record<string, EditChange>;
  setEdits: React.Dispatch<React.SetStateAction<Record<string, EditChange>>>;
  commitMessage: string;
  setCommitMessage: React.Dispatch<React.SetStateAction<string>>;
  committing: boolean;
  setCommitting: React.Dispatch<React.SetStateAction<boolean>>;
  commitError: string;
  setCommitError: React.Dispatch<React.SetStateAction<string>>;
  loadDirectory: (path: string) => Promise<void>;
  navigateUp: () => void;
  navigateInto: (dir: string) => void;
  addFile: (file: string) => void;
  removeFile: (fullPath: string) => void;
  handleCompare: () => Promise<void>;
  handleEditChange: (filePath: string, key: string, originalValue: string, newValue: string, typeStr: string) => void;
  handleCommit: () => Promise<void>;
}
