import { NextResponse } from 'next/server';
import { Client } from 'pg';

export async function POST(req: Request) {
  try {
    const { connectionString, dbConfig, schema = 'public', table } = await req.json();
    
    if ((!connectionString && !dbConfig) || !table) {
      return NextResponse.json({ success: false, error: 'connection details and table are required' }, { status: 400 });
    }

    const clientConfig: any = dbConfig ? { ...dbConfig } : { connectionString };
    if (clientConfig.ssl) {
      clientConfig.ssl = { rejectUnauthorized: false };
    }
    const client = new Client(clientConfig);
    await client.connect();

    const query = `
      SELECT
          a.attname AS column_name,
          pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type,
          NOT a.attnotnull AS is_nullable,
          (
              SELECT array_agg(e.enumlabel)
              FROM pg_catalog.pg_enum e
              WHERE e.enumtypid = a.atttypid
          ) AS enum_values,
          (
              SELECT true
              FROM pg_catalog.pg_index i
              WHERE i.indrelid = a.attrelid AND i.indisprimary AND a.attnum = ANY(i.indkey)
          ) AS is_primary_key,
          (
              SELECT json_build_object(
                  'table', cl.relname,
                  'column', fa.attname
              )
              FROM pg_catalog.pg_constraint c
              JOIN pg_catalog.pg_class cl ON cl.oid = c.confrelid
              JOIN pg_catalog.pg_attribute fa ON fa.attrelid = c.confrelid AND fa.attnum = c.confkey[1]
              WHERE c.conrelid = a.attrelid
              AND c.contype = 'f'
              AND a.attnum = ANY(c.conkey)
              LIMIT 1
          ) AS foreign_key
      FROM pg_catalog.pg_attribute a
      JOIN pg_catalog.pg_class c ON c.oid = a.attrelid
      JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
      WHERE lower(n.nspname) = lower($1) AND lower(c.relname) = lower($2)
      AND a.attnum > 0 AND NOT a.attisdropped
      ORDER BY a.attnum;
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
