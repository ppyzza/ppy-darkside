
'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import DbDiffXP from './components/DbDiffXP';
import DbDiffDarkside from './components/DbDiffDarkside';
import DbDiffGlass from './components/DbDiffGlass';

type ColDef = {
  column_name: string;
  data_type: string;
  is_nullable: string;
  udt_name: string;
  enum_values: string[] | null;
  is_primary_key: boolean | null;
};

type SchemaMap = Record<string, ColDef[]>;

export default function DbDiffPage() {
  const { theme } = useTheme();
  const [sourceConn, setSourceConn] = useState('postgres://postgres:mysecretpassword@localhost:5432/hr_revamp');
  const [targetConn, setTargetConn] = useState('postgres://postgres:mysecretpassword@localhost:5432/hr_revamp');
  const [sourceSchemaName, setSourceSchemaName] = useState('corehr_mock');
  const [targetSchemaName, setTargetSchemaName] = useState('corehr');
  
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState('');
  
  const [sourceSchema, setSourceSchema] = useState<SchemaMap | null>(null);
  const [targetSchema, setTargetSchema] = useState<SchemaMap | null>(null);

  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});
  
  // Data Diff State
  const [dataDiffs, setDataDiffs] = useState<Record<string, { loading: boolean, error?: string, diff?: any[], pks?: string[] }>>({});

  const handleCompareData = async (tableName: string) => {
    setDataDiffs(prev => ({ ...prev, [tableName]: { loading: true } }));
    try {
      const res = await fetch('/api/db/data-diff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sourceConn, targetConn, 
          sourceSchema: sourceSchemaName, 
          targetSchema: targetSchemaName, 
          tableName 
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      
      setDataDiffs(prev => ({ ...prev, [tableName]: { loading: false, diff: data.diff, pks: data.pks } }));
    } catch (err: any) {
      setDataDiffs(prev => ({ ...prev, [tableName]: { loading: false, error: err.message } }));
    }
  };

  const handleCompare = async () => {
    setComparing(true);
    setError('');
    setSourceSchema(null);
    setTargetSchema(null);
    setExpandedTables({});

    try {
      const [srcRes, tgtRes] = await Promise.all([
        fetch('/api/db/schema', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ connectionString: sourceConn, schema: sourceSchemaName })
        }),
        fetch('/api/db/schema', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ connectionString: targetConn, schema: targetSchemaName })
        })
      ]);

      const srcData = await srcRes.json();
      const tgtData = await tgtRes.json();

      if (!srcData.success) throw new Error(`Source Error: ${srcData.error}`);
      if (!tgtData.success) throw new Error(`Target Error: ${tgtData.error}`);

      setSourceSchema(srcData.schema);
      setTargetSchema(tgtData.schema);
      
      // Auto expand tables that have diffs
      const autoExpand: Record<string, boolean> = {};
      const allTables = Array.from(new Set([...Object.keys(srcData.schema), ...Object.keys(tgtData.schema)])).sort();
      
      allTables.forEach(t => {
        const srcCols = srcData.schema[t];
        const tgtCols = tgtData.schema[t];
        if (!srcCols || !tgtCols) {
          autoExpand[t] = true;
        } else {
          const hasColDiff = srcCols.some((sc: any) => {
            const tc = tgtCols.find((c: any) => c.column_name === sc.column_name);
            return !tc || tc.data_type !== sc.data_type;
          }) || tgtCols.some((tc: any) => !srcCols.find((sc: any) => sc.column_name === tc.column_name));
          if (hasColDiff) autoExpand[t] = true;
        }
      });
      setExpandedTables(autoExpand);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setComparing(false);
    }
  };

  const toggleTable = (tableName: string) => {
    setExpandedTables(prev => ({ ...prev, [tableName]: !prev[tableName] }));
  };

  
  const props = {
    sourceConn, setSourceConn, targetConn, setTargetConn, sourceSchemaName, setSourceSchemaName,
    targetSchemaName, setTargetSchemaName, comparing, error, sourceSchema, targetSchema,
    expandedTables, dataDiffs, handleCompareData, handleCompare, toggleTable, setError, setComparing,
    setSourceSchema, setTargetSchema, setExpandedTables, setDataDiffs
  };

  switch (theme) {
    case 'darkside':
      return <DbDiffDarkside {...props} />;
    case 'glass':
      return <DbDiffGlass {...props} />;
    case 'xp':
    default:
      return <DbDiffXP {...props} />;
  }
}
