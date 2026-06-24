
import React from 'react';
import { UtilitiesProps } from './types';

export default function UtilitiesGlass(props: UtilitiesProps) {
  const {
    activeTab, setActiveTab, jwtInput, setJwtInput, jwtHeader, setJwtHeader,
    jwtPayload, setJwtPayload, jwtError, setJwtError, jsonInput, setJsonInput,
    jsonOutput, setJsonOutput, jsonError, setJsonError, epochInput, setEpochInput,
    epochOutput, setEpochOutput, dateInput, setDateInput, dateOutput, setDateOutput,
    uuidOutput, setUuidOutput, base64Raw, setBase64Raw, base64Encoded, setBase64Encoded,
    decodeJwt, formatJson, minifyJson, convertEpoch, convertDate, generateUuid,
    encodeBase64, decodeBase64, tabs
  } = props;

  return (
    <div className="app-window" style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }} style={{ height: '100%', maxWidth: '800px', margin: '0 auto' }}>
      <div className="app-titlebar" style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', fontSize: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <span>Developer PowerToys</span>
        <div className="app-titlebar-buttons">
          <div className="app-titlebar-btn">X</div>
        </div>
      </div>
      
      <div className="app-content" style={{ display: 'flex', flexDirection: 'column' }}>
        
        {/* Tab Header */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '12px' }}>
          {tabs.map((tab, idx) => (
            <div 
              key={idx}
              onClick={() => setActiveTab(idx)}
              style={{
                padding: '4px 12px',
                background: activeTab === idx ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
                borderBottom: activeTab === idx ? '1px solid transparent' : '1px solid rgba(255,255,255,0.1)',
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
        <div className="window-panel" style={{ flex: 1, background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)', padding: '16px', display: 'flex', flexDirection: 'column' }}>
          
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
                <button className="btn btn-primary" style={{ borderRadius: '12px', padding: '8px 24px', background: 'linear-gradient(135deg, var(--app-blue), #6366f1)', border: 'none' }} onClick={decodeJwt}>Decode ⬇️</button>
              </div>
              {jwtError && <div style={{ color: 'red', fontWeight: 'bold' }}>{jwtError}</div>}
              
              <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontWeight: 'bold', color: '#CC0000' }}>Header:</div>
                  <textarea value={jwtHeader} readOnly style={{ flex: 1, fontFamily: 'monospace', width: '100%', background: 'rgba(255,255,255,0.05)' }} />
                </div>
                <div style={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontWeight: 'bold', color: '#008000' }}>Payload:</div>
                  <textarea value={jwtPayload} readOnly style={{ flex: 1, fontFamily: 'monospace', width: '100%', background: 'rgba(255,255,255,0.05)' }} />
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
                  <button className="btn btn-primary" style={{ borderRadius: '12px', padding: '8px 24px', background: 'linear-gradient(135deg, var(--app-blue), #6366f1)', border: 'none' }} onClick={formatJson}>Format ➡️</button>
                  <button className="btn" style={{ borderRadius: '12px', padding: '8px 24px', background: 'rgba(255,255,255,0.1)' }} onClick={minifyJson}>Minify ➡️</button>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontWeight: 'bold' }}>Output JSON:</div>
                  <textarea 
                    value={jsonOutput} 
                    readOnly 
                    style={{ flex: 1, fontFamily: 'monospace', width: '100%', background: 'rgba(255,255,255,0.05)' }}
                  />
                </div>
              </div>
              {jsonError && <div style={{ color: 'red', fontWeight: 'bold' }}>{jsonError}</div>}
            </div>
          )}

          {/* TIME CONVERTER */}
          {activeTab === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '24px' }}>
              <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--app-blue-dark)' }}>Epoch to Date</div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input type="text" value={epochInput} onChange={e => setEpochInput(e.target.value)} style={{ width: '200px' }} />
                  <button className="btn btn-primary" style={{ borderRadius: '12px', padding: '8px 24px', background: 'linear-gradient(135deg, var(--app-blue), #6366f1)', border: 'none' }} onClick={convertEpoch}>Convert ➡️</button>
                  <input type="text" value={epochOutput} readOnly style={{ width: '300px', background: 'rgba(255,255,255,0.05)' }} />
                </div>
              </div>

              <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--app-blue-dark)' }}>Date to Epoch</div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input type="datetime-local" value={dateInput} onChange={e => setDateInput(e.target.value)} style={{ width: '200px', padding: '2px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }} />
                  <button className="btn btn-primary" style={{ borderRadius: '12px', padding: '8px 24px', background: 'linear-gradient(135deg, var(--app-blue), #6366f1)', border: 'none' }} onClick={convertDate}>Convert ➡️</button>
                  <input type="text" value={dateOutput} readOnly style={{ width: '300px', background: 'rgba(255,255,255,0.05)' }} />
                </div>
              </div>
            </div>
          )}

          {/* STRING TOOLS */}
          {activeTab === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '24px' }}>
              <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--app-blue-dark)' }}>UUID v4 Generator</div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button className="btn btn-primary" style={{ borderRadius: '12px', padding: '8px 24px', background: 'linear-gradient(135deg, var(--app-blue), #6366f1)', border: 'none' }} onClick={generateUuid}>Generate UUID</button>
                  <input type="text" value={uuidOutput} readOnly style={{ width: '300px', background: 'rgba(255,255,255,0.05)', fontFamily: 'monospace' }} />
                </div>
              </div>

              <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--app-blue-dark)' }}>Base64 Encoder / Decoder</div>
                <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                  <textarea value={base64Raw} onChange={e => setBase64Raw(e.target.value)} style={{ flex: 1, fontFamily: 'monospace' }} placeholder="Raw Text" />
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px' }}>
                    <button className="btn btn-primary" style={{ borderRadius: '12px', padding: '8px 24px', background: 'linear-gradient(135deg, var(--app-blue), #6366f1)', border: 'none' }} onClick={encodeBase64}>Encode ➡️</button>
                    <button className="btn" style={{ borderRadius: '12px', padding: '8px 24px', background: 'rgba(255,255,255,0.1)' }} onClick={decodeBase64}>⬅️ Decode</button>
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
