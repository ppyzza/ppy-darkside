import { NextResponse } from 'next/server';
import { Client } from 'pg';

export async function POST(req: Request) {
  try {
    const { sourceConn, targetConn, sourceSchema, targetSchema, tableName } = await req.json();

    if (!sourceConn || !targetConn || !sourceSchema || !targetSchema || !tableName) {
      return NextResponse.json({ success: false, error: 'Missing required parameters' }, { status: 400 });
    }

    const srcClient = new Client({ connectionString: sourceConn });
    const tgtClient = new Client({ connectionString: targetConn });

    await Promise.all([srcClient.connect(), tgtClient.connect()]);

    try {
      // 1. Get Primary Keys (We assume Source and Target have the same PKs for Data Diffing)
      const pkQuery = `
        SELECT kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        WHERE tc.constraint_type = 'PRIMARY KEY'
          AND tc.table_schema = $1
          AND tc.table_name = $2;
      `;
      const pkRes = await srcClient.query(pkQuery, [sourceSchema, tableName]);
      const pks = pkRes.rows.map(r => r.column_name);

      if (pks.length === 0) {
        return NextResponse.json({ success: false, error: 'Cannot perform Data Diff on a table without a Primary Key.' }, { status: 400 });
      }

      // 2. Fetch Data (Limit 1000)
      const dataQuery = (schema: string) => `SELECT * FROM ${schema}."${tableName}" LIMIT 1000`;
      
      const [srcDataRes, tgtDataRes] = await Promise.all([
        srcClient.query(dataQuery(sourceSchema)),
        tgtClient.query(dataQuery(targetSchema))
      ]);

      const srcRows = srcDataRes.rows;
      const tgtRows = tgtDataRes.rows;

      // 3. Perform Diff
      const srcMap = new Map();
      const tgtMap = new Map();

      const getPkString = (row: any) => pks.map(pk => String(row[pk])).join('|');

      srcRows.forEach(row => srcMap.set(getPkString(row), row));
      tgtRows.forEach(row => tgtMap.set(getPkString(row), row));

      const diff: any[] = [];

      // Check for Inserts and Updates (Iterate Source)
      for (const [pkStr, sRow] of srcMap.entries()) {
        const tRow = tgtMap.get(pkStr);
        if (!tRow) {
          // Exists in Source, but not Target -> INSERT
          diff.push({ action: 'insert', pkStr, sourceRow: sRow, targetRow: null, changes: {} });
        } else {
          // Exists in both, check for Updates
          const changes: Record<string, any> = {};
          let isDifferent = false;
          // Compare all keys present in Source row
          for (const key of Object.keys(sRow)) {
            // Convert to string for comparison to avoid type mismatch issues across drivers (e.g. date objects vs strings)
            const sVal = sRow[key] === null ? null : String(sRow[key]);
            const tVal = tRow[key] === null ? null : String(tRow[key]);
            if (sVal !== tVal) {
              isDifferent = true;
              changes[key] = { source: sRow[key], target: tRow[key] };
            }
          }
          if (isDifferent) {
            diff.push({ action: 'update', pkStr, sourceRow: sRow, targetRow: tRow, changes });
          }
        }
      }

      // Check for Deletes (Iterate Target)
      for (const [pkStr, tRow] of tgtMap.entries()) {
        if (!srcMap.has(pkStr)) {
          // Exists in Target, but not Source -> DELETE
          diff.push({ action: 'delete', pkStr, sourceRow: null, targetRow: tRow, changes: {} });
        }
      }

      return NextResponse.json({ success: true, diff, pks });
    } finally {
      await Promise.all([srcClient.end(), tgtClient.end()]);
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || String(err) }, { status: 500 });
  }
}
