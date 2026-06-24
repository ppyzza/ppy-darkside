'use client';

import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { EntityForm } from './EntityForm';

function FolderNode({ name, node, pathSoFar, level, onSelect }: any) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <div 
        onClick={() => setExpanded(!expanded)}
        style={{ 
          padding: '4px', 
          paddingLeft: `${level * 16 + 8}px`, 
          fontSize: '11px', 
          fontWeight: 'bold', 
          color: '#000',
          cursor: 'pointer',
          userSelect: 'none'
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#E5F5E5'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      >
        {expanded ? '📂' : '📁'} {name}
      </div>
      {expanded && (
        <div>
          {Object.keys(node).sort((a, b) => {
            const aIsFile = node[a]._isFile;
            const bIsFile = node[b]._isFile;
            if (aIsFile && !bIsFile) return 1;
            if (!aIsFile && bIsFile) return -1;
            return a.localeCompare(b);
          }).map(key => {
            if (key === '_isFile') return null;
            const item = node[key];
            if (item._isFile) {
              return (
                <div 
                  key={item.name}
                  onClick={() => onSelect(item.name)}
                  style={{ 
                    fontSize: '11px', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    padding: '2px 4px',
                    paddingLeft: `${(level + 1) * 16 + 24}px`
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#0A246A'; e.currentTarget.style.color = '#FFFFFF'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#000000'; }}
                >
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>📄 {key}</span>
                  <span style={{ color: '#888', marginLeft: '8px' }}>{item.sizeKb} KB</span>
                </div>
              );
            } else {
              return <FolderNode key={key} name={key} node={item} pathSoFar={pathSoFar + key + '/'} level={level + 1} onSelect={onSelect} />;
            }
          })}
        </div>
      )}
    </div>
  );
}

// Helper component for Folder Tree
function FolderTree({ templates, onSelect }: { templates: any[], onSelect: (name: string) => void }) {
  const tree: any = {};
  
  // Build Tree
  templates.forEach(t => {
    const parts = t.name.split('/');
    let current = tree;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        current[part] = { _isFile: true, ...t };
      } else {
        current[part] = current[part] || {};
        current = current[part];
      }
    }
  });

  return (
    <div style={{ userSelect: 'none' }}>
      {Object.keys(tree).sort((a, b) => {
        const aIsFile = tree[a]._isFile;
        const bIsFile = tree[b]._isFile;
        if (aIsFile && !bIsFile) return 1;
        if (!aIsFile && bIsFile) return -1;
        return a.localeCompare(b);
      }).map(key => {
        if (key === '_isFile') return null;
        const item = tree[key];
        if (item._isFile) {
          return (
            <div 
              key={item.name}
              onClick={() => onSelect(item.name)}
              style={{ 
                fontSize: '11px', 
                cursor: 'pointer', 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '2px 4px',
                paddingLeft: `8px`
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#0A246A'; e.currentTarget.style.color = '#FFFFFF'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#000000'; }}
            >
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>📄 {key}</span>
              <span style={{ color: '#888', marginLeft: '8px' }}>{item.sizeKb} KB</span>
            </div>
          );
        } else {
          return <FolderNode key={key} name={key} node={item} pathSoFar={key + '/'} level={0} onSelect={onSelect} />;
        }
      })}
    </div>
  );
}

export default function SeedWizardPage() {
  const [step, setStep] = useState(1);

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

  return (
    <div className="xp-window" style={{ height: '100%', maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
      <div className="xp-titlebar">
        <span>CSV to Seed Wizard 🪄</span>
        <div className="xp-titlebar-buttons">
          <div className="xp-titlebar-btn">X</div>
        </div>
      </div>

      <div className="xp-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: 0 }}>
        
        {/* Mode Toggle */}
        <div style={{ padding: '8px', borderBottom: '1px solid #ACA899', background: '#ECE9D8', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', fontSize: '11px' }}>Wizard Mode:</span>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
            <input type="radio" name="wizardMode" checked={wizardMode === 'csv'} onChange={() => setWizardMode('csv')} />
            📄 CSV to Table Mode
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
            <input type="radio" name="wizardMode" checked={wizardMode === 'entity'} onChange={() => setWizardMode('entity')} />
            🧩 Entity Builder Mode (Multi-Table)
          </label>
        </div>

        {/* Wizard Sidebar & Content layout */}
        <div style={{ display: 'flex', flex: 1 }}>
          
          {/* Left Sidebar Steps */}
          <div style={{ width: '150px', background: '#0A246A', color: 'white', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', fontWeight: 'bold' }}>
            {wizardMode === 'csv' ? (
              <>
                <div style={{ opacity: step === 1 ? 1 : 0.5 }}>1. DB Connection</div>
                <div style={{ opacity: step === 2 ? 1 : 0.5 }}>2. Select Data</div>
                <div style={{ opacity: step === 3 ? 1 : 0.5 }}>3. Column Mapping</div>
                <div style={{ opacity: step === 4 ? 1 : 0.5 }}>4. Finish & Export</div>
              </>
            ) : (
              <>
                <div style={{ opacity: step === 1 ? 1 : 0.5 }}>1. Setup & Parse</div>
                <div style={{ opacity: step === 2 ? 1 : 0.5 }}>2. Select Entity</div>
                <div style={{ opacity: step === 3 ? 1 : 0.5 }}>3. Build Data</div>
                <div style={{ opacity: step === 4 ? 1 : 0.5 }}>4. Generate SQL</div>
              </>
            )}
          </div>

          {/* Right Content Area */}
          <div style={{ flex: 1, padding: '24px', background: '#ECE9D8', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
            
            {step === 1 && (
              <div>
                <h3 style={{ marginTop: 0, borderBottom: '1px solid #ACA899', paddingBottom: '8px' }}>
                  {wizardMode === 'csv' ? 'Connect to PostgreSQL' : 'Database & Entity Setup'}
                </h3>
                <p style={{ fontSize: '11px', marginBottom: '16px' }}>
                  {wizardMode === 'csv' 
                    ? 'Provide connection details to introspect your Core HR database.' 
                    : 'Configure DB and point to your TypeORM entities folder to generate the relationship graph.'}
                </p>

                {wizardMode === 'entity' && (
                  <div style={{ marginBottom: '24px', padding: '12px', background: '#FFF', border: '1px solid #ACA899' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>TypeORM Entities Directory Path:</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="text" 
                        style={{ flex: 1, padding: '4px' }} 
                        value={entityDirPath} 
                        onChange={e => setEntityDirPath(e.target.value)} 
                        placeholder="/path/to/entities" 
                      />
                      <button className="btn" onClick={scanEntities} disabled={scanningEntities}>
                        {scanningEntities ? 'Scanning...' : 'Scan Entities 🔍'}
                      </button>
                    </div>
                    {entityError && <div style={{ color: 'red', fontSize: '11px', marginTop: '4px' }}>{entityError}</div>}
                    {entities.length > 0 && (
                      <div style={{ color: 'green', fontSize: '11px', marginTop: '4px', fontWeight: 'bold' }}>
                        ✅ Found {entities.length} entities!
                      </div>
                    )}
                    
                    {scanSummary && (
                      <div style={{ marginTop: '16px', background: '#F0F0F0', padding: '16px', border: '1px solid #ACA899' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h4 style={{ margin: 0, fontSize: '12px' }}>Scan Summary (Join Depths)</h4>
                          <button className="btn" style={{ fontSize: '10px' }} onClick={() => {
                            let md = `### Entity Join Depths\n\n`;
                            const maxDepth = Math.max(...Object.keys(scanSummary).map(Number));
                            for (let i = 0; i <= maxDepth; i++) {
                              if (scanSummary[i] && scanSummary[i].length > 0) {
                                md += `**${i} Join${i !== 1 ? 's' : ''}${i === 0 ? ' (Standalone)' : ''}:**\n${scanSummary[i].map((x: string) => `- ${x}`).join('\n')}\n\n`;
                              }
                            }
                            navigator.clipboard.writeText(md);
                            alert('Copied to clipboard!');
                          }}>📋 Copy as Markdown</button>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginTop: '12px' }}>
                          {Object.keys(scanSummary).map(Number).sort((a, b) => a - b).map(depth => {
                            let titleColor = '#333';
                            if (depth === 0) titleColor = '#006600';
                            else if (depth === 1) titleColor = '#B8860B';
                            else if (depth >= 2) titleColor = '#CC0000';

                            return (
                              <div key={depth}>
                                <strong style={{ fontSize: '11px', color: titleColor }}>
                                  {depth} Join{depth !== 1 ? 's' : ''} {depth === 0 ? '(Standalone)' : ''} ({scanSummary[depth].length})
                                </strong>
                                <div style={{ fontSize: '10px', maxHeight: '150px', overflow: 'auto', background: '#FFF', padding: '4px', border: '1px solid #CCC' }}>
                                  {scanSummary[depth].map((x: string) => <div key={x}>{x}</div>)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div style={{ marginBottom: '16px', display: 'flex', gap: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input type="radio" name="connMode" checked={connectionMode === 'fields'} onChange={() => setConnectionMode('fields')} /> Mamori / Detailed Config
                  </label>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input type="radio" name="connMode" checked={connectionMode === 'string'} onChange={() => setConnectionMode('string')} /> Connection String
                  </label>
                </div>

                {connectionMode === 'string' ? (
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold' }}>Connection String:</label>
                    <input type="text" style={{ width: '100%' }} value={connectionString} onChange={e => setConnectionString(e.target.value)} />
                  </div>
                ) : (
                  <div style={{ marginBottom: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold' }}>Host:</label>
                      <input type="text" style={{ width: '100%' }} value={dbConfig.host} onChange={e => setDbConfig({...dbConfig, host: e.target.value})} placeholder="cdac.cpf.co.th" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold' }}>Port:</label>
                      <input type="number" style={{ width: '100%' }} value={dbConfig.port} onChange={e => setDbConfig({...dbConfig, port: Number(e.target.value)})} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold' }}>Database:</label>
                      <input type="text" style={{ width: '100%' }} value={dbConfig.database} onChange={e => setDbConfig({...dbConfig, database: e.target.value})} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold' }}>Schema:</label>
                      <input type="text" style={{ width: '100%' }} value={schema} onChange={e => setSchema(e.target.value)} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold' }}>Username (with @ROLE for Mamori):</label>
                      <input type="text" style={{ width: '100%' }} value={dbConfig.user} onChange={e => setDbConfig({...dbConfig, user: e.target.value})} placeholder="username@WLGPCOREPRD_COREHR_AS" />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold' }}>Password:</label>
                      <input type="password" style={{ width: '100%' }} value={dbConfig.password} onChange={e => setDbConfig({...dbConfig, password: e.target.value})} />
                    </div>
                    <div style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input type="checkbox" checked={dbConfig.ssl} onChange={e => setDbConfig({...dbConfig, ssl: e.target.checked})} />
                        Enable SSL (Required for Mamori / Cloud DB)
                      </label>
                    </div>
                  </div>
                )}
                
                {connectionMode === 'string' && (
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold' }}>Schema:</label>
                    <input type="text" style={{ width: '100%' }} value={schema} onChange={e => setSchema(e.target.value)} />
                  </div>
                )}

                {dbError && <div style={{ color: 'red', fontWeight: 'bold', marginBottom: '16px' }}>Error: {dbError}</div>}

                <div className="flex justify-end border-t" style={{ paddingTop: '16px', borderTop: '1px solid #ACA899' }}>
                  <button className="btn btn-primary" onClick={handleConnect} disabled={connecting || (wizardMode === 'entity' && entities.length === 0)}>
                    Next {'>'}
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h3 style={{ marginTop: 0, borderBottom: '1px solid #ACA899', paddingBottom: '8px' }}>
                  {wizardMode === 'csv' ? 'Select Table & Upload Data' : 'Select Root Entity'}
                </h3>

                {wizardMode === 'entity' ? (
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>Target Root Entity:</label>
                    <select 
                      style={{ width: '100%' }} 
                      value={selectedRootEntity} 
                      onChange={(e) => {
                        setSelectedRootEntity(e.target.value);
                        // Also auto-select the table if matched
                        const ent = entities.find(x => x.className === e.target.value);
                        if (ent && ent.tableName) {
                          setSelectedTable(ent.tableName);
                          fetchColumnsForTable(ent.tableName);
                        }
                      }}
                    >
                      <option value="">-- Select Root Entity --</option>
                      {scanSummary ? (
                        <>
                          <optgroup label="0 Joins (Standalone)">
                            {scanSummary.depth0.map(className => {
                              const e = entities.find(x => x.className === className);
                              return e ? <option key={e.className} value={e.className}>{e.className} ({e.tableName})</option> : null;
                            })}
                          </optgroup>
                          <optgroup label="1 Join">
                            {scanSummary.depth1.map(className => {
                              const e = entities.find(x => x.className === className);
                              return e ? <option key={e.className} value={e.className}>{e.className} ({e.tableName})</option> : null;
                            })}
                          </optgroup>
                          <optgroup label="2+ Joins (Complex)">
                            {scanSummary.depth2plus.map(className => {
                              const e = entities.find(x => x.className === className);
                              return e ? <option key={e.className} value={e.className}>{e.className} ({e.tableName})</option> : null;
                            })}
                          </optgroup>
                        </>
                      ) : (
                        entities.map(e => <option key={e.className} value={e.className}>{e.className} ({e.tableName})</option>)
                      )}
                    </select>

                    <div className="flex justify-end border-t" style={{ paddingTop: '16px', borderTop: '1px solid #ACA899', marginTop: '24px' }}>
                      <button className="btn" onClick={() => setStep(1)}>{'< Back'}</button>
                      <button className="btn btn-primary" onClick={() => {
                        setEntityFormDataList([]);
                        setActiveRecordIndex(null);
                        setActiveRecordData({});
                        setStep(3);
                      }} disabled={!selectedRootEntity}>
                        Next {'>'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Target Database Table:</label>
                    <label style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input type="checkbox" checked={manualTable} onChange={e => setManualTable(e.target.checked)} />
                      Type Manually
                    </label>
                  </div>
                  
                  {(!manualTable && tables.length > 0) ? (
                    <select style={{ width: '100%' }} value={selectedTable} onChange={handleSelectChange}>
                      <option value="">-- Select a Table --</option>
                      {tables.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  ) : (
                    <div>
                      <input 
                        type="text"
                        style={{ width: 'calc(100% - 90px)', display: 'inline-block' }} 
                        value={selectedTable} 
                        onChange={e => setSelectedTable(e.target.value)}
                        placeholder="e.g. employee"
                      />
                      <button className="btn" style={{ width: '80px', marginLeft: '8px' }} onClick={() => fetchColumnsForTable(selectedTable)} disabled={!selectedTable || fetchingCols}>
                        Load
                      </button>
                    </div>
                  )}
                  {fetchingCols && <div style={{ fontSize: '11px', color: 'blue', marginTop: '4px' }}>Fetching columns...</div>}
                </div>

                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                  {/* Left Box: Templates */}
                  <div style={{ flex: 1, background: '#FFFFFF', padding: '16px', border: '1px solid #ACA899' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '8px' }}>🗂️ Browse Built-in Templates:</label>
                    {loadingTemplates ? (
                      <div style={{ fontSize: '11px', color: 'blue' }}>Loading templates...</div>
                    ) : (
                      <div style={{ height: '300px', overflowY: 'auto', border: '1px solid #EBEBEB', padding: '4px' }}>
                        {templates.length === 0 ? (
                          <div style={{ padding: '8px', fontSize: '11px', color: '#666' }}>No templates found</div>
                        ) : (
                          <FolderTree 
                            templates={templates} 
                            onSelect={handleTemplateSelect} 
                          />
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Right Box: Upload or Load DB */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ background: '#FFFFFF', padding: '16px', border: '1px solid #ACA899' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '8px' }}>📂 Upload Local CSV File:</label>
                      <input type="file" accept=".csv" onChange={handleFileUpload} style={{ width: '100%', fontSize: '11px' }} />
                    </div>

                    <div style={{ background: '#E5F5E5', padding: '16px', border: '1px solid #ACA899', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>⏬ Load Existing DB Data:</label>
                      <button className="btn" onClick={loadExistingData} disabled={loadingData || !selectedTable || columns.length === 0} style={{ padding: '4px 16px', fontWeight: 'bold' }}>
                        {loadingData ? 'Loading...' : 'Fetch Top 100 Rows'}
                      </button>
                      <div style={{ fontSize: '10px', color: '#666', marginTop: '8px', textAlign: 'center' }}>
                        Pull data to edit directly.
                      </div>
                    </div>
                  </div>
                </div>

                {csvHeaders.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ padding: '8px', background: '#E5F5E5', border: '1px solid #ACA899', color: 'green', fontSize: '11px', fontWeight: 'bold', marginBottom: '8px' }}>
                      ✅ Data Loaded: {csvData.length} rows with {csvHeaders.length} columns.
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '11px' }}>Data Preview & Editor:</div>
                        <button 
                          className="btn" 
                          onClick={() => {
                            const newRow: any = {};
                            csvHeaders.forEach(h => newRow[h] = '');
                            setCsvData([newRow, ...csvData]);
                          }}
                          style={{ padding: '2px 8px', fontSize: '11px', background: '#D4D0C8' }}
                        >
                          ➕ Add Row
                        </button>
                      </div>
                      
                      {csvData.length > 100 && (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '11px' }}>
                          <span>Page {editorPage + 1} of {Math.ceil(csvData.length / 100)}</span>
                          <button 
                            className="btn" 
                            disabled={editorPage === 0}
                            onClick={() => setEditorPage(p => p - 1)}
                            style={{ padding: '2px 8px', fontSize: '11px' }}
                          >
                            &lt; Prev
                          </button>
                          <button 
                            className="btn" 
                            disabled={(editorPage + 1) * 100 >= csvData.length}
                            onClick={() => setEditorPage(p => p + 1)}
                            style={{ padding: '2px 8px', fontSize: '11px' }}
                          >
                            Next &gt;
                          </button>
                        </div>
                      )}
                    </div>

                    <div style={{ maxHeight: '300px', overflow: 'auto', border: '1px solid #ACA899', background: '#FFF' }}>
                      <table style={{ width: 'max-content', borderCollapse: 'collapse', fontSize: '11px' }}>
                        <thead style={{ background: '#EBEBEB', position: 'sticky', top: 0, zIndex: 1 }}>
                          <tr>
                            <th style={{ border: '1px solid #ACA899', padding: '4px', background: '#D4D0C8' }}>#</th>
                            <th style={{ border: '1px solid #ACA899', padding: '4px', background: '#D4D0C8' }}>Actions</th>
                            {csvHeaders.map(h => (
                              <th key={h} style={{ border: '1px solid #ACA899', padding: '4px', background: '#D4D0C8' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {csvData.slice(editorPage * 100, (editorPage + 1) * 100).map((row: any, mapIdx: number) => {
                            const rIdx = editorPage * 100 + mapIdx;
                            return (
                              <tr key={rIdx}>
                                <td style={{ border: '1px solid #ACA899', padding: '4px', background: '#EBEBEB', textAlign: 'center', color: '#666' }}>{rIdx + 1}</td>
                                <td style={{ border: '1px solid #ACA899', padding: '4px', background: '#EBEBEB', textAlign: 'center' }}>
                                  <button 
                                    className="btn" 
                                    onClick={() => { setEditingRowIdx(rIdx); setEditFormData({...row}); }} 
                                    style={{ fontSize: '10px', padding: '2px 4px' }}
                                  >
                                    ✏️ Edit
                                  </button>
                                </td>
                                {csvHeaders.map(h => {
                                  let dbCol = columns.find(c => c.column_name === h || c.column_name === h.toLowerCase());
                                  if (!dbCol) {
                                    const snake = h.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
                                    dbCol = columns.find(c => c.column_name === snake);
                                  }
                                  const isEnum = dbCol && dbCol.enum_values && Array.isArray(dbCol.enum_values) && dbCol.enum_values.length > 0;
                                  const fkKey = dbCol && dbCol.foreign_key ? `${dbCol.foreign_key.table}.${dbCol.foreign_key.column}` : '';
                                  const fkOptionsList = fkKey ? fkOptions[fkKey] : null;

                                  const isUuidCol = dbCol && (dbCol.data_type === 'uuid' || dbCol.column_name.toLowerCase().includes('uuid'));
                                  const isInvalidUuid = isUuidCol && row[h] && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(row[h].trim());

                                  const isBoolean = dbCol && dbCol.data_type === 'boolean';

                                  const fkError = validationErrors[rIdx]?.[h];
                                  const hasError = isInvalidUuid || !!fkError;
                                  const errorMessage = isInvalidUuid ? 'Invalid UUID format' : (fkError || '');

                                  return (
                                    <td key={h} style={{ border: '1px solid #ACA899', padding: 0 }}>
                                      {isEnum ? (
                                        <select 
                                          value={row[h] || ''} 
                                          onChange={(e) => {
                                            const newData = [...csvData];
                                            newData[rIdx] = { ...newData[rIdx], [h]: e.target.value };
                                            setCsvData(newData);
                                          }}
                                          style={{ 
                                            width: '100%', 
                                            minWidth: '80px',
                                            border: 'none', 
                                            padding: '4px', 
                                            fontSize: '11px',
                                            background: '#E5F5E5',
                                            outline: 'none',
                                            cursor: 'pointer'
                                          }}
                                        >
                                          <option value="">-- Select Enum --</option>
                                          {dbCol.enum_values.map((ev: string) => (
                                            <option key={ev} value={ev}>{ev}</option>
                                          ))}
                                        </select>
                                      ) : fkOptionsList ? (
                                        <select 
                                          value={row[h] || ''} 
                                          title={errorMessage}
                                          onChange={(e) => {
                                            const newData = [...csvData];
                                            newData[rIdx] = { ...newData[rIdx], [h]: e.target.value };
                                            setCsvData(newData);
                                            // clear error on change
                                            if (validationErrors[rIdx]?.[h]) {
                                              setValidationErrors(prev => {
                                                const rowErrs = { ...prev[rIdx] };
                                                delete rowErrs[h];
                                                return { ...prev, [rIdx]: rowErrs };
                                              });
                                            }
                                          }}
                                          style={{ 
                                            width: '100%', 
                                            minWidth: '80px',
                                            border: 'none', 
                                            padding: '4px', 
                                            fontSize: '11px',
                                            background: hasError ? '#FFEEEE' : '#E5F5E5',
                                            color: '#000',
                                            outline: hasError ? '1px solid red' : 'none',
                                            cursor: 'pointer'
                                          }}
                                        >
                                          <option value="">-- Select {dbCol.foreign_key.table} --</option>
                                          {fkOptionsList.map((opt, i) => {
                                            const displayKey = Object.keys(opt).find(k => ['name', 'title', 'description', 'email'].includes(k.toLowerCase())) || dbCol.foreign_key.column;
                                            const displayVal = opt[displayKey];
                                            const isDifferent = displayKey !== dbCol.foreign_key.column && displayVal;
                                            return (
                                              <option key={i} value={opt[dbCol.foreign_key.column]}>
                                                {opt[dbCol.foreign_key.column]} {isDifferent ? `- ${displayVal}` : ''}
                                              </option>
                                            )
                                          })}
                                        </select>
                                      ) : isBoolean ? (
                                        <select 
                                          value={row[h] === true ? 'true' : row[h] === false ? 'false' : row[h] || ''} 
                                          onChange={(e) => {
                                            const newData = [...csvData];
                                            newData[rIdx] = { ...newData[rIdx], [h]: e.target.value };
                                            setCsvData(newData);
                                          }}
                                          style={{ 
                                            width: '100%', 
                                            minWidth: '80px',
                                            border: 'none', 
                                            padding: '4px', 
                                            fontSize: '11px',
                                            background: '#E5F5E5',
                                            color: '#000',
                                            outline: 'none',
                                            cursor: 'pointer'
                                          }}
                                        >
                                          <option value="">-- Select --</option>
                                          <option value="true">True</option>
                                          <option value="false">False</option>
                                        </select>
                                      ) : (
                                        <input 
                                          type="text" 
                                          value={row[h] || ''} 
                                          title={errorMessage}
                                          onChange={(e) => {
                                            const newData = [...csvData];
                                            newData[rIdx] = { ...newData[rIdx], [h]: e.target.value };
                                            setCsvData(newData);
                                            // clear error on change
                                            if (validationErrors[rIdx]?.[h]) {
                                              setValidationErrors(prev => {
                                                const rowErrs = { ...prev[rIdx] };
                                                delete rowErrs[h];
                                                return { ...prev, [rIdx]: rowErrs };
                                              });
                                            }
                                          }}
                                          style={{ 
                                            width: '100%', 
                                            minWidth: '80px',
                                            border: 'none', 
                                            padding: '4px', 
                                            fontSize: '11px',
                                            background: hasError ? '#FFEEEE' : 'transparent',
                                            color: hasError ? 'red' : '#000',
                                            outline: hasError ? '1px solid red' : 'none'
                                          }}
                                          onFocus={e => { if(!hasError) { e.target.style.background = '#FFFFE1'; e.target.style.color = '#000'; } }}
                                          onBlur={async (e) => {
                                            if (!hasError) { e.target.style.background = 'transparent'; }
                                            
                                            // FK Validation
                                            if (dbCol && dbCol.foreign_key && e.target.value && !isInvalidUuid) {
                                              try {
                                                const res = await fetch('/api/db/validate-exists', {
                                                  method: 'POST',
                                                  headers: { 'Content-Type': 'application/json' },
                                                  body: JSON.stringify({
                                                    connectionString: connectionMode === 'string' ? connectionString : undefined,
                                                    dbConfig: connectionMode === 'fields' ? { ...dbConfig, port: Number(dbConfig.port) } : undefined,
                                                    schema,
                                                    table: dbCol.foreign_key.table,
                                                    column: dbCol.foreign_key.column,
                                                    value: e.target.value.trim()
                                                  })
                                                });
                                                const data = await res.json();
                                                setValidationErrors(prev => {
                                                  const rowErrs = prev[rIdx] || {};
                                                  if (data.success && !data.exists) {
                                                    return { ...prev, [rIdx]: { ...rowErrs, [h]: `Record not found in ${dbCol.foreign_key.table}` } };
                                                  } else {
                                                    const newRowErrs = { ...rowErrs };
                                                    delete newRowErrs[h];
                                                    return { ...prev, [rIdx]: newRowErrs };
                                                  }
                                                });
                                              } catch (err) {
                                                console.error('Validation error', err);
                                              }
                                            }
                                          }}
                                        />
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="flex justify-between border-t" style={{ paddingTop: '16px', borderTop: '1px solid #ACA899' }}>
                  <button className="btn" onClick={() => setStep(1)}>{'< Back'}</button>
                  <button className="btn btn-primary" onClick={goToMapping} disabled={!selectedTable || csvHeaders.length === 0}>
                    Next {'>'}
                  </button>
                </div>

                {/* Edit Modal */}
                {editingRowIdx !== null && editFormData && (
                  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div className="xp-window" style={{ width: '400px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                      <div className="xp-titlebar">
                        <span>Edit Record #{editingRowIdx + 1}</span>
                        <div className="xp-titlebar-buttons">
                          <div className="xp-titlebar-btn" onClick={() => setEditingRowIdx(null)}>X</div>
                        </div>
                      </div>
                      <div className="xp-content" style={{ overflow: 'auto', background: '#ECE9D8', flex: 1, padding: '16px' }}>
                        <div style={{ display: 'grid', gap: '8px' }}>
                          {csvHeaders.map(h => {
                            let dbCol = columns.find(c => c.column_name === h || c.column_name === h.toLowerCase());
                            if (!dbCol) {
                              const snake = h.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
                              dbCol = columns.find(c => c.column_name === snake);
                            }
                            const isEnum = dbCol && dbCol.enum_values && Array.isArray(dbCol.enum_values) && dbCol.enum_values.length > 0;
                            const fkKey = dbCol && dbCol.foreign_key ? `${dbCol.foreign_key.table}.${dbCol.foreign_key.column}` : '';
                            const fkOptionsList = fkKey ? fkOptions[fkKey] : null;
                            const isBoolean = dbCol && dbCol.data_type === 'boolean';

                            return (
                              <div key={h}>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '2px' }}>{h}</label>
                                {isEnum ? (
                                  <select 
                                    value={editFormData[h] || ''} 
                                    onChange={(e) => setEditFormData({...editFormData, [h]: e.target.value})}
                                    style={{ width: '100%', padding: '4px', fontSize: '11px' }}
                                  >
                                    <option value="">-- Select Enum --</option>
                                    {dbCol.enum_values.map((ev: string) => <option key={ev} value={ev}>{ev}</option>)}
                                  </select>
                                ) : fkOptionsList ? (
                                  <select 
                                    value={editFormData[h] || ''} 
                                    onChange={(e) => setEditFormData({...editFormData, [h]: e.target.value})}
                                    style={{ width: '100%', padding: '4px', fontSize: '11px' }}
                                  >
                                    <option value="">-- Select {dbCol.foreign_key.table} --</option>
                                    {fkOptionsList.map((opt, i) => {
                                      const displayKey = Object.keys(opt).find(k => ['name', 'title', 'description', 'email'].includes(k.toLowerCase())) || dbCol.foreign_key.column;
                                      const displayVal = opt[displayKey];
                                      const isDifferent = displayKey !== dbCol.foreign_key.column && displayVal;
                                      return (
                                        <option key={i} value={opt[dbCol.foreign_key.column]}>
                                          {opt[dbCol.foreign_key.column]} {isDifferent ? `- ${displayVal}` : ''}
                                        </option>
                                      )
                                    })}
                                  </select>
                                ) : isBoolean ? (
                                  <select 
                                    value={editFormData[h] === true ? 'true' : editFormData[h] === false ? 'false' : editFormData[h] || ''} 
                                    onChange={(e) => setEditFormData({...editFormData, [h]: e.target.value})}
                                    style={{ width: '100%', padding: '4px', fontSize: '11px' }}
                                  >
                                    <option value="">-- Select --</option>
                                    <option value="true">True</option>
                                    <option value="false">False</option>
                                  </select>
                                ) : (
                                  <input 
                                    type="text" 
                                    value={editFormData[h] || ''} 
                                    onChange={(e) => setEditFormData({...editFormData, [h]: e.target.value})}
                                    style={{ width: '100%', padding: '4px', fontSize: '11px', border: '1px solid #ACA899' }}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #ACA899' }}>
                          <button className="btn" onClick={() => setEditingRowIdx(null)}>Cancel</button>
                          <button className="btn btn-primary" onClick={() => {
                            const newData = [...csvData];
                            newData[editingRowIdx] = editFormData;
                            setCsvData(newData);
                            setEditingRowIdx(null);
                          }}>Save</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                  </>
                )}
              </div>
            )}

{step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <h3 style={{ marginTop: 0, borderBottom: '1px solid #ACA899', paddingBottom: '8px' }}>
                  {wizardMode === 'csv' ? 'Map Columns' : 'Build Entity Data'}
                </h3>
                
                {wizardMode === 'entity' ? (
                  <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
                    <p style={{ fontSize: '11px', marginBottom: '16px' }}>Configure <b>{selectedRootEntity}</b> records.</p>
                    
                    <div style={{ display: 'flex', gap: '16px', flex: 1, overflow: 'hidden' }}>
                      {/* Left: List of saved records */}
                      <div style={{ width: '250px', background: '#FFF', border: '1px solid #ACA899', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '8px', borderBottom: '1px solid #ACA899', background: '#ECE9D8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong>Saved Records ({entityFormDataList.length})</strong>
                          <button className="btn" style={{ fontSize: '10px' }} onClick={() => {
                            setActiveRecordIndex(null);
                            setActiveRecordData({});
                          }}>+ New</button>
                        </div>
                        <div style={{ flex: 1, overflow: 'auto', padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {entityFormDataList.map((data, idx) => (
                            <div 
                              key={idx} 
                              style={{ 
                                padding: '8px', 
                                border: '1px solid #CCC', 
                                cursor: 'pointer',
                                background: activeRecordIndex === idx ? '#E0EEF9' : '#FFF',
                                fontSize: '11px'
                              }}
                              onClick={() => {
                                setActiveRecordIndex(idx);
                                setActiveRecordData(data);
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <strong>Record #{idx + 1}</strong>
                                <span style={{ color: 'red', fontWeight: 'bold' }} onClick={(e) => {
                                  e.stopPropagation();
                                  const arr = [...entityFormDataList];
                                  arr.splice(idx, 1);
                                  setEntityFormDataList(arr);
                                  if (activeRecordIndex === idx) {
                                    setActiveRecordIndex(null);
                                    setActiveRecordData({});
                                  } else if (activeRecordIndex !== null && activeRecordIndex > idx) {
                                    setActiveRecordIndex(activeRecordIndex - 1);
                                  }
                                }}>X</span>
                              </div>
                            </div>
                          ))}
                          {entityFormDataList.length === 0 && (
                            <div style={{ color: '#888', fontSize: '10px', textAlign: 'center', marginTop: '16px' }}>No records yet.</div>
                          )}
                        </div>
                      </div>

                      {/* Right: Active Form */}
                      <div style={{ flex: 1, background: '#FFF', border: '1px solid #ACA899', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '8px', borderBottom: '1px solid #ACA899', background: '#ECE9D8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong>{activeRecordIndex !== null ? `Editing Record #${activeRecordIndex + 1}` : 'New Record'}</strong>
                          <button className="btn btn-primary" style={{ fontSize: '10px' }} onClick={() => {
                            if (activeRecordIndex !== null) {
                              const arr = [...entityFormDataList];
                              arr[activeRecordIndex] = activeRecordData;
                              setEntityFormDataList(arr);
                            } else {
                              setEntityFormDataList([...entityFormDataList, activeRecordData]);
                            }
                            setActiveRecordIndex(null);
                            setActiveRecordData({});
                          }}>💾 Save to List</button>
                        </div>
                        <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
                          <EntityForm 
                            entityName={selectedRootEntity} 
                            entities={entities} 
                            formData={activeRecordData} 
                            onChange={setActiveRecordData} 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between border-t" style={{ paddingTop: '16px', borderTop: '1px solid #ACA899', marginTop: '16px' }}>
                      <button className="btn" onClick={() => setStep(2)}>{'< Back'}</button>
                      <button className="btn btn-primary" onClick={performEntityExport} disabled={entityFormDataList.length === 0}>
                        Generate SQL {'>'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                <p style={{ fontSize: '11px' }}>Table: <b>{selectedTable}</b>. We auto-mapped columns where possible.</p>
                
                <div style={{ flex: 1, overflow: 'auto', background: '#FFFFFF', border: '1px solid #ACA899', marginBottom: '16px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead style={{ background: '#EBEBEB', borderBottom: '1px solid #ACA899' }}>
                      <tr>
                        <th style={{ padding: '4px', textAlign: 'left', borderRight: '1px solid #ACA899' }}>CSV Header</th>
                        <th style={{ padding: '4px', textAlign: 'left' }}>Maps To (DB Column)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvHeaders.map(header => (
                        <tr key={header} style={{ borderBottom: '1px solid #EBEBEB' }}>
                          <td style={{ padding: '4px', borderRight: '1px solid #ACA899', fontWeight: 'bold' }}>{header}</td>
                          <td style={{ padding: '4px' }}>
                            <select 
                              value={mapping[header] || ''} 
                              onChange={e => setMapping({...mapping, [header]: e.target.value})}
                              style={{ width: '100%', background: mapping[header] && mapping[header] !== 'SKIP' ? '#E5F5E5' : '#FFF' }}
                            >
                              <option value="SKIP">-- Skip / Do Not Map --</option>
                              {columns.map(c => (
                                <option key={c.column_name} value={c.column_name}>{c.column_name} ({c.data_type})</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ marginBottom: '16px', border: '1px solid #ACA899', padding: '8px', background: '#FFFFE1' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '4px' }}>🪄 Auto-Generate Missing IDs (UUIDv4)</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {columns.filter(c => c.column_name.includes('uuid') || c.column_name.includes('id')).map(c => (
                      <label key={c.column_name} style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input 
                          type="checkbox" 
                          checked={generateUuidFor[c.column_name] || false}
                          onChange={e => setGenerateUuidFor({...generateUuidFor, [c.column_name]: e.target.checked})}
                        />
                        {c.column_name}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between border-t" style={{ paddingTop: '16px', borderTop: '1px solid #ACA899' }}>
                  <button className="btn" onClick={() => setStep(2)}>{'< Back'}</button>
                  <button className="btn btn-primary" onClick={performExport}>
                    Generate Seed {'>'}
                  </button>
                </div>
                  </>
                )}
              </div>
            )}

            {step === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                <h3 style={{ marginTop: 0, borderBottom: '1px solid #ACA899', paddingBottom: '8px' }}>Finished! 🎉</h3>
                <p style={{ fontSize: '11px' }}>Your seed data is ready. You can copy the JSON array or direct SQL INSERT statements.</p>
                
                <div style={{ display: 'flex', flex: 1, gap: '16px', overflow: 'hidden', marginBottom: '16px' }}>
                  
                  {/* JSON Output */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>JSON Data</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => { navigator.clipboard.writeText(exportedJson); alert('JSON Copied!'); }} style={{ fontSize: '10px', cursor: 'pointer' }}>📋 Copy</button>
                        <button onClick={() => {
                          const blob = new Blob([exportedJson], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${selectedTable || 'data'}_seed.json`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }} style={{ fontSize: '10px', cursor: 'pointer' }}>💾 Download</button>
                      </div>
                    </div>
                    <textarea 
                      value={exportedJson} 
                      readOnly 
                      style={{ flex: 1, fontFamily: 'monospace', width: '100%', border: '1px solid #ACA899', resize: 'none', whiteSpace: 'pre' }} 
                    />
                  </div>

                  {/* SQL Output */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>SQL INSERT Statements</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => { navigator.clipboard.writeText(exportedSql); alert('SQL Copied!'); }} style={{ fontSize: '10px', cursor: 'pointer' }}>📋 Copy</button>
                        <button onClick={() => {
                          const blob = new Blob([exportedSql], { type: 'text/sql' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${selectedTable || 'data'}_seed.sql`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }} style={{ fontSize: '10px', cursor: 'pointer' }}>💾 Download</button>
                      </div>
                    </div>
                    <textarea 
                      value={exportedSql} 
                      readOnly 
                      style={{ flex: 1, fontFamily: 'monospace', width: '100%', border: '1px solid #ACA899', resize: 'none', whiteSpace: 'pre', background: '#F4F4F4' }} 
                    />
                  </div>

                </div>

                <div className="flex justify-between border-t" style={{ paddingTop: '16px', borderTop: '1px solid #ACA899', alignItems: 'center' }}>
                  <button className="btn" onClick={() => setStep(3)}>{'< Back'}</button>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    {executeResult && <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{executeResult}</span>}
                    <button className="btn btn-primary" onClick={handleExecuteSql} disabled={executing}>
                      {executing ? 'Executing...' : 'Execute SQL to Database 🚀'}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
