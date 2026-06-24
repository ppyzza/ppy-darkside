import { Client } from 'pg';
import ClientConfigCompare from './ClientConfigCompare';

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

  return (
    <ClientConfigCompare
      tenants={tenants}
      dbRows={dbRows}
      selectedTenantId={selectedTenantId}
      errorMsg={errorMsg}
    />
  );
}
