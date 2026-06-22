import { NextResponse } from 'next/server';
import { Client } from 'pg';

export async function POST(req: Request) {
  try {
    const { connectionString, dbConfig, schema = 'public', table, limit = 500 } = await req.json();
    
    if ((!connectionString && !dbConfig) || !table) {
      return NextResponse.json({ success: false, error: 'connection details and table are required' }, { status: 400 });
    }

    const clientConfig: any = dbConfig ? { ...dbConfig } : { connectionString };
    if (clientConfig.ssl) {
      clientConfig.ssl = { rejectUnauthorized: false };
    }
    const client = new Client(clientConfig);
    await client.connect();

    // Use safe quoting for identifiers
    const query = `SELECT * FROM "${schema}"."${table}" LIMIT $1;`;
    
    const result = await client.query(query, [limit]);
    await client.end();

    return NextResponse.json({ success: true, data: result.rows });
  } catch (err: any) {
    let msg = err?.message || String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
