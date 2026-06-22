import { NextResponse } from 'next/server';
import { Client } from 'pg';

export async function POST(req: Request) {
  try {
    const { connectionString, dbConfig, schema = 'public', table, column, value } = await req.json();
    
    if ((!connectionString && !dbConfig) || !table || !column || value === undefined) {
      return NextResponse.json({ success: false, error: 'connection details, table, column, and value are required' }, { status: 400 });
    }

    const clientConfig: any = dbConfig ? { ...dbConfig } : { connectionString };
    if (clientConfig.ssl) {
      clientConfig.ssl = { rejectUnauthorized: false };
    }
    const client = new Client(clientConfig);
    await client.connect();

    // Use parameterized query to prevent SQL injection, but table and column names must be sanitized or interpolated carefully
    // Since table and column names cannot be parameterized, we use simple quotes (assuming no special chars or we just use double quotes)
    const query = `SELECT 1 FROM ${schema}."${table}" WHERE "${column}" = $1 LIMIT 1;`;
    
    const result = await client.query(query, [value]);
    await client.end();

    return NextResponse.json({ success: true, exists: result.rowCount ? result.rowCount > 0 : false });
  } catch (err: any) {
    let msg = err?.message || String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
