'use client';

import { useState, useEffect } from 'react';
import { SQS_PRESETS, SQSPreset } from '../api/sqs/presets';

export default function SQSPage() {
  const [queues, setQueues] = useState<string[]>([]);
  const [loadingQueues, setLoadingQueues] = useState(false);
  const [queueError, setQueueError] = useState('');

  const [selectedQueue, setSelectedQueue] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<SQSPreset | null>(null);
  
  const [eventName, setEventName] = useState('');
  const [payloadText, setPayloadText] = useState('{\n  \n}');
  
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; msg: string } | null>(null);

  const fetchQueues = async () => {
    setLoadingQueues(true);
    setQueueError('');
    try {
      const res = await fetch('/api/sqs/list');
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setQueues(data.queues);
      if (data.queues.length > 0 && !selectedQueue) {
        setSelectedQueue(data.queues[0]);
      }
    } catch (err: any) {
      setQueueError(err.message);
    } finally {
      setLoadingQueues(false);
    }
  };

  useEffect(() => {
    fetchQueues();
  }, []);

  const handlePresetSelect = (presetName: string) => {
    const preset = SQS_PRESETS.find(p => p.name === presetName);
    if (preset) {
      setSelectedPreset(preset);
      setEventName(preset.eventName);
      setPayloadText(JSON.stringify(preset.payload, null, 2));
      setSendResult(null);
    }
  };

  const handleFire = async () => {
    if (!selectedQueue) {
      setSendResult({ success: false, msg: 'Please select a Queue URL' });
      return;
    }

    let parsedPayload;
    try {
      parsedPayload = JSON.parse(payloadText);
    } catch (e) {
      setSendResult({ success: false, msg: 'Invalid JSON payload. Please fix format.' });
      return;
    }

    setSending(true);
    setSendResult(null);
    
    try {
      const res = await fetch('/api/sqs/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queueUrl: selectedQueue,
          eventName: eventName,
          payload: parsedPayload,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      
      setSendResult({ success: true, msg: `Message Sent! ID: ${data.messageId}` });
    } catch (err: any) {
      setSendResult({ success: false, msg: err.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="xp-window" style={{ height: '100%', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
      <div className="xp-titlebar">
        <span>SQS Scenario Simulator 🚀</span>
        <div className="xp-titlebar-buttons">
          <div className="xp-titlebar-btn">X</div>
        </div>
      </div>

      <div className="xp-content" style={{ display: 'flex', flexDirection: 'column', padding: '16px', gap: '16px', overflowY: 'auto' }}>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          {/* Left Panel: Config */}
          <div className="window-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontWeight: 'bold', color: '#0A246A', borderBottom: '1px solid #ACA899', paddingBottom: '4px' }}>
              1. Select Localstack Queue
            </div>
            
            <div>
              {loadingQueues ? (
                <div style={{ fontSize: '11px', color: '#666' }}>Fetching queues from localhost:4566...</div>
              ) : queueError ? (
                <div style={{ fontSize: '11px', color: 'red' }}>Error: {queueError}</div>
              ) : queues.length === 0 ? (
                <div style={{ fontSize: '11px', color: '#666' }}>No queues found in Localstack.</div>
              ) : (
                <select 
                  value={selectedQueue} 
                  onChange={e => setSelectedQueue(e.target.value)}
                  style={{ width: '100%', padding: '4px', fontSize: '11px' }}
                >
                  {queues.map(q => <option key={q} value={q}>{q.split('/').pop()}</option>)}
                </select>
              )}
              <button onClick={fetchQueues} style={{ marginTop: '4px', fontSize: '10px', padding: '2px 6px' }}>🔄 Refresh Queues</button>
            </div>

            <div style={{ fontWeight: 'bold', color: '#0A246A', borderBottom: '1px solid #ACA899', paddingBottom: '4px', marginTop: '12px' }}>
              2. Load Preset Scenario
            </div>
            
            <div>
              <select 
                onChange={e => handlePresetSelect(e.target.value)}
                value={selectedPreset?.name || ''}
                style={{ width: '100%', padding: '4px', fontSize: '11px' }}
              >
                <option value="" disabled>-- Select Preset Scenario --</option>
                {SQS_PRESETS.map(p => (
                  <option key={p.name} value={p.name}>{p.name}</option>
                ))}
              </select>
              {selectedPreset && (
                <div style={{ marginTop: '8px', fontSize: '11px', color: '#666', background: '#F9F9F9', padding: '6px', border: '1px solid #EBEBEB' }}>
                  ℹ️ {selectedPreset.description}
                </div>
              )}
            </div>

            <div style={{ fontWeight: 'bold', color: '#0A246A', borderBottom: '1px solid #ACA899', paddingBottom: '4px', marginTop: '12px' }}>
              3. Event Name
            </div>
            <input 
              type="text" 
              value={eventName}
              onChange={e => setEventName(e.target.value)}
              placeholder="e.g. EmployeeDocumentEvent.DocumentReEncrypt"
              style={{ width: '100%', padding: '4px', fontSize: '11px' }}
            />
          </div>

          {/* Right Panel: JSON Payload */}
          <div className="window-panel" style={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontWeight: 'bold', color: '#0A246A', borderBottom: '1px solid #ACA899', paddingBottom: '4px', marginBottom: '8px' }}>
              JSON Payload
            </div>
            <textarea
              value={payloadText}
              onChange={e => setPayloadText(e.target.value)}
              style={{
                flex: 1,
                minHeight: '250px',
                fontFamily: 'monospace',
                fontSize: '12px',
                padding: '8px',
                background: '#FFF',
                border: '1px inset #ACA899',
                resize: 'none'
              }}
              spellCheck={false}
            />
          </div>
        </div>

        {/* Bottom Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
          {sendResult && (
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: sendResult.success ? 'green' : 'red' }}>
              {sendResult.success ? '✅ ' : '❌ '}{sendResult.msg}
            </div>
          )}
          <button 
            className="btn btn-primary" 
            onClick={handleFire} 
            disabled={sending || !selectedQueue || !eventName}
            style={{ fontSize: '14px', padding: '8px 24px' }}
          >
            {sending ? 'Firing...' : '🚀 Fire Message'}
          </button>
        </div>

      </div>
    </div>
  );
}
