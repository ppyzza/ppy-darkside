import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { Client } from 'pg';

export default async function TenantComparePage() {
  let dbRows: any[] = [];
  let csvRows: any[] = [];
  let errorMsg = '';
  
  const schema = process.env.DB2_SCHEMA || 'core_t4';

  try {
    // 1. Connect to DB2
    const clientConfig: any = {
      host: process.env.DB2_HOST,
      database: process.env.DB2_NAME,
      user: process.env.DB2_USER,
      password: process.env.DB2_PASSWORD,
      port: process.env.DB2_PORT ? parseInt(process.env.DB2_PORT) : 5432,
    };

    if (process.env.DB2_SSL === 'true') {
      clientConfig.ssl = { rejectUnauthorized: false };
    }

    const client = new Client(clientConfig);
    
    await client.connect();

    // 2. Fetch configs from tenant_config table
    const res = await client.query(
      `SELECT module, config_name, value FROM ${schema}.tenant_config`
    );
    dbRows = res.rows;

    await client.end();
  } catch (err: any) {
    console.error('DB2 Connection Error:', err);
    errorMsg += `DB Error: ${err.message}. `;
  }

  // 3. Compare CSV and DB
  try {
    const csvPath = path.join(process.cwd(), 'src/app/tenant_compare_v2.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const parseResult = Papa.parse(csvContent, { header: true, skipEmptyLines: true });
    csvRows = parseResult.data;
  } catch (err: any) {
    console.error('CSV Read Error:', err);
    errorMsg += `CSV Error: ${err.message}. `;
  }

  const comparison = csvRows.map((csvRow: any) => {
    const module = csvRow['Module'];
    const configName = csvRow['ConfigName'];
    const csvValue = csvRow['Value'];
    const status = csvRow['Status'];

    const matchingDbRow = dbRows.find(
      (db) => db.module === module && db.config_name === configName
    );

    let dbValue = null;
    let matchStatus = 'Missing in DB';

    if (matchingDbRow) {
      dbValue = matchingDbRow.value;
      if (dbValue === csvValue) {
        matchStatus = 'Match';
      } else {
        matchStatus = 'Mismatch';
      }
    }

    return {
      module,
      configName,
      csvValue,
      dbValue,
      csvStatus: status,
      matchStatus
    };
  });

  return (
    <div className="xp-window" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div className="xp-titlebar">
        <span>🏢 Tenant Config Checker ({schema})</span>
        <div className="xp-titlebar-buttons">
          <button className="xp-titlebar-btn" style={{ fontSize: '10px' }}>_</button>
          <button className="xp-titlebar-btn" style={{ fontSize: '10px' }}>□</button>
          <button className="xp-titlebar-btn">×</button>
        </div>
      </div>
      <div className="xp-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: 0 }}>
        
        {errorMsg && (
          <div style={{ background: '#FFEBEB', border: '1px solid #CC0000', padding: '8px', color: '#CC0000', flexShrink: 0 }}>
            <strong>Error:</strong> {errorMsg}
          </div>
        )}

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: '#FFF', padding: '8px', border: '1px solid #7F9DB9', flexShrink: 0 }}>
          <div><strong>Total CSV Records:</strong> {csvRows.length}</div>
          <div><strong>Total DB Records:</strong> {dbRows.length}</div>
          <div><strong>Matches:</strong> {comparison.filter(c => c.matchStatus === 'Match').length}</div>
          <div><strong>Mismatches:</strong> {comparison.filter(c => c.matchStatus === 'Mismatch').length}</div>
          <div><strong>Missing in DB:</strong> {comparison.filter(c => c.matchStatus === 'Missing in DB').length}</div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', border: '1px solid #7F9DB9', background: '#FFF', minHeight: 0 }}>
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
                  style = { background: '#FFF3E0', borderColor: '#E59700', color: '#B37600' };
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
              {comparison.length === 0 && !errorMsg && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '16px' }}>No data to display.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
