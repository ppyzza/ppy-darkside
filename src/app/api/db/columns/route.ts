import { NextResponse } from 'next/server';
import { Client } from 'pg';

export async function POST(req: Request) {
  try {
    const { connectionString, schema = 'public', table } = await req.json();
    
    if (!connectionString || !table) {
      return NextResponse.json({ success: false, error: 'connectionString and table are required' }, { status: 400 });
    }

    const client = new Client({ connectionString });
    await client.connect();

    const query = `
      SELECT c.column_name, c.data_type, c.is_nullable, c.udt_name,
      (
        SELECT array_agg(e.enumlabel)
        FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = c.udt_name
      ) as enum_values,
      (
        SELECT TRUE
        FROM information_schema.key_column_usage kcu
        JOIN information_schema.table_constraints tc 
          ON kcu.constraint_name = tc.constraint_name 
          AND tc.table_schema = kcu.table_schema
          AND tc.constraint_type = 'PRIMARY KEY'
        WHERE kcu.table_schema = c.table_schema 
          AND kcu.table_name = c.table_name 
          AND kcu.column_name = c.column_name
        LIMIT 1
      ) as is_primary_key
      FROM information_schema.columns c
      WHERE c.table_schema = $1 AND c.table_name = $2
      ORDER BY c.ordinal_position;
    `;
    
    const result = await client.query(query, [schema, table]);
    await client.end();

    return NextResponse.json({ success: true, columns: result.rows });
  } catch (err: any) {
    let msg = err?.message || String(err);
    if (msg === 'AggregateError' || msg.includes('ECONNREFUSED')) {
      msg = 'Connection refused. Is your PostgreSQL database running on the specified host/port?';
    }
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
