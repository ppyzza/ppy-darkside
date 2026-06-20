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

    // Query to get all tables and all columns in the given schema
    const query = `
      SELECT 
        c.table_name,
        c.column_name, 
        c.data_type, 
        c.is_nullable, 
        c.udt_name,
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
      WHERE c.table_schema = $1
      ORDER BY c.table_name, c.ordinal_position;
    `;
    
    const result = await client.query(query, [schema]);
    await client.end();

    // Group columns by table_name
    const schemaMap: Record<string, any[]> = {};
    for (const row of result.rows) {
      const { table_name, ...colDef } = row;
      if (!schemaMap[table_name]) {
        schemaMap[table_name] = [];
      }
      schemaMap[table_name].push(colDef);
    }

    return NextResponse.json({ success: true, schema: schemaMap });
  } catch (err: any) {
    let msg = err?.message || String(err);
    if (msg === 'AggregateError' || msg.includes('ECONNREFUSED')) {
      msg = 'Connection refused. Is your PostgreSQL database running on the specified host/port?';
    }
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
