import React from 'react';
import { TenantCompareProps } from './types';

export default function TenantCompareXP({
  schema,
  dbRows,
  csvRows,
  comparison,
  finalError,
  handleFileUpload
}: TenantCompareProps) {
  return (
    <div className="app-window" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div className="app-titlebar">
        <span>🏢 Tenant Config Checker ({schema})</span>
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
        <div style={{ background: 'var(--app-window-bg)', padding: '12px', border: '1px solid var(--app-border)', flexShrink: 0, display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label style={{ fontWeight: 'bold' }}>Upload CSV:</label>
          <input type="file" accept=".csv" onChange={handleFileUpload} />
        </div>

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
                <th>Module</th>
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
                  style = { background: 'rgba(245, 158, 11, 0.1)', borderColor: '#E59700', color: '#B37600' };
                }

                return (
                  <tr key={idx}>
                    <td>{row.module}</td>
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

      </div>
    </div>
  );
}
