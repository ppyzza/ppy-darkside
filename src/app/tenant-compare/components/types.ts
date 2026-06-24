export interface TenantCompareProps {
  schema: string;
  dbRows: any[];
  csvRows: any[];
  comparison: any[];
  finalError: string;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
