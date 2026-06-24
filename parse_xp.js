const fs = require('fs');
const content = fs.readFileSync('src/app/seed-wizard/page.tsx', 'utf-8');

const returnStartIndex = content.indexOf('return (');
const returnBlock = content.slice(returnStartIndex);

const helpersRegex = /function FolderNode[\s\S]*?function FolderTree[\s\S]*?}\n\n/g;
const helpersMatch = content.match(helpersRegex);
const helpers = helpersMatch ? helpersMatch[0] : '';

const xpContent = `
import React, { useState } from 'react';
import { SeedWizardProps } from './types';
import { EntityForm } from '../EntityForm';

${helpers}

export default function SeedWizardXP(props: SeedWizardProps) {
  const {
    step, setStep, connectionMode, setConnectionMode, connectionString, setConnectionString,
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
  } = props;

  ${returnBlock}
`;

fs.writeFileSync('src/app/seed-wizard/components/SeedWizardXP.tsx', xpContent);
console.log('SeedWizardXP generated');
