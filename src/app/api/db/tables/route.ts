import { NextResponse } from 'next/server';
import { Client } from 'pg';

export async function POST(req: Request) {
  try {
    const { connectionString, schema = 'public' } = await req.json();
    
    if (!connectionString) {
      return NextResponse.json({ success: false, error: 'connectionString is required' }, { status: 400 });
    }

    const client = new Client({ connectionString });
    await client.connect();

    const query = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = $1 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
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
