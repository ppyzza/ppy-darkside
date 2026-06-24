export interface ConfigCompareProps {
  tenants: any[];
  dbRows: any[];
  csvRows: any[];
  comparison: any[];
  selectedTenantId: string | undefined;
  finalError: string;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
