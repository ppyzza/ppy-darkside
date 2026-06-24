const fs = require('fs');
const content = fs.readFileSync('src/app/seed-wizard/page.tsx', 'utf-8');

const returnStartIndex = content.indexOf('return (');
const stateBlock = content.slice(0, returnStartIndex);

const container = `
${stateBlock}
  const props: any = {
    expanded, setExpanded, step, setStep, connectionMode, setConnectionMode, connectionString, setConnectionString,
    dbConfig, setDbConfig, schema, setSchema, connecting, setConnecting, dbError, setDbError,
    tables, setTables, selectedTable, setSelectedTable, manualTable, setManualTable,
    columns, setColumns, fetchingCols, setFetchingCols, loadingData, setLoadingData,
    fkOptions, setFkOptions, csvFile, setCsvFile, csvHeaders, setCsvHeaders, csvData, setCsvData,
    editorPage, setEditorPage, validationErrors, setValidationErrors, editingRowIdx, setEditingRowIdx,
    editFormData, setEditFormData, mapping, setMapping, generateUuidFor, setGenerateUuidFor,
    exportedJson, setExportedJson, exportedSql, setExportedSql, executing, setExecuting,
    executeResult, setExecuteResult, wizardMode, setWizardMode, entityDirPath, setEntityDirPath,
    entities, setEntities, scanningEntities, setScanningEntities, entityError, setEntityError,
    selectedRootEntity, setSelectedRootEntity, entityFormDataList, setEntityFormDataList,
    activeRecordIndex, setActiveRecordIndex, activeRecordData, setActiveRecordData, scanSummary, setScanSummary,
    templates, setTemplates, loadingTemplates, setLoadingTemplates,
    fetchTemplates, scanEntities, handleTemplateSelect, handleConnect, fetchColumnsForTable,
    handleSelectChange, loadExistingData, handleFileUpload, goToMapping, generateUuidV4,
    performEntityExport, performExport, handleExecuteSql, calculateJoinDepths
  };

  switch (theme) {
    case 'darkside':
      return <SeedWizardDarkside {...props} />;
    case 'glass':
      return <SeedWizardGlass {...props} />;
    case 'xp':
    default:
      return <SeedWizardXP {...props} />;
  }
}
`;

// Add useTheme and missing imports to the top
let finalContainer = container.replace("import { useState, useRef } from 'react';", "import { useState, useRef } from 'react';\nimport { useTheme } from 'next-themes';\nimport SeedWizardXP from './components/SeedWizardXP';\nimport SeedWizardDarkside from './components/SeedWizardDarkside';\nimport SeedWizardGlass from './components/SeedWizardGlass';");

// Need to define `expanded, setExpanded` in page.tsx? Actually FolderNode uses them, but I extracted FolderNode into XP. I will just pass expanded as any or remove it from props. I will just pass `props` object. Wait, `expanded` is not in `SeedWizardPage`'s state! It's in `FolderNode` state.
finalContainer = finalContainer.replace('expanded, setExpanded, ', '');

// Insert `const { theme } = useTheme();` into `SeedWizardPage`
finalContainer = finalContainer.replace('export default function SeedWizardPage() {', 'export default function SeedWizardPage() {\n  const { theme } = useTheme();');

fs.writeFileSync('src/app/seed-wizard/page.tsx', finalContainer);
console.log('Container updated');
