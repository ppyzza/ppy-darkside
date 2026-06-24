const fs = require('fs');
const content = fs.readFileSync('src/app/seed-wizard/page.tsx', 'utf-8');

const seedWizardIndex = content.indexOf('export default function SeedWizardPage() {');
const preSeedWizard = content.slice(0, seedWizardIndex);
const seedWizardContent = content.slice(seedWizardIndex);

const returnMatch = seedWizardContent.match(/\n  return \(/);
const returnIndex = returnMatch.index;

const stateBlock = seedWizardContent.slice(0, returnIndex);
const returnBlock = seedWizardContent.slice(returnIndex);

// Generate Helpers
fs.writeFileSync('src/app/seed-wizard/components/helpers.tsx', `
import React, { useState } from 'react';

export function FolderNode({ name, node, pathSoFar, level, onSelect }: any) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <div 
        onClick={() => setExpanded(!expanded)}
        style={{ 
          padding: '4px', 
          paddingLeft: \`\${level * 16 + 8}px\`, 
          fontSize: '11px', 
          fontWeight: 'bold', 
          color: 'var(--app-text)',
          cursor: 'pointer',
          userSelect: 'none'
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      >
        {expanded ? '📂' : '📁'} {name}
      </div>
      {expanded && (
        <div>
          {Object.keys(node).sort((a, b) => {
            const aIsFile = node[a]._isFile;
            const bIsFile = node[b]._isFile;
            if (aIsFile && !bIsFile) return 1;
            if (!aIsFile && bIsFile) return -1;
            return a.localeCompare(b);
          }).map(key => {
            if (key === '_isFile') return null;
            const item = node[key];
            if (item._isFile) {
              return (
                <div 
                  key={item.name}
                  onClick={() => onSelect(item.name)}
                  style={{ 
                    fontSize: '11px', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    padding: '2px 4px',
                    paddingLeft: \`\${(level + 1) * 16 + 24}px\`
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--app-blue-dark)'; e.currentTarget.style.color = 'var(--app-window-bg)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--app-text)'; }}
                >
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>📄 {key}</span>
                  <span style={{ color: '#888', marginLeft: '8px' }}>{item.sizeKb} KB</span>
                </div>
              );
            } else {
              return <FolderNode key={key} name={key} node={item} pathSoFar={pathSoFar + key + '/'} level={level + 1} onSelect={onSelect} />;
            }
          })}
        </div>
      )}
    </div>
  );
}

export function FolderTree({ templates, onSelect }: { templates: any[], onSelect: (name: string) => void }) {
  const tree: any = {};
  templates.forEach(t => {
    const parts = t.name.split('/');
    let current = tree;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        current[part] = { _isFile: true, ...t };
      } else {
        current[part] = current[part] || {};
        current = current[part];
      }
    }
  });

  return (
    <div style={{ userSelect: 'none' }}>
      {Object.keys(tree).sort((a, b) => {
        const aIsFile = tree[a]._isFile;
        const bIsFile = tree[b]._isFile;
        if (aIsFile && !bIsFile) return 1;
        if (!aIsFile && bIsFile) return -1;
        return a.localeCompare(b);
      }).map(key => {
        if (key === '_isFile') return null;
        const item = tree[key];
        if (item._isFile) {
          return (
            <div 
              key={item.name}
              onClick={() => onSelect(item.name)}
              style={{ 
                fontSize: '11px', 
                cursor: 'pointer', 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '2px 4px',
                paddingLeft: \`8px\`
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--app-blue-dark)'; e.currentTarget.style.color = 'var(--app-window-bg)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--app-text)'; }}
            >
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>📄 {key}</span>
              <span style={{ color: '#888', marginLeft: '8px' }}>{item.sizeKb} KB</span>
            </div>
          );
        } else {
          return <FolderNode key={key} name={key} node={item} pathSoFar={key + '/'} level={0} onSelect={onSelect} />;
        }
      })}
    </div>
  );
}
`);

// Create Presenters
const xpContent = `
import React, { useState } from 'react';
import { SeedWizardProps } from './types';
import { EntityForm } from '../EntityForm';
import { FolderTree, FolderNode } from './helpers';

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

// Darkside
let darkside = xpContent
  .replace('export default function SeedWizardXP', 'export default function SeedWizardDarkside')
  .replace(/background: 'var\(--app-bg\)'/g, "background: 'var(--app-bg)'")
  .replace(/background: 'var\(--app-window-bg\)'/g, "background: 'var(--app-window-bg)'")
  .replace(/border: '1px solid var\(--app-border\)'/g, "border: '1px solid var(--app-border)', borderRadius: '8px'")
  .replace(/borderBottom: '1px solid var\(--app-border\)'/g, "borderBottom: '1px solid var(--app-border)'")
  .replace(/className="app-window"/g, "className=\"app-window\" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--app-border)' }}")
  .replace(/className="app-titlebar"/g, "className=\"app-titlebar\" style={{ background: 'var(--app-panel)', color: 'var(--app-text)', padding: '16px', fontSize: '14px', borderBottom: '1px solid var(--app-border)' }}")
  .replace(/className="btn"/g, "className=\"btn\" style={{ borderRadius: '6px', padding: '6px 12px' }}")
  .replace(/className="btn btn-primary"/g, "className=\"btn btn-primary\" style={{ borderRadius: '6px', padding: '6px 16px', background: 'var(--app-blue)' }}");

fs.writeFileSync('src/app/seed-wizard/components/SeedWizardDarkside.tsx', darkside);

// Glass
let glass = xpContent
  .replace('export default function SeedWizardXP', 'export default function SeedWizardGlass')
  .replace(/background: 'var\(--app-bg\)'/g, "background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)'")
  .replace(/background: 'var\(--app-window-bg\)'/g, "background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)'")
  .replace(/background: 'var\(--app-panel\)'/g, "background: 'rgba(255, 255, 255, 0.1)'")
  .replace(/border: '1px solid var\(--app-border\)'/g, "border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px'")
  .replace(/className="app-window"/g, "className=\"app-window\" style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}")
  .replace(/className="app-titlebar"/g, "className=\"app-titlebar\" style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', fontSize: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}")
  .replace(/className="btn"/g, "className=\"btn\" style={{ borderRadius: '12px', padding: '8px 16px', background: 'rgba(255,255,255,0.1)' }}")
  .replace(/className="btn btn-primary"/g, "className=\"btn btn-primary\" style={{ borderRadius: '12px', padding: '8px 24px', background: 'linear-gradient(135deg, var(--app-blue), #6366f1)', border: 'none' }}");

fs.writeFileSync('src/app/seed-wizard/components/SeedWizardGlass.tsx', glass);

// Rewrite container
const container = `
'use client';

import { useState, useRef } from 'react';
import { useTheme } from 'next-themes';
import SeedWizardXP from './components/SeedWizardXP';
import SeedWizardDarkside from './components/SeedWizardDarkside';
import SeedWizardGlass from './components/SeedWizardGlass';
import Papa from 'papaparse';

${stateBlock.replace('export default function SeedWizardPage() {', 'export default function SeedWizardPage() {\n  const { theme } = useTheme();')}

  const props: any = {
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

fs.writeFileSync('src/app/seed-wizard/page.tsx', container);
console.log('Seed Wizard fully recovered and refactored');
