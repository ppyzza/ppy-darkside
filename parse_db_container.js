const fs = require('fs');
const content = fs.readFileSync('src/app/db-diff/page.tsx', 'utf-8');

const diffContentMatchIndex = content.indexOf('// Render Logic');
const stateBlock = content.slice(0, diffContentMatchIndex);

const container = `
${stateBlock}
  const props = {
    sourceConn, setSourceConn, targetConn, setTargetConn, sourceSchemaName, setSourceSchemaName,
    targetSchemaName, setTargetSchemaName, comparing, error, sourceSchema, targetSchema,
    expandedTables, dataDiffs, handleCompareData, handleCompare, toggleTable, setError, setComparing,
    setSourceSchema, setTargetSchema, setExpandedTables, setDataDiffs
  };

  switch (theme) {
    case 'darkside':
      return <DbDiffDarkside {...props} />;
    case 'glass':
      return <DbDiffGlass {...props} />;
    case 'xp':
    default:
      return <DbDiffXP {...props} />;
  }
}
`;

let finalContainer = container.replace("import { useState } from 'react';", "import { useState } from 'react';\nimport { useTheme } from 'next-themes';\nimport DbDiffXP from './components/DbDiffXP';\nimport DbDiffDarkside from './components/DbDiffDarkside';\nimport DbDiffGlass from './components/DbDiffGlass';");
finalContainer = finalContainer.replace('export default function DbDiffPage() {', 'export default function DbDiffPage() {\n  const { theme } = useTheme();');

fs.writeFileSync('src/app/db-diff/page.tsx', finalContainer);
console.log('DbDiff Container updated');
