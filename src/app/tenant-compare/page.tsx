import { Client } from 'pg';
import ClientTenantCompare from './ClientTenantCompare';

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

  return (
    <ClientTenantCompare
      schema={schema}
      dbRows={dbRows}
      errorMsg={errorMsg}
    />
  );
}
