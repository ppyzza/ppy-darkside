import React from 'react';
import { TenantCompareProps } from './types';
import { UploadCloud, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function TenantCompareGlass({
  schema,
  dbRows,
  csvRows,
  comparison,
  finalError,
  handleFileUpload
}: TenantCompareProps) {
  const matches = comparison.filter(c => c.matchStatus === 'Match').length;
  const mismatches = comparison.filter(c => c.matchStatus === 'Mismatch').length;
  const missing = comparison.filter(c => c.matchStatus === 'Missing in DB').length;

  return (
    <div style={{ flex: 1, display: 'flex', gap: '20px', padding: '24px', overflow: 'hidden' }}>
      
      {/* Sidebar Panel */}
      <div style={{ 
        width: '300px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '20px',
        background: 'var(--app-window-bg)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--app-border)',
        borderRadius: '24px',
        padding: '24px',
        boxShadow: 'var(--app-shadow)'
      }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px', background: 'linear-gradient(135deg, var(--app-blue), #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Tenant Compare
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--app-text-muted)' }}>Schema: {schema}</p>
        </div>

        {/* Upload Zone */}
        <div style={{ 
          background: 'rgba(255,255,255,0.05)',
          border: '1px dashed var(--app-border)',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center',
          position: 'relative',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <UploadCloud color="var(--app-blue)" />
          </div>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Upload CSV</h3>
          <p style={{ fontSize: '12px', color: 'var(--app-text-muted)' }}>Click or drag file here</p>
          <input 
            type="file" 
            accept=".csv" 
            onChange={handleFileUpload} 
            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
          />
        </div>

        {finalError && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '12px', color: 'var(--app-danger)', fontSize: '12px' }}>
            <strong>Error:</strong> {finalError}
          </div>
        )}

        {/* Overview Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto' }}>
          <h3 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--app-text-muted)' }}>Overview</h3>
          <GlassStat label="Total Records (CSV)" value={csvRows.length} />
          <GlassStat label="Total Records (DB)" value={dbRows.length} />
          <div style={{ height: '1px', background: 'var(--app-border)', margin: '4px 0' }} />
          <GlassStat label="Perfect Matches" value={matches} color="var(--app-success)" />
          <GlassStat label="Mismatches" value={mismatches} color="var(--app-danger)" />
          <GlassStat label="Missing Configs" value={missing} color="var(--app-warning)" />
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ 
        flex: 1, 
        background: 'var(--app-window-bg)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--app-border)',
        borderRadius: '24px',
        boxShadow: 'var(--app-shadow)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {comparison.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--app-text-muted)' }}>
            Please upload a CSV to view the comparison table.
          </div>
        ) : (
          <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                <tr>
                  <th style={{ padding: '0 16px', fontSize: '12px', fontWeight: '500', color: 'var(--app-text-muted)', textAlign: 'left', border: 'none', background: 'transparent' }}>Module</th>
                  <th style={{ padding: '0 16px', fontSize: '12px', fontWeight: '500', color: 'var(--app-text-muted)', textAlign: 'left', border: 'none', background: 'transparent' }}>Configuration</th>
                  <th style={{ padding: '0 16px', fontSize: '12px', fontWeight: '500', color: 'var(--app-text-muted)', textAlign: 'left', border: 'none', background: 'transparent' }}>Comparison</th>
                  <th style={{ padding: '0 16px', fontSize: '12px', fontWeight: '500', color: 'var(--app-text-muted)', textAlign: 'right', border: 'none', background: 'transparent' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, idx) => (
                  <tr key={idx} style={{ 
                    background: 'rgba(255, 255, 255, 0.03)',
                    boxShadow: 'inset 0 0 0 1px var(--app-border)',
                    borderRadius: '12px'
                  }}>
                    <td style={{ padding: '16px', border: 'none', borderRadius: '12px 0 0 12px' }}>
                      <span style={{ background: 'var(--app-panel)', padding: '4px 8px', borderRadius: '6px', fontSize: '12px' }}>
                        {row.module}
                      </span>
                    </td>
                    <td style={{ padding: '16px', border: 'none', fontWeight: '500' }}>{row.configName}</td>
                    <td style={{ padding: '16px', border: 'none' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <span style={{ color: 'var(--app-text-muted)', width: '40px' }}>CSV:</span>
                          <span>{row.csvValue || <em style={{ opacity: 0.5 }}>empty</em>}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <span style={{ color: 'var(--app-text-muted)', width: '40px' }}>DB:</span>
                          <span>{row.dbValue !== null ? row.dbValue : <em style={{ opacity: 0.5 }}>null</em>}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px', border: 'none', textAlign: 'right', borderRadius: '0 12px 12px 0' }}>
                      <GlassStatus status={row.matchStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

function GlassStat({ label, value, color }: { label: string, value: number, color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '13px', color: 'var(--app-text-muted)' }}>{label}</span>
      <span style={{ fontSize: '14px', fontWeight: 'bold', color: color || 'var(--app-text)' }}>{value}</span>
    </div>
  );
}

function GlassStatus({ status }: { status: string }) {
  if (status === 'Match') return <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--app-success)' }}><CheckCircle size={16} /> <span>Match</span></div>;
  if (status === 'Mismatch') return <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--app-danger)' }}><XCircle size={16} /> <span>Mismatch</span></div>;
  return <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--app-warning)' }}><AlertTriangle size={16} /> <span>Missing</span></div>;
}
