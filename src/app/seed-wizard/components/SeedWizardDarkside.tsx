
import React, { useState } from 'react';
import { SeedWizardProps } from './types';
import { EntityForm } from '../EntityForm';
import { FolderTree, FolderNode } from './helpers';

export default function SeedWizardDarkside(props: SeedWizardProps) {
  const {
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
  } = props;

  
  return (
    <div className="app-window" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--app-border)' }} style={{ height: '100%', maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
      <div className="app-titlebar" style={{ background: 'var(--app-panel)', color: 'var(--app-text)', padding: '16px', fontSize: '14px', borderBottom: '1px solid var(--app-border)' }}>
        <span>CSV to Seed Wizard 🪄</span>
        <div className="app-titlebar-buttons">
          <div className="app-titlebar-btn">X</div>
        </div>
      </div>

      <div className="app-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: 0 }}>
        
        {/* Mode Toggle */}
        <div style={{ padding: '8px', borderBottom: '1px solid var(--app-border)', background: 'var(--app-bg)', display: 'flex', gap: '16px', alignItems: 'center' }}>
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
          <div style={{ width: '150px', background: 'var(--app-blue-dark)', color: 'white', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', fontWeight: 'bold' }}>
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
          <div style={{ flex: 1, padding: '24px', background: 'var(--app-bg)', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
            
            {step === 1 && (
              <div>
                <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--app-border)', paddingBottom: '8px' }}>
                  {wizardMode === 'csv' ? 'Connect to PostgreSQL' : 'Database & Entity Setup'}
                </h3>
                <p style={{ fontSize: '11px', marginBottom: '16px' }}>
                  {wizardMode === 'csv' 
                    ? 'Provide connection details to introspect your Core HR database.' 
                    : 'Configure DB and point to your TypeORM entities folder to generate the relationship graph.'}
                </p>

                {wizardMode === 'entity' && (
                  <div style={{ marginBottom: '24px', padding: '12px', background: 'var(--app-window-bg)', border: '1px solid var(--app-border)', borderRadius: '8px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>TypeORM Entities Directory Path:</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="text" 
                        style={{ flex: 1, padding: '4px' }} 
                        value={entityDirPath} 
                        onChange={e => setEntityDirPath(e.target.value)} 
                        placeholder="/path/to/entities" 
                      />
                      <button className="btn" style={{ borderRadius: '6px', padding: '6px 12px' }} onClick={scanEntities} disabled={scanningEntities}>
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
                      <div style={{ marginTop: '16px', background: 'var(--app-panel)', padding: '16px', border: '1px solid var(--app-border)', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h4 style={{ margin: 0, fontSize: '12px' }}>Scan Summary (Join Depths)</h4>
                          <button className="btn" style={{ borderRadius: '6px', padding: '6px 12px' }} style={{ fontSize: '10px' }} onClick={() => {
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
                                <div style={{ fontSize: '10px', maxHeight: '150px', overflow: 'auto', background: 'var(--app-window-bg)', padding: '4px', border: '1px solid var(--app-border)', borderRadius: '8px' }}>
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

                <div className="flex justify-end border-t" style={{ paddingTop: '16px', borderTop: '1px solid var(--app-border)' }}>
                  <button className="btn btn-primary" style={{ borderRadius: '6px', padding: '6px 16px', background: 'var(--app-blue)' }} onClick={handleConnect} disabled={connecting || (wizardMode === 'entity' && entities.length === 0)}>
                    Next {'>'}
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--app-border)', paddingBottom: '8px' }}>
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

                    <div className="flex justify-end border-t" style={{ paddingTop: '16px', borderTop: '1px solid var(--app-border)', marginTop: '24px' }}>
                      <button className="btn" style={{ borderRadius: '6px', padding: '6px 12px' }} onClick={() => setStep(1)}>{'< Back'}</button>
                      <button className="btn btn-primary" style={{ borderRadius: '6px', padding: '6px 16px', background: 'var(--app-blue)' }} onClick={() => {
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
                      <button className="btn" style={{ borderRadius: '6px', padding: '6px 12px' }} style={{ width: '80px', marginLeft: '8px' }} onClick={() => fetchColumnsForTable(selectedTable)} disabled={!selectedTable || fetchingCols}>
                        Load
                      </button>
                    </div>
                  )}
                  {fetchingCols && <div style={{ fontSize: '11px', color: 'blue', marginTop: '4px' }}>Fetching columns...</div>}
                </div>

                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                  {/* Left Box: Templates */}
                  <div style={{ flex: 1, background: 'var(--app-window-bg)', padding: '16px', border: '1px solid var(--app-border)', borderRadius: '8px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '8px' }}>🗂️ Browse Built-in Templates:</label>
                    {loadingTemplates ? (
                      <div style={{ fontSize: '11px', color: 'blue' }}>Loading templates...</div>
                    ) : (
                      <div style={{ height: '300px', overflowY: 'auto', border: '1px solid var(--app-panel)', padding: '4px' }}>
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
                    <div style={{ background: 'var(--app-window-bg)', padding: '16px', border: '1px solid var(--app-border)', borderRadius: '8px' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '8px' }}>📂 Upload Local CSV File:</label>
                      <input type="file" accept=".csv" onChange={handleFileUpload} style={{ width: '100%', fontSize: '11px' }} />
                    </div>

                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '16px', border: '1px solid var(--app-border)', borderRadius: '8px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>⏬ Load Existing DB Data:</label>
                      <button className="btn" style={{ borderRadius: '6px', padding: '6px 12px' }} onClick={loadExistingData} disabled={loadingData || !selectedTable || columns.length === 0} style={{ padding: '4px 16px', fontWeight: 'bold' }}>
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
                    <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--app-border)', borderRadius: '8px', color: 'green', fontSize: '11px', fontWeight: 'bold', marginBottom: '8px' }}>
                      ✅ Data Loaded: {csvData.length} rows with {csvHeaders.length} columns.
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '11px' }}>Data Preview & Editor:</div>
                        <button 
                          className="btn" style={{ borderRadius: '6px', padding: '6px 12px' }} 
                          onClick={() => {
                            const newRow: any = {};
                            csvHeaders.forEach(h => newRow[h] = '');
                            setCsvData([newRow, ...csvData]);
                          }}
                          style={{ padding: '2px 8px', fontSize: '11px', background: 'var(--app-panel)' }}
                        >
                          ➕ Add Row
                        </button>
                      </div>
                      
                      {csvData.length > 100 && (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '11px' }}>
                          <span>Page {editorPage + 1} of {Math.ceil(csvData.length / 100)}</span>
                          <button 
                            className="btn" style={{ borderRadius: '6px', padding: '6px 12px' }} 
                            disabled={editorPage === 0}
                            onClick={() => setEditorPage(p => p - 1)}
                            style={{ padding: '2px 8px', fontSize: '11px' }}
                          >
                            &lt; Prev
                          </button>
                          <button 
                            className="btn" style={{ borderRadius: '6px', padding: '6px 12px' }} 
                            disabled={(editorPage + 1) * 100 >= csvData.length}
                            onClick={() => setEditorPage(p => p + 1)}
                            style={{ padding: '2px 8px', fontSize: '11px' }}
                          >
                            Next &gt;
                          </button>
                        </div>
                      )}
                    </div>

                    <div style={{ maxHeight: '300px', overflow: 'auto', border: '1px solid var(--app-border)', borderRadius: '8px', background: 'var(--app-window-bg)' }}>
                      <table style={{ width: 'max-content', borderCollapse: 'collapse', fontSize: '11px' }}>
                        <thead style={{ background: 'var(--app-panel)', position: 'sticky', top: 0, zIndex: 1 }}>
                          <tr>
                            <th style={{ border: '1px solid var(--app-border)', borderRadius: '8px', padding: '4px', background: 'var(--app-panel)' }}>#</th>
                            <th style={{ border: '1px solid var(--app-border)', borderRadius: '8px', padding: '4px', background: 'var(--app-panel)' }}>Actions</th>
                            {csvHeaders.map(h => (
                              <th key={h} style={{ border: '1px solid var(--app-border)', borderRadius: '8px', padding: '4px', background: 'var(--app-panel)' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {csvData.slice(editorPage * 100, (editorPage + 1) * 100).map((row: any, mapIdx: number) => {
                            const rIdx = editorPage * 100 + mapIdx;
                            return (
                              <tr key={rIdx}>
                                <td style={{ border: '1px solid var(--app-border)', borderRadius: '8px', padding: '4px', background: 'var(--app-panel)', textAlign: 'center', color: '#666' }}>{rIdx + 1}</td>
                                <td style={{ border: '1px solid var(--app-border)', borderRadius: '8px', padding: '4px', background: 'var(--app-panel)', textAlign: 'center' }}>
                                  <button 
                                    className="btn" style={{ borderRadius: '6px', padding: '6px 12px' }} 
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
                                    <td key={h} style={{ border: '1px solid var(--app-border)', borderRadius: '8px', padding: 0 }}>
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
                                            background: 'rgba(16, 185, 129, 0.1)',
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
                                            background: hasError ? '#FFEEEE' : 'rgba(16, 185, 129, 0.1)',
                                            color: 'var(--app-text)',
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
                                            background: 'rgba(16, 185, 129, 0.1)',
                                            color: 'var(--app-text)',
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
                                            color: hasError ? 'red' : 'var(--app-text)',
                                            outline: hasError ? '1px solid red' : 'none'
                                          }}
                                          onFocus={e => { if(!hasError) { e.target.style.background = 'rgba(245, 158, 11, 0.1)'; e.target.style.color = 'var(--app-text)'; } }}
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

                <div className="flex justify-between border-t" style={{ paddingTop: '16px', borderTop: '1px solid var(--app-border)' }}>
                  <button className="btn" style={{ borderRadius: '6px', padding: '6px 12px' }} onClick={() => setStep(1)}>{'< Back'}</button>
                  <button className="btn btn-primary" style={{ borderRadius: '6px', padding: '6px 16px', background: 'var(--app-blue)' }} onClick={goToMapping} disabled={!selectedTable || csvHeaders.length === 0}>
                    Next {'>'}
                  </button>
                </div>

                {/* Edit Modal */}
                {editingRowIdx !== null && editFormData && (
                  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div className="app-window" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--app-border)' }} style={{ width: '400px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                      <div className="app-titlebar" style={{ background: 'var(--app-panel)', color: 'var(--app-text)', padding: '16px', fontSize: '14px', borderBottom: '1px solid var(--app-border)' }}>
                        <span>Edit Record #{editingRowIdx + 1}</span>
                        <div className="app-titlebar-buttons">
                          <div className="app-titlebar-btn" onClick={() => setEditingRowIdx(null)}>X</div>
                        </div>
                      </div>
                      <div className="app-content" style={{ overflow: 'auto', background: 'var(--app-bg)', flex: 1, padding: '16px' }}>
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
                                    style={{ width: '100%', padding: '4px', fontSize: '11px', border: '1px solid var(--app-border)', borderRadius: '8px' }}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--app-border)' }}>
                          <button className="btn" style={{ borderRadius: '6px', padding: '6px 12px' }} onClick={() => setEditingRowIdx(null)}>Cancel</button>
                          <button className="btn btn-primary" style={{ borderRadius: '6px', padding: '6px 16px', background: 'var(--app-blue)' }} onClick={() => {
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
                <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--app-border)', paddingBottom: '8px' }}>
                  {wizardMode === 'csv' ? 'Map Columns' : 'Build Entity Data'}
                </h3>
                
                {wizardMode === 'entity' ? (
                  <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
                    <p style={{ fontSize: '11px', marginBottom: '16px' }}>Configure <b>{selectedRootEntity}</b> records.</p>
                    
                    <div style={{ display: 'flex', gap: '16px', flex: 1, overflow: 'hidden' }}>
                      {/* Left: List of saved records */}
                      <div style={{ width: '250px', background: 'var(--app-window-bg)', border: '1px solid var(--app-border)', borderRadius: '8px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '8px', borderBottom: '1px solid var(--app-border)', background: 'var(--app-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong>Saved Records ({entityFormDataList.length})</strong>
                          <button className="btn" style={{ borderRadius: '6px', padding: '6px 12px' }} style={{ fontSize: '10px' }} onClick={() => {
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
                                border: '1px solid var(--app-border)', borderRadius: '8px', 
                                cursor: 'pointer',
                                background: activeRecordIndex === idx ? '#E0EEF9' : 'var(--app-window-bg)',
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
                      <div style={{ flex: 1, background: 'var(--app-window-bg)', border: '1px solid var(--app-border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '8px', borderBottom: '1px solid var(--app-border)', background: 'var(--app-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong>{activeRecordIndex !== null ? `Editing Record #${activeRecordIndex + 1}` : 'New Record'}</strong>
                          <button className="btn btn-primary" style={{ borderRadius: '6px', padding: '6px 16px', background: 'var(--app-blue)' }} style={{ fontSize: '10px' }} onClick={() => {
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

                    <div className="flex justify-between border-t" style={{ paddingTop: '16px', borderTop: '1px solid var(--app-border)', marginTop: '16px' }}>
                      <button className="btn" style={{ borderRadius: '6px', padding: '6px 12px' }} onClick={() => setStep(2)}>{'< Back'}</button>
                      <button className="btn btn-primary" style={{ borderRadius: '6px', padding: '6px 16px', background: 'var(--app-blue)' }} onClick={performEntityExport} disabled={entityFormDataList.length === 0}>
                        Generate SQL {'>'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                <p style={{ fontSize: '11px' }}>Table: <b>{selectedTable}</b>. We auto-mapped columns where possible.</p>
                
                <div style={{ flex: 1, overflow: 'auto', background: 'var(--app-window-bg)', border: '1px solid var(--app-border)', borderRadius: '8px', marginBottom: '16px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead style={{ background: 'var(--app-panel)', borderBottom: '1px solid var(--app-border)' }}>
                      <tr>
                        <th style={{ padding: '4px', textAlign: 'left', borderRight: '1px solid var(--app-border)' }}>CSV Header</th>
                        <th style={{ padding: '4px', textAlign: 'left' }}>Maps To (DB Column)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvHeaders.map(header => (
                        <tr key={header} style={{ borderBottom: '1px solid var(--app-panel)' }}>
                          <td style={{ padding: '4px', borderRight: '1px solid var(--app-border)', fontWeight: 'bold' }}>{header}</td>
                          <td style={{ padding: '4px' }}>
                            <select 
                              value={mapping[header] || ''} 
                              onChange={e => setMapping({...mapping, [header]: e.target.value})}
                              style={{ width: '100%', background: mapping[header] && mapping[header] !== 'SKIP' ? 'rgba(16, 185, 129, 0.1)' : 'var(--app-window-bg)' }}
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

                <div style={{ marginBottom: '16px', border: '1px solid var(--app-border)', borderRadius: '8px', padding: '8px', background: 'rgba(245, 158, 11, 0.1)' }}>
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

                <div className="flex justify-between border-t" style={{ paddingTop: '16px', borderTop: '1px solid var(--app-border)' }}>
                  <button className="btn" style={{ borderRadius: '6px', padding: '6px 12px' }} onClick={() => setStep(2)}>{'< Back'}</button>
                  <button className="btn btn-primary" style={{ borderRadius: '6px', padding: '6px 16px', background: 'var(--app-blue)' }} onClick={performExport}>
                    Generate Seed {'>'}
                  </button>
                </div>
                  </>
                )}
              </div>
            )}

            {step === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--app-border)', paddingBottom: '8px' }}>Finished! 🎉</h3>
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
                      style={{ flex: 1, fontFamily: 'monospace', width: '100%', border: '1px solid var(--app-border)', borderRadius: '8px', resize: 'none', whiteSpace: 'pre' }} 
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
                      style={{ flex: 1, fontFamily: 'monospace', width: '100%', border: '1px solid var(--app-border)', borderRadius: '8px', resize: 'none', whiteSpace: 'pre', background: 'var(--app-panel)' }} 
                    />
                  </div>

                </div>

                <div className="flex justify-between border-t" style={{ paddingTop: '16px', borderTop: '1px solid var(--app-border)', alignItems: 'center' }}>
                  <button className="btn" style={{ borderRadius: '6px', padding: '6px 12px' }} onClick={() => setStep(3)}>{'< Back'}</button>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    {executeResult && <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{executeResult}</span>}
                    <button className="btn btn-primary" style={{ borderRadius: '6px', padding: '6px 16px', background: 'var(--app-blue)' }} onClick={handleExecuteSql} disabled={executing}>
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

