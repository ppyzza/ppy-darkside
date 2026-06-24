const fs = require('fs');
const content = fs.readFileSync('src/app/utilities/page.tsx', 'utf-8');

const returnBlockMatch = content.match(/return \([\s\S]*?\n  \);/);
const returnBlock = returnBlockMatch[0];
const returnStartIndex = content.indexOf('return (');

const stateBlock = content.slice(0, returnStartIndex);

const container = `
${stateBlock}
  const props: any = {
    activeTab, setActiveTab, jwtInput, setJwtInput, jwtHeader, setJwtHeader,
    jwtPayload, setJwtPayload, jwtError, setJwtError, jsonInput, setJsonInput,
    jsonOutput, setJsonOutput, jsonError, setJsonError, epochInput, setEpochInput,
    epochOutput, setEpochOutput, dateInput, setDateInput, dateOutput, setDateOutput,
    uuidOutput, setUuidOutput, base64Raw, setBase64Raw, base64Encoded, setBase64Encoded,
    decodeJwt, formatJson, minifyJson, convertEpoch, convertDate, generateUuid,
    encodeBase64, decodeBase64, tabs
  };

  switch (theme) {
    case 'darkside':
      return <UtilitiesDarkside {...props} />;
    case 'glass':
      return <UtilitiesGlass {...props} />;
    case 'xp':
    default:
      return <UtilitiesXP {...props} />;
  }
}
`;

let finalContainer = container.replace("import { useState, useEffect } from 'react';", "import { useState, useEffect } from 'react';\nimport { useTheme } from 'next-themes';\nimport UtilitiesXP from './components/UtilitiesXP';\nimport UtilitiesDarkside from './components/UtilitiesDarkside';\nimport UtilitiesGlass from './components/UtilitiesGlass';");
finalContainer = finalContainer.replace('export default function UtilitiesPage() {', 'export default function UtilitiesPage() {\n  const { theme } = useTheme();');

fs.writeFileSync('src/app/utilities/page.tsx', finalContainer);
console.log('Utilities Container updated');
