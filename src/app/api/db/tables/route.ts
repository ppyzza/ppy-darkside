import { NextResponse } from 'next/server';
import { Client } from 'pg';

export async function POST(req: Request) {
  try {
    const { connectionString, dbConfig, schema = 'public' } = await req.json();
    
    if (!connectionString && !dbConfig) {
      return NextResponse.json({ success: false, error: 'connectionString or dbConfig is required' }, { status: 400 });
    }

    const clientConfig: any = dbConfig ? { ...dbConfig } : { connectionString };
    if (clientConfig.ssl) {
      clientConfig.ssl = { rejectUnauthorized: false };
    }
    const client = new Client(clientConfig);
    await client.connect();

    const query = `
      SELECT tablename AS table_name 
      FROM pg_catalog.pg_tables 
      WHERE lower(schemaname) = lower($1)
      ORDER BY tablename;
    `;
    
    const result = await client.query(query, [schema]);
    await client.end();

    const tables = result.rows.map(row => row.table_name);

    return NextResponse.json({ success: true, tables });
  } catch (err: any) {
    let msg = err?.message || String(err);
    if (msg === 'AggregateError' || msg.includes('ECONNREFUSED')) {
      msg = 'Connection refused. Is your PostgreSQL database running on the specified host/port?';
    }
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
