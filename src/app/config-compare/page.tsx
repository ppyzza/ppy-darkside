import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { Client } from 'pg';

export default async function ConfigComparePage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const selectedTenantId = params.tenantId as string | undefined;

  let tenants: any[] = [];
  let dbRows: any[] = [];
  let csvRows: any[] = [];
  let errorMsg = '';

  try {
    // 1. Connect to DB
    const clientConfig: any = {
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
    };

    if (process.env.DB_SSL === 'true') {
      clientConfig.ssl = { rejectUnauthorized: false };
    }

    const client = new Client(clientConfig);
    
    await client.connect();

    // 2. Fetch all tenants for dropdown
    const tenantRes = await client.query('SELECT uuid, tenant_name FROM tenancy.tenant ORDER BY tenant_name ASC');
    tenants = tenantRes.rows;

    // 3. Fetch configs only if a tenant is selected
    if (selectedTenantId) {
      const res = await client.query(
        'SELECT uuid, tenant_uuid, service_name, config_name, config_value, description, created_at, created_by, updated_at, updated_by FROM tenancy.system_config WHERE tenant_uuid = $1',
        [selectedTenantId]
      );
      dbRows = res.rows;
    }

    await client.end();
  } catch (err: any) {
    console.error('DB Connection Error:', err);
    errorMsg += `DB Error: ${err.message}. `;
  }

  // 4. Compare CSV and DB if a tenant is selected
  let comparison: any[] = [];
  if (selectedTenantId) {
    try {
      const csvPath = path.join(process.cwd(), 'src/app/check_config.csv');
      const csvContent = fs.readFileSync(csvPath, 'utf8');
      const parseResult = Papa.parse(csvContent, { header: true, skipEmptyLines: true });
      csvRows = parseResult.data;
    } catch (err: any) {
      console.error('CSV Read Error:', err);
      errorMsg += `CSV Error: ${err.message}. `;
    }

    comparison = csvRows.map((csvRow: any) => {
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
  }

  return (
    <div className="xp-window" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div className="xp-titlebar">
        <span>⚙️ Database vs CSV Config Checker</span>
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

        {/* Tenant Selector */}
        <div style={{ background: '#FFF', padding: '12px', border: '1px solid #7F9DB9', flexShrink: 0 }}>
          <form method="GET" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ fontWeight: 'bold' }}>Select Tenant:</label>
            <select name="tenantId" defaultValue={selectedTenantId || ''} style={{ minWidth: '250px', padding: '4px' }}>
              <option value="" disabled>-- Please select a tenant --</option>
              {tenants.map(t => (
                <option key={t.uuid} value={t.uuid}>{t.tenant_name}</option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary">Apply</button>
          </form>
        </div>

        {selectedTenantId ? (
          <>
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
                      style = { background: '#FFF3E0', borderColor: '#E59700', color: '#B37600' };
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
                  {comparison.length === 0 && !errorMsg && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '16px' }}>No data to display.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#777', background: '#FFF', border: '1px solid #7F9DB9' }}>
            Please select a tenant from the dropdown above to view and compare configurations.
          </div>
        )}

      </div>
    </div>
  );
}
