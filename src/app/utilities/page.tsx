
'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import UtilitiesXP from './components/UtilitiesXP';
import UtilitiesDarkside from './components/UtilitiesDarkside';
import UtilitiesGlass from './components/UtilitiesGlass';

export default function UtilitiesPage() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  // JWT State
  const [jwtInput, setJwtInput] = useState('');
  const [jwtHeader, setJwtHeader] = useState('');
  const [jwtPayload, setJwtPayload] = useState('');
  const [jwtError, setJwtError] = useState('');

  // JSON State
  const [jsonInput, setJsonInput] = useState('');
  const [jsonOutput, setJsonOutput] = useState('');
  const [jsonError, setJsonError] = useState('');

  // Time State
  const [epochInput, setEpochInput] = useState(Date.now().toString());
  const [epochOutput, setEpochOutput] = useState('');
  const [dateInput, setDateInput] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0,16);
  });
  const [dateOutput, setDateOutput] = useState('');

  // String Tools State
  const [uuidOutput, setUuidOutput] = useState('');
  const [base64Raw, setBase64Raw] = useState('');
  const [base64Encoded, setBase64Encoded] = useState('');

  // --- JWT Logic ---
  const decodeJwt = () => {
    try {
      setJwtError('');
      const parts = jwtInput.split('.');
      if (parts.length !== 3) throw new Error('Invalid JWT format');
      
      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));
      
      setJwtHeader(JSON.stringify(header, null, 2));
      setJwtPayload(JSON.stringify(payload, null, 2));
    } catch (e: any) {
      setJwtError('Failed to decode: ' + e.message);
      setJwtHeader('');
      setJwtPayload('');
    }
  };

  // --- JSON Logic ---
  const formatJson = () => {
    try {
      setJsonError('');
      const parsed = JSON.parse(jsonInput);
      setJsonOutput(JSON.stringify(parsed, null, 2));
    } catch (e: any) {
      setJsonError('Invalid JSON: ' + e.message);
    }
  };

  const minifyJson = () => {
    try {
      setJsonError('');
      const parsed = JSON.parse(jsonInput);
      setJsonOutput(JSON.stringify(parsed));
    } catch (e: any) {
      setJsonError('Invalid JSON: ' + e.message);
    }
  };

  // --- Time Logic ---
  const convertEpoch = () => {
    try {
      let val = parseInt(epochInput, 10);
      if (isNaN(val)) return setEpochOutput('Invalid Number');
      // Auto detect seconds vs ms (heuristic: year 3000 is ~32500000000, if larger, it's ms)
      if (val < 10000000000) val *= 1000; 
      const d = new Date(val);
      setEpochOutput(d.toLocaleString() + ' (' + d.toISOString() + ')');
    } catch (e) {
      setEpochOutput('Error converting');
    }
  };

  const convertDate = () => {
    try {
      const d = new Date(dateInput);
      setDateOutput('Milliseconds: ' + d.getTime() + ' | Seconds: ' + Math.floor(d.getTime() / 1000));
    } catch (e) {
      setDateOutput('Error converting');
    }
  };

  // --- String Tools Logic ---
  const generateUuid = () => {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    setUuidOutput(uuid);
  };

  const encodeBase64 = () => {
    try { setBase64Encoded(btoa(base64Raw)); } catch(e) { alert('Encode failed'); }
  };

  const decodeBase64 = () => {
    try { setBase64Raw(atob(base64Encoded)); } catch(e) { alert('Decode failed'); }
  };

  const tabs = ['JWT Decoder', 'JSON Tools', 'Time Converter', 'String Tools'];

  
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
