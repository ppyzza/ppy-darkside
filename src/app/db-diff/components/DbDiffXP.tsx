
import React from 'react';
import { DbDiffProps } from './types';

export default function DbDiffXP(props: DbDiffProps) {
  const {
    sourceConn, setSourceConn, targetConn, setTargetConn, sourceSchemaName, setSourceSchemaName,
    targetSchemaName, setTargetSchemaName, comparing, error, sourceSchema, targetSchema,
    expandedTables, dataDiffs, handleCompareData, handleCompare, toggleTable
  } = props;

  // Render Logic
  let diffContent = null;
  let sqlMigration = '';

  if (sourceSchema && targetSchema) {
    const allTables = Array.from(new Set([...Object.keys(sourceSchema), ...Object.keys(targetSchema)])).sort();
    
    diffContent = allTables.map(tableName => {
      const srcCols = sourceSchema[tableName];
      const tgtCols = targetSchema[tableName];

      // Table Missing Checks
      if (!srcCols) {
        

  return (
          <div key={tableName} style={{ marginBottom: '8px', border: '1px solid var(--app-border)', background: '#FFEBEB' }}>
            <div style={{ padding: '4px 8px', fontWeight: 'bold', color: 'red', fontSize: '11px' }}>
              ❌ Table {tableName} (Exists in Target, Missing in Source)
            </div>
          </div>
        );
      }

      if (!tgtCols) {
        sqlMigration += `-- Table ${tableName} is missing in Target\nCREATE TABLE ${targetSchemaName}."${tableName}" (\n  ${srcCols.map(c => `"${c.column_name}" ${c.data_type}`).join(',\n  ')}\n);\n\n`;
        return (
          <div key={tableName} style={{ marginBottom: '8px', border: '1px solid var(--app-border)', background: 'rgba(16, 185, 129, 0.1)' }}>
            <div style={{ padding: '4px 8px', fontWeight: 'bold', color: 'green', fontSize: '11px' }}>
              ➕ Table {tableName} (New in Source, Missing in Target)
            </div>
          </div>
        );
      }

      // Both Exist, check Columns
      const allCols = Array.from(new Set([...srcCols.map(c => c.column_name), ...tgtCols.map(c => c.column_name)])).sort();
      
      const colDiffs = allCols.map(colName => {
        const sCol = srcCols.find(c => c.column_name === colName);
        const tCol = tgtCols.find(c => c.column_name === colName);

        if (!sCol) {
          // Exists in target but not source
          return <div key={colName} style={{ color: 'red', padding: '2px 16px', fontSize: '11px' }}>- Column <b>{colName}</b> missing in Source</div>;
        }
        if (!tCol) {
          // Exists in source but not target
          sqlMigration += `ALTER TABLE ${targetSchemaName}."${tableName}" ADD COLUMN "${sCol.column_name}" ${sCol.data_type};\n`;
          return <div key={colName} style={{ color: 'green', padding: '2px 16px', fontSize: '11px' }}>+ Column <b>{colName}</b> missing in Target</div>;
        }

        if (sCol.data_type !== tCol.data_type) {
          sqlMigration += `ALTER TABLE ${targetSchemaName}."${tableName}" ALTER COLUMN "${sCol.column_name}" TYPE ${sCol.data_type};\n`;
          return <div key={colName} style={{ color: '#C98A00', padding: '2px 16px', fontSize: '11px' }}>~ Column <b>{colName}</b> type mismatch: Source({sCol.data_type}) vs Target({tCol.data_type})</div>;
        }
        
        return null; // Identical
      }).filter(Boolean);

      const renderDataDiff = () => {
        const dDiff = dataDiffs[tableName];
        if (!dDiff) {
          return (
            <button 
              style={{ marginTop: '4px', fontSize: '10px' }} 
              onClick={(e) => { e.stopPropagation(); handleCompareData(tableName); }}
            >
              🔍 Compare Data (Max 1000 rows)
            </button>
          );
        }
        if (dDiff.loading) return <div style={{ fontSize: '10px', marginTop: '4px' }}>Loading data...</div>;
        if (dDiff.error) return <div style={{ fontSize: '10px', color: 'red', marginTop: '4px' }}>Error: {dDiff.error}</div>;
        if (!dDiff.diff) return null;

        const diffs = dDiff.diff;
        if (diffs.length === 0) return <div style={{ fontSize: '10px', color: 'green', marginTop: '4px' }}>✅ Data is 100% identical.</div>;

        // Generate SQL for Data Diff
        let dataSql = `\n-- Data Migration for ${tableName}\n`;
        const inserts = diffs.filter(d => d.action === 'insert');
        const updates = diffs.filter(d => d.action === 'update');
        const deletes = diffs.filter(d => d.action === 'delete');

        if (inserts.length > 0) {
          const cols = Object.keys(inserts[0].sourceRow);
          dataSql += `INSERT INTO ${targetSchemaName}."${tableName}" (${cols.map(c => `"${c}"`).join(', ')}) VALUES\n`;
          dataSql += inserts.map(i => {
            const vals = cols.map(c => {
              const v = i.sourceRow[c];
              if (v === null || v === undefined) return 'NULL';
              if (typeof v === 'number' || typeof v === 'boolean') return v;
              return `'${String(v).replace(/'/g, "''")}'`;
            });
            return `  (${vals.join(', ')})`;
          }).join(',\n') + ';\n';
        }

        updates.forEach(u => {
          const sets = Object.keys(u.changes).map(c => {
            const v = u.changes[c].source;
            if (v === null || v === undefined) return `"${c}" = NULL`;
            if (typeof v === 'number' || typeof v === 'boolean') return `"${c}" = ${v}`;
            return `"${c}" = '${String(v).replace(/'/g, "''")}'`;
          });
          const wheres = dDiff.pks!.map(pk => {
            const v = u.targetRow[pk];
            if (typeof v === 'number') return `"${pk}" = ${v}`;
            return `"${pk}" = '${String(v).replace(/'/g, "''")}'`;
          });
          dataSql += `UPDATE ${targetSchemaName}."${tableName}" SET ${sets.join(', ')} WHERE ${wheres.join(' AND ')};\n`;
        });

        deletes.forEach(d => {
          const wheres = dDiff.pks!.map(pk => {
            const v = d.targetRow[pk];
            if (typeof v === 'number') return `"${pk}" = ${v}`;
            return `"${pk}" = '${String(v).replace(/'/g, "''")}'`;
          });
          dataSql += `DELETE FROM ${targetSchemaName}."${tableName}" WHERE ${wheres.join(' AND ')};\n`;
        });

        sqlMigration += dataSql;

        return (
          <div style={{ marginTop: '8px', fontSize: '11px', borderTop: '1px solid var(--app-border)', paddingTop: '4px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Data Differences ({diffs.length}):</div>
            <div style={{ color: 'green' }}>➕ {inserts.length} rows to INSERT</div>
            <div style={{ color: '#C98A00' }}>~ {updates.length} rows to UPDATE</div>
            <div style={{ color: 'red' }}>➖ {deletes.length} rows to DELETE</div>
            <div style={{ marginTop: '4px', maxHeight: '100px', overflowY: 'auto', background: '#F9F9F9', padding: '4px', border: '1px solid var(--app-border)' }}>
              {diffs.slice(0, 50).map((d, i) => (
                <div key={i} style={{ marginBottom: '2px' }}>
                  {d.action === 'insert' && <span style={{ color: 'green' }}>[INSERT] PK: {d.pkStr}</span>}
                  {d.action === 'delete' && <span style={{ color: 'red' }}>[DELETE] PK: {d.pkStr}</span>}
                  {d.action === 'update' && <span style={{ color: '#C98A00' }}>[UPDATE] PK: {d.pkStr} ({Object.keys(d.changes).join(', ')} changed)</span>}
                </div>
              ))}
              {diffs.length > 50 && <div>...and {diffs.length - 50} more.</div>}
            </div>
          </div>
        );
      };

      if (colDiffs.length === 0) {
        return (
          <div key={tableName} style={{ marginBottom: '4px' }}>
            <div 
              onClick={() => toggleTable(tableName)}
              style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer', background: 'var(--app-panel)', border: '1px solid var(--app-panel)', display: 'flex', justifyContent: 'space-between' }}
            >
              <span>{expandedTables[tableName] ? '📂' : '📁'} Table {tableName} <span style={{ color: '#888' }}>(Identical Schema)</span></span>
            </div>
            {expandedTables[tableName] && (
              <div style={{ padding: '8px 16px', fontSize: '11px', color: '#666', background: 'var(--app-panel)' }}>
                <div>All {srcCols.length} columns match perfectly.</div>
                {renderDataDiff()}
              </div>
            )}
          </div>
        );
      }

      return (
        <div key={tableName} style={{ marginBottom: '8px', border: '1px solid #C98A00' }}>
          <div 
            onClick={() => toggleTable(tableName)}
            style={{ padding: '4px 8px', fontWeight: 'bold', fontSize: '11px', background: 'var(--app-window-bg)DF0', cursor: 'pointer', color: '#8B6000', display: 'flex', justifyContent: 'space-between' }}
          >
            <span>{expandedTables[tableName] ? '📂' : '📁'} Table {tableName} ({colDiffs.length} differences)</span>
          </div>
          {expandedTables[tableName] && (
            <div style={{ background: 'var(--app-window-bg)', padding: '8px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '4px' }}>Schema Differences:</div>
              {colDiffs}
              {renderDataDiff()}
            </div>
          )}
        </div>
      );
    });

    if (sqlMigration === '') {
      sqlMigration = '-- Schema is completely synced. No differences found!';
    }
  }

  return (
    <div className="app-window" style={{ height: '100%', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
      <div className="app-titlebar">
        <span>Database Diff Wizard ⚖️</span>
        <div className="app-titlebar-buttons">
          <div className="app-titlebar-btn">X</div>
        </div>
      </div>

      <div className="app-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px', background: 'var(--app-bg)', borderBottom: '1px solid var(--app-border)' }}>
          <h3 style={{ marginTop: 0 }}>Select Databases to Compare</h3>
          <div style={{ display: 'flex', gap: '16px' }}>
            
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold' }}>Source Connection (e.g. UAT):</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" style={{ flex: 1, fontSize: '11px' }} value={sourceConn} onChange={e => setSourceConn(e.target.value)} />
                <input type="text" style={{ width: '120px', fontSize: '11px' }} placeholder="Schema" value={sourceSchemaName} onChange={e => setSourceSchemaName(e.target.value)} />
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold' }}>Target Connection (e.g. Local):</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" style={{ flex: 1, fontSize: '11px' }} value={targetConn} onChange={e => setTargetConn(e.target.value)} />
                <input type="text" style={{ width: '120px', fontSize: '11px' }} placeholder="Schema" value={targetSchemaName} onChange={e => setTargetSchemaName(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button className="btn btn-primary" onClick={handleCompare} disabled={comparing}>
                {comparing ? 'Comparing...' : 'Compare ⚖️'}
              </button>
            </div>
          </div>
          {error && <div style={{ color: 'red', fontSize: '11px', marginTop: '8px', fontWeight: 'bold' }}>Error: {error}</div>}
        </div>

        {sourceSchema && targetSchema && (
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            
            {/* Left: Visual Diff Tree */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '2px solid var(--app-border)' }}>
              <div style={{ background: 'var(--app-blue-dark)', color: 'white', padding: '4px 8px', fontSize: '11px', fontWeight: 'bold' }}>Visual Schema Diff</div>
              <div style={{ flex: 1, overflow: 'auto', padding: '8px', background: 'var(--app-window-bg)' }}>
                {diffContent}
              </div>
            </div>

            {/* Right: Generated SQL Migration */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ background: 'var(--app-blue-dark)', color: 'white', padding: '4px 8px', fontSize: '11px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                <span>SQL Migration Script (Apply to Target)</span>
                <button onClick={() => { navigator.clipboard.writeText(sqlMigration); alert('SQL Copied!'); }} style={{ fontSize: '10px', color: 'black' }}>📋 Copy</button>
              </div>
              <textarea 
                readOnly 
                value={sqlMigration} 
                style={{ flex: 1, width: '100%', border: 'none', resize: 'none', padding: '8px', fontFamily: 'monospace', fontSize: '12px', background: 'var(--app-panel)', whiteSpace: 'pre' }}
              />
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
