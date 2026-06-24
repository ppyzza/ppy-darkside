'use client';

import { useState } from 'react';
import Papa from 'papaparse';

import { useTheme } from 'next-themes';
import ConfigCompareXP from './components/ConfigCompareXP';
import ConfigCompareDarkside from './components/ConfigCompareDarkside';
import ConfigCompareGlass from './components/ConfigCompareGlass';

export default function ClientConfigCompare({
  tenants,
  dbRows,
  selectedTenantId,
  errorMsg
}: {
  tenants: any[];
  dbRows: any[];
  selectedTenantId: string | undefined;
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
          const service = csvRow['Service'];
          const configName = csvRow['ConfigName'];
          const csvValue = csvRow['Value'];
          const status = csvRow['Status'];

          const matchingDbRow = dbRows.find(
            (db) => db.service_name === service && db.config_name === configName
          );

          let dbValue = null;
          let matchStatus = 'Missing in DB';

          if (matchingDbRow) {
            dbValue = matchingDbRow.config_value;
            if (dbValue === csvValue) {
              matchStatus = 'Match';
            } else {
              matchStatus = 'Mismatch';
            }
          }

          return {
            service,
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
    tenants,
    dbRows,
    csvRows,
    comparison,
    selectedTenantId,
    finalError,
    handleFileUpload
  };

  if (theme === 'darkside') return <ConfigCompareDarkside {...props} />;
  if (theme === 'glass') return <ConfigCompareGlass {...props} />;
  
  // Default to XP
  return <ConfigCompareXP {...props} />;
}
