'use client';

import { useState, useEffect } from 'react';

export default function UtilitiesPage() {
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

  return (
    <div className="app-window" style={{ height: '100%', maxWidth: '800px', margin: '0 auto' }}>
      <div className="app-titlebar">
        <span>Developer PowerToys</span>
        <div className="app-titlebar-buttons">
          <div className="app-titlebar-btn">X</div>
        </div>
      </div>
      
      <div className="app-content" style={{ display: 'flex', flexDirection: 'column' }}>
        
        {/* Tab Header */}
        <div style={{ display: 'flex', borderBottom: '1px solid #ACA899', marginBottom: '12px' }}>
          {tabs.map((tab, idx) => (
            <div 
              key={idx}
              onClick={() => setActiveTab(idx)}
              style={{
                padding: '4px 12px',
                background: activeTab === idx ? '#FFFFFF' : '#EBEBEB',
                border: '1px solid #ACA899',
                borderBottom: activeTab === idx ? '1px solid #FFFFFF' : '1px solid #ACA899',
                marginBottom: '-1px',
                borderTopLeftRadius: '3px',
                borderTopRightRadius: '3px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: activeTab === idx ? 'bold' : 'normal',
                zIndex: activeTab === idx ? 2 : 1,
                position: 'relative'
              }}
            >
              {tab}
            </div>
          ))}
        </div>

        {/* Tab Body */}
        <div className="window-panel" style={{ flex: 1, background: '#FFFFFF', padding: '16px', display: 'flex', flexDirection: 'column' }}>
          
          {/* JWT DECODER */}
          {activeTab === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px' }}>
              <div style={{ fontWeight: 'bold' }}>Encoded JWT:</div>
              <textarea 
                value={jwtInput} 
                onChange={e => setJwtInput(e.target.value)} 
                style={{ height: '80px', fontFamily: 'monospace', width: '100%' }}
                placeholder="eyJh..."
              />
              <div>
                <button className="btn btn-primary" onClick={decodeJwt}>Decode ⬇️</button>
              </div>
              {jwtError && <div style={{ color: 'red', fontWeight: 'bold' }}>{jwtError}</div>}
              
              <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontWeight: 'bold', color: '#CC0000' }}>Header:</div>
                  <textarea value={jwtHeader} readOnly style={{ flex: 1, fontFamily: 'monospace', width: '100%', background: '#F5F5F5' }} />
                </div>
                <div style={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontWeight: 'bold', color: '#008000' }}>Payload:</div>
                  <textarea value={jwtPayload} readOnly style={{ flex: 1, fontFamily: 'monospace', width: '100%', background: '#F5F5F5' }} />
                </div>
              </div>
            </div>
          )}

          {/* JSON TOOLS */}
          {activeTab === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontWeight: 'bold' }}>Input JSON:</div>
                  <textarea 
                    value={jsonInput} 
                    onChange={e => setJsonInput(e.target.value)} 
                    style={{ flex: 1, fontFamily: 'monospace', width: '100%' }}
                  />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px' }}>
                  <button className="btn btn-primary" onClick={formatJson}>Format ➡️</button>
                  <button className="btn" onClick={minifyJson}>Minify ➡️</button>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontWeight: 'bold' }}>Output JSON:</div>
                  <textarea 
                    value={jsonOutput} 
                    readOnly 
                    style={{ flex: 1, fontFamily: 'monospace', width: '100%', background: '#F5F5F5' }}
                  />
                </div>
              </div>
              {jsonError && <div style={{ color: 'red', fontWeight: 'bold' }}>{jsonError}</div>}
            </div>
          )}

          {/* TIME CONVERTER */}
          {activeTab === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '24px' }}>
              <div style={{ border: '1px solid #ACA899', padding: '16px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#0A246A' }}>Epoch to Date</div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input type="text" value={epochInput} onChange={e => setEpochInput(e.target.value)} style={{ width: '200px' }} />
                  <button className="btn btn-primary" onClick={convertEpoch}>Convert ➡️</button>
                  <input type="text" value={epochOutput} readOnly style={{ width: '300px', background: '#F5F5F5' }} />
                </div>
              </div>

              <div style={{ border: '1px solid #ACA899', padding: '16px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#0A246A' }}>Date to Epoch</div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input type="datetime-local" value={dateInput} onChange={e => setDateInput(e.target.value)} style={{ width: '200px', padding: '2px', border: '1px solid #7F9DB9' }} />
                  <button className="btn btn-primary" onClick={convertDate}>Convert ➡️</button>
                  <input type="text" value={dateOutput} readOnly style={{ width: '300px', background: '#F5F5F5' }} />
                </div>
              </div>
            </div>
          )}

          {/* STRING TOOLS */}
          {activeTab === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '24px' }}>
              <div style={{ border: '1px solid #ACA899', padding: '16px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#0A246A' }}>UUID v4 Generator</div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button className="btn btn-primary" onClick={generateUuid}>Generate UUID</button>
                  <input type="text" value={uuidOutput} readOnly style={{ width: '300px', background: '#F5F5F5', fontFamily: 'monospace' }} />
                </div>
              </div>

              <div style={{ border: '1px solid #ACA899', padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#0A246A' }}>Base64 Encoder / Decoder</div>
                <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                  <textarea value={base64Raw} onChange={e => setBase64Raw(e.target.value)} style={{ flex: 1, fontFamily: 'monospace' }} placeholder="Raw Text" />
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px' }}>
                    <button className="btn btn-primary" onClick={encodeBase64}>Encode ➡️</button>
                    <button className="btn" onClick={decodeBase64}>⬅️ Decode</button>
                  </div>
                  <textarea value={base64Encoded} onChange={e => setBase64Encoded(e.target.value)} style={{ flex: 1, fontFamily: 'monospace' }} placeholder="Base64 Encoded" />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
