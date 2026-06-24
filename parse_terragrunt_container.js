const fs = require('fs');
const content = fs.readFileSync('src/app/terragrunt/page.tsx', 'utf-8');

const returnBlockMatch = content.match(/return \([\s\S]*?\n  \);/);
const returnBlock = returnBlockMatch[0];
const returnStartIndex = content.indexOf('return (');

const stateBlock = content.slice(0, returnStartIndex);

const container = `
${stateBlock}
  const pendingEditsCount = Object.keys(edits).length;

  const props: any = {
    currentPath, setCurrentPath, directories, setDirectories, files, setFiles,
    fsError, setFsError, loadingFs, setLoadingFs, selectedFiles, setSelectedFiles,
    scanning, setScanning, scanError, setScanError, environments, setEnvironments,
    allKeys, setAllKeys, sidebarOpen, setSidebarOpen, edits, setEdits,
    commitMessage, setCommitMessage, committing, setCommitting, commitError, setCommitError,
    loadDirectory, navigateUp, navigateInto, addFile, removeFile,
    handleCompare, handleEditChange, handleCommit
  };

  switch (theme) {
    case 'darkside':
      return <TerragruntDarkside {...props} />;
    case 'glass':
      return <TerragruntGlass {...props} />;
    case 'xp':
    default:
      return <TerragruntXP {...props} />;
  }
}
`;

let finalContainer = container.replace("import { useState, useEffect } from 'react';", "import { useState, useEffect } from 'react';\nimport { useTheme } from 'next-themes';\nimport TerragruntXP from './components/TerragruntXP';\nimport TerragruntDarkside from './components/TerragruntDarkside';\nimport TerragruntGlass from './components/TerragruntGlass';");
finalContainer = finalContainer.replace('export default function TerragruntPage() {', 'export default function TerragruntPage() {\n  const { theme } = useTheme();');

// Also remove pendingEditsCount from the stateBlock since it was before `return` originally
finalContainer = finalContainer.replace('const pendingEditsCount = Object.keys(edits).length;\n', '');

fs.writeFileSync('src/app/terragrunt/page.tsx', finalContainer);
console.log('Terragrunt Container updated');
