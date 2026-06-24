import React from 'react';

export type ColDef = {
  column_name: string;
  data_type: string;
  is_nullable: string;
  udt_name: string;
  enum_values: string[] | null;
  is_primary_key: boolean | null;
};

export type SchemaMap = Record<string, ColDef[]>;

export interface DbDiffProps {
  sourceConn: string;
  setSourceConn: React.Dispatch<React.SetStateAction<string>>;
  targetConn: string;
  setTargetConn: React.Dispatch<React.SetStateAction<string>>;
  sourceSchemaName: string;
  setSourceSchemaName: React.Dispatch<React.SetStateAction<string>>;
  targetSchemaName: string;
  setTargetSchemaName: React.Dispatch<React.SetStateAction<string>>;
  comparing: boolean;
  setComparing: React.Dispatch<React.SetStateAction<boolean>>;
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
  sourceSchema: SchemaMap | null;
  setSourceSchema: React.Dispatch<React.SetStateAction<SchemaMap | null>>;
  targetSchema: SchemaMap | null;
  setTargetSchema: React.Dispatch<React.SetStateAction<SchemaMap | null>>;
  expandedTables: Record<string, boolean>;
  setExpandedTables: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  dataDiffs: Record<string, { loading: boolean, error?: string, diff?: any[], pks?: string[] }>;
  setDataDiffs: React.Dispatch<React.SetStateAction<Record<string, { loading: boolean, error?: string, diff?: any[], pks?: string[] }>>>;
  handleCompareData: (tableName: string) => Promise<void>;
  handleCompare: () => Promise<void>;
  toggleTable: (tableName: string) => void;
}
