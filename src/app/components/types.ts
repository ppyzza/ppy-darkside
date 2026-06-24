export interface S3ExplorerProps {
  buckets: any[];
  selectedBucket: string | null;
  objects: any[];
  loading: boolean;
  uploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  showFolderModal: boolean;
  newFolderName: string;
  creatingFolder: boolean;
  showBucketModal: boolean;
  newBucketName: string;
  creatingBucket: boolean;
  changingClassFor: {key: string, current: string} | null;
  newStorageClass: string;
  classLoading: boolean;
  currentPrefix: string;
  STORAGE_CLASSES: string[];
  errorMsg: string | null;
  breadcrumbs: string[];
  
  setSelectedBucket: (b: string | null) => void;
  setCurrentPrefix: (p: string) => void;
  setShowBucketModal: (show: boolean) => void;
  setNewBucketName: (name: string) => void;
  setShowFolderModal: (show: boolean) => void;
  setNewFolderName: (name: string) => void;
  setChangingClassFor: (v: any) => void;
  setNewStorageClass: (cls: string) => void;
  
  handleCreateBucket: () => void;
  handleDeleteBucket: (bucket: string, e?: React.MouseEvent) => void;
  handleEmptyBucket: (bucket: string, e?: React.MouseEvent) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDeleteObject: (key: string) => void;
  submitChangeStorageClass: () => void;
  handleCreateFolder: () => void;
}
