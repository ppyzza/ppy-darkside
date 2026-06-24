
'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';
import SeedWizardXP from './components/SeedWizardXP';
import SeedWizardDarkside from './components/SeedWizardDarkside';
import SeedWizardGlass from './components/SeedWizardGlass';
import Papa from 'papaparse';

export default function SeedWizardPage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    setMounted(true);
  }, []);

  // DB Connection State
  const [connectionMode, setConnectionMode] = useState<'string' | 'fields'>('fields');
  const [connectionString, setConnectionString] = useState('postgres://postgres:mysecretpassword@localhost:5432/hr_revamp');
  const [dbConfig, setDbConfig] = useState({
    host: 'localhost',
    port: 5432,
    database: 'hr_revamp',
    user: 'postgres',
    password: 'mysecretpassword',
    ssl: false
  });
  const [schema, setSchema] = useState('corehr');
  const [connecting, setConnecting] = useState(false);
  const [dbError, setDbError] = useState('');
  const [tables, setTables] = useState<string[]>([]);

  // Selection State
  const [selectedTable, setSelectedTable] = useState('');
  const [manualTable, setManualTable] = useState(false);
  const [columns, setColumns] = useState<any[]>([]);
  const [fetchingCols, setFetchingCols] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [fkOptions, setFkOptions] = useState<Record<string, any[]>>({});

  // CSV State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [editorPage, setEditorPage] = useState(0);
  const [validationErrors, setValidationErrors] = useState<Record<number, Record<string, string>>>({});
  const [editingRowIdx, setEditingRowIdx] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<any>(null);

  // Mapping State (CSV Header -> DB Column)
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [generateUuidFor, setGenerateUuidFor] = useState<Record<string, boolean>>({});

  // Export State
  const [exportedJson, setExportedJson] = useState('');
  const [exportedSql, setExportedSql] = useState('');

  const [executing, setExecuting] = useState(false);
  const [executeResult, setExecuteResult] = useState('');

  // Entity Builder State
  const [wizardMode, setWizardMode] = useState<'csv' | 'entity'>('csv');
  const [entityDirPath, setEntityDirPath] = useState('/Users/mrppy/worklife-core-hr-service/libs/database/src/entities');
  const [entities, setEntities] = useState<any[]>([]);
  const [scanningEntities, setScanningEntities] = useState(false);
  const [entityError, setEntityError] = useState('');
  const [selectedRootEntity, setSelectedRootEntity] = useState('');
  const [entityFormDataList, setEntityFormDataList] = useState<any[]>([]);
  const [activeRecordIndex, setActiveRecordIndex] = useState<number | null>(null);
  const [activeRecordData, setActiveRecordData] = useState<any>({});
  const [scanSummary, setScanSummary] = useState<Record<number, string[]> | null>(null);

  const [templates, setTemplates] = useState<{name: string, sizeKb: string}[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const res = await fetch('/api/csv-templates');
      const data = await res.json();
      if (data.success) {
        setTemplates(data.files);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const calculateJoinDepths = (parsedEntities: any[]) => {
    const depths = new Map<string, number>();
    const processing = new Set<string>();

    const getDepth = (className: string): number => {
      if (depths.has(className)) return depths.get(className)!;
      if (processing.has(className)) return 1;

      const ent = parsedEntities.find(e => e.className === className);
      if (!ent || !ent.relations || ent.relations.length === 0) {
        depths.set(className, 0);
        return 0;
      }

      processing.add(className);
      let maxDepth = 0;
      for (const rel of ent.relations) {
        const d = getDepth(rel.target);
        if (d > maxDepth) maxDepth = d;
      }
      processing.delete(className);

      const result = maxDepth + 1;
      depths.set(className, result);
      return result;
    };

    const depthsMap: Record<number, string[]> = {};

    for (const ent of parsedEntities) {
      const d = getDepth(ent.className);
      if (!depthsMap[d]) depthsMap[d] = [];
      depthsMap[d].push(ent.className);
    }

    setScanSummary(depthsMap);
  };

  const scanEntities = async () => {
    setScanningEntities(true);
    setEntityError('');
    try {
      const res = await fetch('/api/typeorm/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dirPath: entityDirPath })
      });
      const data = await res.json();
      if (data.success) {
        setEntities(data.data);
        calculateJoinDepths(data.data);
      } else {
        setEntityError(data.error);
      }
    } catch (err: any) {
      setEntityError(err.message);
    } finally {
      setScanningEntities(false);
    }
  };

  const handleTemplateSelect = async (fileName: string) => {
    try {
      const res = await fetch(`/api/csv-templates?file=${encodeURIComponent(fileName)}`);
      const data = await res.json();
      if (data.success) {
        Papa.parse(data.content, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const headers = results.meta.fields || [];
            if (headers.length === 0) {
              alert('No data or headers found in this template.');
              return;
            }
            setEditorPage(0);
            setCsvHeaders(headers);
            setCsvData(results.data);
          }
        });
      } else {
        alert('Error loading template: ' + data.error);
      }
    } catch (err) {
      alert('Failed to load template');
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    setDbError('');
    try {
      const res = await fetch('/api/db/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          connectionString: connectionMode === 'string' ? connectionString : undefined,
          dbConfig: connectionMode === 'fields' ? { ...dbConfig, port: Number(dbConfig.port) } : undefined,
          schema 
        })
      });
      const data = await res.json();
      if (data.success) {
        setTables(data.tables);
        setStep(2);
        fetchTemplates(); // Fetch templates when reaching step 2
      } else {
        setDbError(data.error);
      }
    } catch (err: any) {
      setDbError(err.message);
    } finally {
      setConnecting(false);
    }
  };

  const fetchColumnsForTable = async (tableToFetch: string) => {
    if (!tableToFetch) return;

    setFetchingCols(true);
    try {
      const res = await fetch('/api/db/columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          connectionString: connectionMode === 'string' ? connectionString : undefined,
          dbConfig: connectionMode === 'fields' ? { ...dbConfig, port: Number(dbConfig.port) } : undefined,
          schema, 
          table: tableToFetch 
        })
      });
      const data = await res.json();
      if (data.success) {
        setColumns(data.columns);
        
        // Fetch FK data
        const newFkOptions: Record<string, any[]> = {};
        for (const c of data.columns) {
          if (c.foreign_key) {
            try {
              const fkRes = await fetch('/api/db/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  connectionString: connectionMode === 'string' ? connectionString : undefined,
                  dbConfig: connectionMode === 'fields' ? { ...dbConfig, port: Number(dbConfig.port) } : undefined,
                  schema, 
                  table: c.foreign_key.table,
                  limit: 500
                })
              });
              const fkData = await fkRes.json();
              if (fkData.success) {
                newFkOptions[`${c.foreign_key.table}.${c.foreign_key.column}`] = fkData.data;
              }
            } catch (err) {
              console.error('Error fetching FK data for', c.foreign_key.table, err);
            }
          }
        }
        setFkOptions(newFkOptions);
      } else {
        alert('Error fetching columns: ' + data.error);
      }
    } catch (err: any) {
      alert('Error fetching columns: ' + err.message);
    } finally {
      setFetchingCols(false);
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const table = e.target.value;
    setSelectedTable(table);
    if (table) fetchColumnsForTable(table);
  };

  const loadExistingData = async () => {
    if (!selectedTable) {
      alert('Please select a table first.');
      return;
    }
    if (columns.length === 0) {
      alert('Please load columns first.');
      return;
    }
    setLoadingData(true);
    try {
      const res = await fetch('/api/db/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          connectionString: connectionMode === 'string' ? connectionString : undefined,
          dbConfig: connectionMode === 'fields' ? { ...dbConfig, port: Number(dbConfig.port) } : undefined,
          schema, 
          table: selectedTable,
          limit: 100
        })
      });
      const data = await res.json();
      if (data.success) {
        if (data.data.length === 0) {
          const headers = columns.map(c => c.column_name);
          setCsvHeaders(headers);
          setCsvData([]);
          alert('Table is empty. Empty grid created with DB columns.');
        } else {
          const headers = Object.keys(data.data[0]);
          setCsvHeaders(headers);
          const formattedData = data.data.map((row: any) => {
            const newRow: any = {};
            for (const key in row) {
               newRow[key] = row[key] !== null && typeof row[key] === 'object' ? JSON.stringify(row[key]) : String(row[key] ?? '');
            }
            return newRow;
          });
          setCsvData(formattedData);
          setEditorPage(0);
        }
      } else {
        alert('Error loading data: ' + data.error);
      }
    } catch (err: any) {
      alert('Failed to load data: ' + err.message);
    } finally {
      setLoadingData(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        setEditorPage(0);
        setCsvHeaders(headers);
        setCsvData(results.data);
      }
    });
  };

  const goToMapping = () => {
    if (!selectedTable || csvHeaders.length === 0) return;
    
    // Auto-map logic
    const initialMapping: Record<string, string> = {};
    const uuidSet: Record<string, boolean> = {};

    csvHeaders.forEach(header => {
      // Direct match
      let match = columns.find(c => c.column_name === header || c.column_name === header.toLowerCase());
      if (!match) {
        // camelCase to snake_case check
        const snake = header.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        match = columns.find(c => c.column_name === snake);
      }
      if (match) {
        initialMapping[header] = match.column_name;
      } else {
        initialMapping[header] = '';
      }
    });

    columns.forEach(c => {
      if (c.column_name.includes('uuid') || c.column_name.includes('id')) {
        // Optionally suggest generating uuid
      }
    });

    setMapping(initialMapping);
    setGenerateUuidFor(uuidSet);
    setStep(3);
  };

  const generateUuidV4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const performEntityExport = () => {
    let sqlStatements: string[] = ['BEGIN;'];
    
    const generateSqlForEntity = (entityName: string, data: any, parentId?: string) => {
      const entity = entities.find(e => e.className === entityName);
      if (!entity) return;

      const idVal = data[entity.primaryKey] || generateUuidV4();
      const insertData: any = { ...data, [entity.primaryKey]: idVal };
      
      // Basic heuristic for Foreign Key mapping
      if (parentId) {
        // Find a column ending in Id or Uuid
        const fkCol = entity.columns.find((c: string) => c.toLowerCase().includes('uuid') || c.toLowerCase().includes('id'));
        if (fkCol) {
          insertData[fkCol] = parentId;
        }
      }

      // Collect primitive columns to insert
      const columnsToInsert = entity.columns.filter((c: string) => insertData[c] !== undefined);
      
      if (columnsToInsert.length > 0) {
        const cols = columnsToInsert.map((c: string) => `"${c}"`).join(', ');
        const vals = columnsToInsert.map((col: string) => {
          const val = insertData[col];
          if (val === null || val === undefined || val === '') return 'NULL';
          if (typeof val === 'number' || typeof val === 'boolean') return val;
          return `'${String(val).replace(/'/g, "''")}'`;
        }).join(', ');
        
        sqlStatements.push(`INSERT INTO ${schema}."${entity.tableName}" (${cols}) VALUES (${vals});`);
      }

      // Handle relations (recursive)
      entity.relations.forEach((rel: any) => {
        if (rel.type === 'OneToMany' && Array.isArray(data[rel.property])) {
          data[rel.property].forEach((childData: any) => {
            generateSqlForEntity(rel.target, childData, idVal); 
          });
        } else if (rel.type === 'ManyToOne' && data[rel.property]) {
          // Simplified: Assume N:1 is inserted later, or manually ordered
          generateSqlForEntity(rel.target, data[rel.property]);
        }
      });
    };

    entityFormDataList.forEach(data => {
      generateSqlForEntity(selectedRootEntity, data);
    });
    sqlStatements.push('COMMIT;');

    setExportedJson(JSON.stringify(entityFormDataList, null, 2));
    setExportedSql(sqlStatements.join('\n'));
    setStep(4);
  };

  const performExport = () => {
    const result = csvData.map(row => {
      const obj: any = {};
      
      // Mapped fields
      csvHeaders.forEach(header => {
        const dbCol = mapping[header];
        if (dbCol && dbCol !== 'SKIP') {
          let val = row[header];
          // Try to cast types roughly
          if (!isNaN(Number(val)) && val !== '') val = Number(val);
          else if (val === 'true') val = true;
          else if (val === 'false') val = false;
          obj[dbCol] = val;
        }
      });

      // Auto UUID fields (find unmapped columns that we checked 'generate')
      columns.forEach(col => {
        if (generateUuidFor[col.column_name] && !obj[col.column_name]) {
          obj[col.column_name] = generateUuidV4();
        }
      });

      return obj;
    });

    setExportedJson(JSON.stringify(result, null, 2));

    // Generate SQL
    if (result.length > 0) {
      const dbColumnsToInsert = Object.keys(result[0]);
      let sql = `INSERT INTO ${schema}."${selectedTable}" (${dbColumnsToInsert.map(c => `"${c}"`).join(', ')})\nVALUES\n`;
      const sqlRows = result.map(row => {
        const vals = dbColumnsToInsert.map(col => {
          const val = row[col];
          if (val === null || val === undefined || val === '') return 'NULL';
          if (typeof val === 'number' || typeof val === 'boolean') return val;
          return `'${String(val).replace(/'/g, "''")}'`;
        });
        return `  (${vals.join(', ')})`;
      });
      sql += sqlRows.join(',\n');

      // Check for primary keys to build UPSERT
      const pkCols = columns.filter(c => c.is_primary_key).map(c => c.column_name);
      if (pkCols.length > 0) {
        // We can only do UPSERT if all PK columns are present in the insert statement
        const allPksPresent = pkCols.every(pk => dbColumnsToInsert.includes(pk));
        if (allPksPresent) {
          const updateCols = dbColumnsToInsert.filter(c => !pkCols.includes(c));
          sql += `\nON CONFLICT ("${pkCols.join('", "')}")`;
          if (updateCols.length > 0) {
            sql += `\nDO UPDATE SET\n  ${updateCols.map(c => `"${c}" = EXCLUDED."${c}"`).join(',\n  ')}`;
          } else {
            sql += `\nDO NOTHING`;
          }
        }
      }
      sql += ';';
      setExportedSql(sql);
    } else {
      setExportedSql('-- No data to export');
    }

    setStep(4);
  };

  const handleExecuteSql = async () => {
    if (!exportedSql || exportedSql.includes('-- No data')) {
      alert('No SQL to execute.');
      return;
    }
    setExecuting(true);
    setExecuteResult('');
    try {
      const res = await fetch('/api/db/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectionString: connectionMode === 'string' ? connectionString : undefined,
          dbConfig: connectionMode === 'fields' ? { ...dbConfig, port: Number(dbConfig.port) } : undefined,
          query: exportedSql
        })
      });
      const data = await res.json();
      if (data.success) {
        setExecuteResult(`✅ Success! Affected ${data.rowCount} rows.`);
        alert('Database execution successful!');
      } else {
        setExecuteResult(`❌ Error: ${data.error}`);
        alert('Execution failed: ' + data.error);
      }
    } catch (err: any) {
      setExecuteResult(`❌ Error: ${err.message}`);
      alert('Execution failed: ' + err.message);
    } finally {
      setExecuting(false);
    }
  };


  const props: any = {
    step, setStep, connectionMode, setConnectionMode, connectionString, setConnectionString,
    dbConfig, setDbConfig, schema, setSchema, connecting, setConnecting, dbError, setDbError,
    tables, setTables, selectedTable, setSelectedTable, manualTable, setManualTable,
    columns, setColumns, fetchingCols, setFetchingCols, loadingData, setLoadingData,
    fkOptions, setFkOptions, csvFile, setCsvFile, csvHeaders, setCsvHeaders, csvData, setCsvData,
    editorPage, setEditorPage, validationErrors, setValidationErrors, editingRowIdx, setEditingRowIdx,
    editFormData, setEditFormData, mapping, setMapping, generateUuidFor, setGenerateUuidFor,
    exportedJson, setExportedJson, exportedSql, setExportedSql, executing, setExecuting,
    executeResult, setExecuteResult, wizardMode, setWizardMode, entityDirPath, setEntityDirPath,
    entities, setEntities, scanningEntities, setScanningEntities, entityError, setEntityError,
    selectedRootEntity, setSelectedRootEntity, entityFormDataList, setEntityFormDataList,
    activeRecordIndex, setActiveRecordIndex, activeRecordData, setActiveRecordData, scanSummary, setScanSummary,
    templates, setTemplates, loadingTemplates, setLoadingTemplates,
    fetchTemplates, scanEntities, handleTemplateSelect, handleConnect, fetchColumnsForTable,
    handleSelectChange, loadExistingData, handleFileUpload, goToMapping, generateUuidV4,
    performEntityExport, performExport, handleExecuteSql, calculateJoinDepths
  };

  if (!mounted) return null;

  switch (theme) {
    case 'darkside':
      return <SeedWizardDarkside {...props} />;
    case 'glass':
      return <SeedWizardGlass {...props} />;
    case 'xp':
    default:
      return <SeedWizardXP {...props} />;
  }
}
