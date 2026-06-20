'use client';

import { useState, useRef } from 'react';
import Papa from 'papaparse';

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
  const [connectionString, setConnectionString] = useState('postgres://postgres:mysecretpassword@localhost:5432/hr_revamp');
  const [schema, setSchema] = useState('corehr');
  const [connecting, setConnecting] = useState(false);
  const [dbError, setDbError] = useState('');
  const [tables, setTables] = useState<string[]>([]);

  // Selection State
  const [selectedTable, setSelectedTable] = useState('');
  const [columns, setColumns] = useState<any[]>([]);
  const [fetchingCols, setFetchingCols] = useState(false);

  // CSV State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [editorPage, setEditorPage] = useState(0);

  // Mapping State (CSV Header -> DB Column)
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [generateUuidFor, setGenerateUuidFor] = useState<Record<string, boolean>>({});

  // Export State
  const [exportedJson, setExportedJson] = useState('');
  const [exportedSql, setExportedSql] = useState('');

  const [templates, setTemplates] = useState<{name: string, sizeKb: string}[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const res = await fetch('/api/csv-templates');
      const data = await res.json();
      if (data.success) {
        setTemplates(data.files || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTemplates(false);
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
        body: JSON.stringify({ connectionString, schema })
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

  const handleTableSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const table = e.target.value;
    setSelectedTable(table);
    if (!table) return;

    setFetchingCols(true);
    try {
      const res = await fetch('/api/db/columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionString, schema, table })
      });
      const data = await res.json();
      if (data.success) {
        setColumns(data.columns);
      }
    } catch (err: any) {
      alert('Error fetching columns: ' + err.message);
    } finally {
      setFetchingCols(false);
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

  return (
    <div className="xp-window" style={{ height: '100%', maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
      <div className="xp-titlebar">
        <span>CSV to Seed Wizard 🪄</span>
        <div className="xp-titlebar-buttons">
          <div className="xp-titlebar-btn">X</div>
        </div>
      </div>

      <div className="xp-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: 0 }}>
        
        {/* Wizard Sidebar & Content layout */}
        <div style={{ display: 'flex', flex: 1 }}>
          
          {/* Left Sidebar Steps */}
          <div style={{ width: '150px', background: '#0A246A', color: 'white', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', fontWeight: 'bold' }}>
            <div style={{ opacity: step === 1 ? 1 : 0.5 }}>1. DB Connection</div>
            <div style={{ opacity: step === 2 ? 1 : 0.5 }}>2. Select Data</div>
            <div style={{ opacity: step === 3 ? 1 : 0.5 }}>3. Column Mapping</div>
            <div style={{ opacity: step === 4 ? 1 : 0.5 }}>4. Finish & Export</div>
          </div>

          {/* Right Content Area */}
          <div style={{ flex: 1, padding: '24px', background: '#ECE9D8', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
            
            {step === 1 && (
              <div>
                <h3 style={{ marginTop: 0, borderBottom: '1px solid #ACA899', paddingBottom: '8px' }}>Connect to PostgreSQL</h3>
                <p style={{ fontSize: '11px', marginBottom: '16px' }}>Provide connection details to introspect your Core HR database.</p>
                
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold' }}>Connection String:</label>
                  <input type="text" style={{ width: '100%' }} value={connectionString} onChange={e => setConnectionString(e.target.value)} />
                </div>
                
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold' }}>Schema:</label>
                  <input type="text" style={{ width: '100%' }} value={schema} onChange={e => setSchema(e.target.value)} />
                </div>

                {dbError && <div style={{ color: 'red', fontWeight: 'bold', marginBottom: '16px' }}>Error: {dbError}</div>}

                <div className="flex justify-end border-t" style={{ paddingTop: '16px', borderTop: '1px solid #ACA899' }}>
                  <button className="btn btn-primary" onClick={handleConnect} disabled={connecting}>
                    {connecting ? 'Connecting...' : 'Next >'}
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h3 style={{ marginTop: 0, borderBottom: '1px solid #ACA899', paddingBottom: '8px' }}>Select Table & Upload Data</h3>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold' }}>Target Database Table:</label>
                  <select style={{ width: '100%' }} value={selectedTable} onChange={handleTableSelect}>
                    <option value="">-- Select a Table --</option>
                    {tables.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {fetchingCols && <div style={{ fontSize: '11px', color: 'blue' }}>Fetching columns...</div>}
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
                  
                  {/* Right Box: Upload */}
                  <div style={{ flex: 1, background: '#FFFFFF', padding: '16px', border: '1px solid #ACA899' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '8px' }}>📂 Upload Local CSV File:</label>
                    <input type="file" accept=".csv" onChange={handleFileUpload} style={{ width: '100%', fontSize: '11px' }} />
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
                                {csvHeaders.map(h => {
                                  let dbCol = columns.find(c => c.column_name === h || c.column_name === h.toLowerCase());
                                  if (!dbCol) {
                                    const snake = h.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
                                    dbCol = columns.find(c => c.column_name === snake);
                                  }
                                  const isEnum = dbCol && dbCol.enum_values && Array.isArray(dbCol.enum_values) && dbCol.enum_values.length > 0;

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
                                      ) : (
                                        <input 
                                          type="text" 
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
                                            background: 'transparent',
                                            outline: 'none'
                                          }}
                                          onFocus={e => e.target.style.background = '#FFFFE1'}
                                          onBlur={e => e.target.style.background = 'transparent'}
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
              </div>
            )}

            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <h3 style={{ marginTop: 0, borderBottom: '1px solid #ACA899', paddingBottom: '8px' }}>Map Columns</h3>
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
                      <button onClick={() => { navigator.clipboard.writeText(exportedJson); alert('JSON Copied!'); }} style={{ fontSize: '10px', cursor: 'pointer' }}>📋 Copy</button>
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
                      <button onClick={() => { navigator.clipboard.writeText(exportedSql); alert('SQL Copied!'); }} style={{ fontSize: '10px', cursor: 'pointer' }}>📋 Copy</button>
                    </div>
                    <textarea 
                      value={exportedSql} 
                      readOnly 
                      style={{ flex: 1, fontFamily: 'monospace', width: '100%', border: '1px solid #ACA899', resize: 'none', whiteSpace: 'pre', background: '#F4F4F4' }} 
                    />
                  </div>

                </div>

                <div className="flex justify-between border-t" style={{ paddingTop: '16px', borderTop: '1px solid #ACA899' }}>
                  <button className="btn" onClick={() => setStep(3)}>{'< Back'}</button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
