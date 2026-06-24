const fs = require('fs');
const content = fs.readFileSync('src/app/db-diff/page.tsx', 'utf-8');

const diffContentMatch = content.match(/\/\/ Render Logic[\s\S]*?\n\s+return \(/);
const diffContentLogic = diffContentMatch[0].replace('return (', '');
const returnBlockMatch = content.match(/return \([\s\S]*?\n  \);/);
const returnBlock = returnBlockMatch[0];

const xpContent = `
import React from 'react';
import { DbDiffProps } from './types';

export default function DbDiffXP(props: DbDiffProps) {
  const {
    sourceConn, setSourceConn, targetConn, setTargetConn, sourceSchemaName, setSourceSchemaName,
    targetSchemaName, setTargetSchemaName, comparing, error, sourceSchema, targetSchema,
    expandedTables, dataDiffs, handleCompareData, handleCompare, toggleTable
  } = props;

  ${diffContentLogic}

  ${returnBlock}
}
`;

fs.writeFileSync('src/app/db-diff/components/DbDiffXP.tsx', xpContent);

// Darkside
let darkside = xpContent
  .replace('export default function DbDiffXP', 'export default function DbDiffDarkside')
  .replace(/background: 'var\(--app-bg\)'/g, "background: 'var(--app-bg)'")
  .replace(/background: 'var\(--app-window-bg\)'/g, "background: 'var(--app-window-bg)'")
  .replace(/background: 'var\(--app-panel\)'/g, "background: 'var(--app-panel)'")
  .replace(/border: '1px solid var\(--app-border\)'/g, "border: '1px solid var(--app-border)', borderRadius: '8px'")
  .replace(/className="app-window"/g, "className=\"app-window\" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--app-border)' }}")
  .replace(/className="app-titlebar"/g, "className=\"app-titlebar\" style={{ background: 'var(--app-panel)', color: 'var(--app-text)', padding: '16px', fontSize: '14px', borderBottom: '1px solid var(--app-border)' }}")
  .replace(/className="btn btn-primary"/g, "className=\"btn btn-primary\" style={{ borderRadius: '6px', padding: '8px 16px', background: 'var(--app-blue)' }}");

fs.writeFileSync('src/app/db-diff/components/DbDiffDarkside.tsx', darkside);

// Glass
let glass = xpContent
  .replace('export default function DbDiffXP', 'export default function DbDiffGlass')
  .replace(/background: 'var\(--app-bg\)'/g, "background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)'")
  .replace(/background: 'var\(--app-window-bg\)'/g, "background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)'")
  .replace(/background: 'var\(--app-panel\)'/g, "background: 'rgba(255, 255, 255, 0.1)'")
  .replace(/border: '1px solid var\(--app-border\)'/g, "border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px'")
  .replace(/className="app-window"/g, "className=\"app-window\" style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}")
  .replace(/className="app-titlebar"/g, "className=\"app-titlebar\" style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', fontSize: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}")
  .replace(/className="btn btn-primary"/g, "className=\"btn btn-primary\" style={{ borderRadius: '12px', padding: '8px 24px', background: 'linear-gradient(135deg, var(--app-blue), #6366f1)', border: 'none' }}");

fs.writeFileSync('src/app/db-diff/components/DbDiffGlass.tsx', glass);
console.log('DbDiff Presenters generated');
