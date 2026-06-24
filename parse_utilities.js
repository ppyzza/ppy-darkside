const fs = require('fs');
const content = fs.readFileSync('src/app/utilities/page.tsx', 'utf-8');

const returnBlockMatch = content.match(/return \([\s\S]*?\n  \);/);
const returnBlock = returnBlockMatch[0];

const xpContent = `
import React from 'react';
import { UtilitiesProps } from './types';

export default function UtilitiesXP(props: UtilitiesProps) {
  const {
    activeTab, setActiveTab, jwtInput, setJwtInput, jwtHeader, setJwtHeader,
    jwtPayload, setJwtPayload, jwtError, setJwtError, jsonInput, setJsonInput,
    jsonOutput, setJsonOutput, jsonError, setJsonError, epochInput, setEpochInput,
    epochOutput, setEpochOutput, dateInput, setDateInput, dateOutput, setDateOutput,
    uuidOutput, setUuidOutput, base64Raw, setBase64Raw, base64Encoded, setBase64Encoded,
    decodeJwt, formatJson, minifyJson, convertEpoch, convertDate, generateUuid,
    encodeBase64, decodeBase64, tabs
  } = props;

  ${returnBlock}
}
`;

fs.writeFileSync('src/app/utilities/components/UtilitiesXP.tsx', xpContent);

// Darkside
let darkside = xpContent
  .replace('export default function UtilitiesXP', 'export default function UtilitiesDarkside')
  .replace(/background: 'var\(--app-bg\)'/g, "background: 'var(--app-bg)'")
  .replace(/background: 'var\(--app-window-bg\)'/g, "background: 'var(--app-window-bg)'")
  .replace(/background: 'var\(--app-panel\)'/g, "background: 'var(--app-panel)'")
  .replace(/background: '#F5F5F5'/g, "background: 'var(--app-window-bg)'")
  .replace(/border: '1px solid var\(--app-border\)'/g, "border: '1px solid var(--app-border)', borderRadius: '8px'")
  .replace(/borderBottom: '1px solid var\(--app-border\)'/g, "borderBottom: '1px solid var(--app-border)'")
  .replace(/className="app-window"/g, "className=\"app-window\" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--app-border)' }}")
  .replace(/className="app-titlebar"/g, "className=\"app-titlebar\" style={{ background: 'var(--app-panel)', color: 'var(--app-text)', padding: '16px', fontSize: '14px', borderBottom: '1px solid var(--app-border)' }}")
  .replace(/className="btn btn-primary"/g, "className=\"btn btn-primary\" style={{ borderRadius: '6px', padding: '8px 16px', background: 'var(--app-blue)' }}")
  .replace(/className="btn"/g, "className=\"btn\" style={{ borderRadius: '6px', padding: '8px 16px' }}");

fs.writeFileSync('src/app/utilities/components/UtilitiesDarkside.tsx', darkside);

// Glass
let glass = xpContent
  .replace('export default function UtilitiesXP', 'export default function UtilitiesGlass')
  .replace(/background: 'var\(--app-bg\)'/g, "background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)'")
  .replace(/background: 'var\(--app-window-bg\)'/g, "background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)'")
  .replace(/background: 'var\(--app-panel\)'/g, "background: 'rgba(255, 255, 255, 0.1)'")
  .replace(/background: activeTab === idx \? 'var\(--app-window-bg\)' : 'var\(--app-panel\)'/g, "background: activeTab === idx ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)'")
  .replace(/background: '#F5F5F5'/g, "background: 'rgba(255,255,255,0.05)'")
  .replace(/border: '1px solid var\(--app-border\)'/g, "border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px'")
  .replace(/borderBottom: '1px solid var\(--app-border\)'/g, "borderBottom: '1px solid rgba(255,255,255,0.1)'")
  .replace(/borderBottom: activeTab === idx \? '1px solid var\(--app-window-bg\)' : '1px solid var\(--app-border\)'/g, "borderBottom: activeTab === idx ? '1px solid transparent' : '1px solid rgba(255,255,255,0.1)'")
  .replace(/className="app-window"/g, "className=\"app-window\" style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}")
  .replace(/className="app-titlebar"/g, "className=\"app-titlebar\" style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', fontSize: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}")
  .replace(/className="btn btn-primary"/g, "className=\"btn btn-primary\" style={{ borderRadius: '12px', padding: '8px 24px', background: 'linear-gradient(135deg, var(--app-blue), #6366f1)', border: 'none' }}")
  .replace(/className="btn"/g, "className=\"btn\" style={{ borderRadius: '12px', padding: '8px 24px', background: 'rgba(255,255,255,0.1)' }}");

fs.writeFileSync('src/app/utilities/components/UtilitiesGlass.tsx', glass);
console.log('Utilities Presenters generated');
