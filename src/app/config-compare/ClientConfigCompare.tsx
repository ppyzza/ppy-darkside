'use client';

import { useState } from 'react';
import Papa from 'papaparse';

export default function ClientConfigCompare({
  tenants,
  dbRows,
  selectedTenantId,
  errorMsg
}: {
  tenants: any[];
  dbRows: any[];
  selectedTenantId: string | undefined;
  errorMsg: string;
}) {
  const [csvRows, setCsvRows] = useState<any[]>([]);
  const [comparison, setComparison] = useState<any[]>([]);
  const [clientError, setClientError] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setCsvRows([]);
      setComparison([]);
      return;
    }

    setClientError('');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data;
        setCsvRows(rows);

        const newComparison = rows.map((csvRow: any) => {
          const service = csvRow['Service'];
          const configName = csvRow['ConfigName'];
          const csvValue = csvRow['Value'];
          const status = csvRow['Status'];

          const matchingDbRow = dbRows.find(
            (db) => db.service_name === service && db.config_name === configName
          );

          let dbValue = null;
          let matchStatus = 'Missing in DB';

          if (matchingDbRow) {
            dbValue = matchingDbRow.config_value;
            if (dbValue === csvValue) {
              matchStatus = 'Match';
            } else {
              matchStatus = 'Mismatch';
            }
          }

          return {
            service,
            configName,
            csvValue,
            dbValue,
            csvStatus: status,
            matchStatus
          };
        });

        setComparison(newComparison);
      },
      error: (err) => {
        setClientError(`CSV Parse Error: ${err.message}`);
      }
    });
  };

  const finalError = errorMsg || clientError;

  return (
    <div className="app-window" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div className="app-titlebar">
        <span>⚙️ Database vs CSV Config Checker</span>
        <div className="app-titlebar-buttons">
          <button className="app-titlebar-btn" style={{ fontSize: '10px' }}>_</button>
          <button className="app-titlebar-btn" style={{ fontSize: '10px' }}>□</button>
          <button className="app-titlebar-btn">×</button>
        </div>
      </div>
      <div className="app-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: 0 }}>
        
        {finalError && (
          <div style={{ background: '#FFEBEB', border: '1px solid #CC0000', padding: '8px', color: '#CC0000', flexShrink: 0 }}>
            <strong>Error:</strong> {finalError}
          </div>
        )}

        {/* Top Controls */}
        <div style={{ background: 'var(--app-window-bg)', padding: '12px', border: '1px solid var(--app-border)', flexShrink: 0, display: 'flex', gap: '24px', alignItems: 'center' }}>
          
          <form method="GET" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ fontWeight: 'bold' }}>Select Tenant:</label>
            <select name="tenantId" defaultValue={selectedTenantId || ''} style={{ minWidth: '250px', padding: '4px' }}>
              <option value="" disabled>-- Please select a tenant --</option>
              {tenants.map(t => (
                <option key={t.uuid} value={t.uuid}>{t.tenant_name}</option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary">Fetch DB</button>
          </form>

          {selectedTenantId && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid var(--app-border)', paddingLeft: '24px' }}>
              <label style={{ fontWeight: 'bold' }}>Upload CSV:</label>
              <input type="file" accept=".csv" onChange={handleFileUpload} />
            </div>
          )}

        </div>

        {selectedTenantId ? (
          <>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'var(--app-window-bg)', padding: '8px', border: '1px solid var(--app-border)', flexShrink: 0 }}>
              <div><strong>Total CSV Records:</strong> {csvRows.length}</div>
              <div><strong>Total DB Records:</strong> {dbRows.length}</div>
              <div><strong>Matches:</strong> {comparison.filter(c => c.matchStatus === 'Match').length}</div>
              <div><strong>Mismatches:</strong> {comparison.filter(c => c.matchStatus === 'Mismatch').length}</div>
              <div><strong>Missing in DB:</strong> {comparison.filter(c => c.matchStatus === 'Missing in DB').length}</div>
            </div>

            <div style={{ flex: 1, overflow: 'auto', border: '1px solid var(--app-border)', background: 'var(--app-window-bg)', minHeight: 0 }}>
              <table>
                <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                  <tr>
                    <th>Service</th>
                    <th>Config Name</th>
                    <th>CSV Value</th>
                    <th>DB Value</th>
                    <th>Status (CSV)</th>
                    <th>Match Status</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row, idx) => {
                    let badgeClass = 'badge-gray';
                    let style = {};
                    if (row.matchStatus === 'Match') {
                      badgeClass = 'badge-blue';
                    } else if (row.matchStatus === 'Mismatch') {
                      style = { background: '#FFEEEE', borderColor: '#CC0000', color: '#CC0000' };
                    } else if (row.matchStatus === 'Missing in DB') {
                      style = { background: 'var(--app-window-bg)3E0', borderColor: '#E59700', color: '#B37600' };
                    }

                    return (
                      <tr key={idx}>
                        <td>{row.service}</td>
                        <td>{row.configName}</td>
                        <td style={{ maxWidth: '200px', wordBreak: 'break-all' }}>{row.csvValue || <em>(empty)</em>}</td>
                        <td style={{ maxWidth: '200px', wordBreak: 'break-all' }}>{row.dbValue !== null ? row.dbValue : <em>(null)</em>}</td>
                        <td>{row.csvStatus}</td>
                        <td>
                          <span className={`badge ${badgeClass}`} style={style}>
                            {row.matchStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {comparison.length === 0 && !finalError && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '16px' }}>Please upload a CSV file to see the comparison.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#777', background: 'var(--app-window-bg)', border: '1px solid var(--app-border)' }}>
            Please select a tenant from the dropdown above to view and compare configurations.
          </div>
        )}

      </div>
    </div>
  );
}
