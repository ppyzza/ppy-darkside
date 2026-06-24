const fs = require('fs');
const content = fs.readFileSync('src/app/seed-wizard/page.tsx', 'utf-8');

const stateMatches = content.matchAll(/const \[([a-zA-Z]+),\s*set[a-zA-Z]+\] = useState(?:<([^>]+)>)?/g);
const vars = [];
for (const match of stateMatches) {
  const name = match[1];
  const type = match[2] || 'any'; // fallback
  vars.push(`  ${name}: ${type};`);
  const setterName = 'set' + name.charAt(0).toUpperCase() + name.slice(1);
  vars.push(`  ${setterName}: React.Dispatch<React.SetStateAction<${type}>>;`);
}

// Add function props
const funcs = [
  'fetchTemplates', 'scanEntities', 'handleTemplateSelect', 'handleConnect',
  'fetchColumnsForTable', 'handleSelectChange', 'loadExistingData', 'handleFileUpload',
  'goToMapping', 'generateUuidV4', 'performEntityExport', 'performExport', 'handleExecuteSql', 'calculateJoinDepths'
];
for(const f of funcs) {
  vars.push(`  ${f}: (...args: any[]) => any;`);
}

const out = `import React from 'react';\n\nexport interface SeedWizardProps {\n${vars.join('\n')}\n}\n`;
fs.writeFileSync('src/app/seed-wizard/components/types.ts', out);
console.log('types.ts generated');
