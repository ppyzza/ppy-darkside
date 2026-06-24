'use client';

import { useState } from 'react';
import Papa from 'papaparse';

import { useTheme } from 'next-themes';
import TenantCompareXP from './components/TenantCompareXP';
import TenantCompareDarkside from './components/TenantCompareDarkside';
import TenantCompareGlass from './components/TenantCompareGlass';

export default function ClientTenantCompare({
  schema,
  dbRows,
  errorMsg
}: {
  schema: string;
  dbRows: any[];
  errorMsg: string;
}) {
  const [csvRows, setCsvRows] = useState<any[]>([]);
  const [comparison, setComparison] = useState<any[]>([]);
  const [clientError, setClientError] = useState('');
  const { theme } = useTheme();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setCsvRows([]);
      setComparison([]);
      return;
    }

    setClientError('');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data;
        setCsvRows(rows);

        const newComparison = rows.map((csvRow: any) => {
          const module = csvRow['Module'];
          const configName = csvRow['ConfigName'];
          const csvValue = csvRow['Value'];
          const status = csvRow['Status'];

          const matchingDbRow = dbRows.find(
            (db) => db.module === module && db.config_name === configName
          );

          let dbValue = null;
          let matchStatus = 'Missing in DB';

          if (matchingDbRow) {
            dbValue = matchingDbRow.value;
            if (dbValue === csvValue) {
              matchStatus = 'Match';
            } else {
              matchStatus = 'Mismatch';
            }
          }

          return {
            module,
            configName,
            csvValue,
            dbValue,
            csvStatus: status,
            matchStatus
          };
        });

        setComparison(newComparison);
      },
      error: (err) => {
        setClientError(`CSV Parse Error: ${err.message}`);
      }
    });
  };

  const finalError = errorMsg || clientError;

  const props = {
    schema,
    dbRows,
    csvRows,
    comparison,
    finalError,
    handleFileUpload
  };

  if (theme === 'darkside') return <TenantCompareDarkside {...props} />;
  if (theme === 'glass') return <TenantCompareGlass {...props} />;
  
  // Default to XP
  return <TenantCompareXP {...props} />;
}
