import React from 'react';
import { SQSPageProps } from './types';
import { SQS_PRESETS } from '../../api/sqs/presets';
import { Send, RefreshCw, AlertCircle, CheckCircle2, Server, List, Code, Play } from 'lucide-react';

export default function SQSDarkside(props: SQSPageProps) {
  const {
    queues, loadingQueues, queueError, selectedQueue, selectedPreset,
    eventName, payloadText, sending, sendResult,
    setSelectedQueue, setEventName, setPayloadText,
    fetchQueues, handlePresetSelect, handleFire
  } = props;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', gap: '20px', overflow: 'hidden', background: 'var(--app-bg)' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--app-text)', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Send size={28} color="var(--app-blue)" />
          SQS Simulator
        </h1>
        <p style={{ color: 'var(--app-text-muted)', marginTop: '8px' }}>
          Test your services by publishing raw JSON payloads directly into LocalStack SQS queues.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '20px', flex: 1, overflow: 'hidden' }}>
        
        {/* Left Panel: Configuration */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', background: 'var(--app-window-bg)', border: '1px solid var(--app-border)', borderRadius: '8px', padding: '20px', overflowY: 'auto' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--app-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Server size={16} color="var(--app-blue)" /> Target Queue
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <select 
                  value={selectedQueue} 
                  onChange={e => setSelectedQueue(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--app-bg)', border: '1px solid var(--app-border)', color: 'var(--app-text)', borderRadius: '6px', appearance: 'none', outline: 'none' }}
                >
                  {queues.length === 0 && <option value="" disabled>No queues available</option>}
                  {queues.map(q => <option key={q} value={q}>{q.split('/').pop()}</option>)}
                </select>
                <div style={{ position: 'absolute', right: '12px', top: '12px', pointerEvents: 'none' }}>▼</div>
              </div>
              <button onClick={fetchQueues} disabled={loadingQueues} style={{ padding: '10px', background: 'var(--app-panel)', border: '1px solid var(--app-border)', color: 'var(--app-text)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <RefreshCw size={16} className={loadingQueues ? "spin" : ""} />
              </button>
            </div>
            {queueError && <div style={{ color: 'var(--app-danger)', fontSize: '12px', marginTop: '4px' }}>{queueError}</div>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--app-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <List size={16} color="var(--app-warning)" /> Load Preset Scenario
            </label>
            <div style={{ position: 'relative' }}>
              <select 
                onChange={e => handlePresetSelect(e.target.value)}
                value={selectedPreset?.name || ''}
                style={{ width: '100%', padding: '10px 12px', background: 'var(--app-bg)', border: '1px solid var(--app-border)', color: 'var(--app-text)', borderRadius: '6px', appearance: 'none', outline: 'none' }}
              >
                <option value="" disabled>-- Custom Payload --</option>
                {SQS_PRESETS.map(p => (
                  <option key={p.name} value={p.name}>{p.name}</option>
                ))}
              </select>
              <div style={{ position: 'absolute', right: '12px', top: '12px', pointerEvents: 'none' }}>▼</div>
            </div>
            {selectedPreset && (
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--app-border)', borderRadius: '6px', fontSize: '12px', color: 'var(--app-text-muted)', lineHeight: '1.5' }}>
                {selectedPreset.description}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--app-text)' }}>Event Name Header</label>
            <input 
              type="text" 
              value={eventName}
              onChange={e => setEventName(e.target.value)}
              placeholder="e.g. UserCreatedEvent"
              style={{ width: '100%', padding: '10px 12px', background: 'var(--app-bg)', border: '1px solid var(--app-border)', color: 'var(--app-text)', borderRadius: '6px', outline: 'none' }}
            />
          </div>

        </div>

        {/* Right Panel: JSON Editor & Action */}
        <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--app-window-bg)', border: '1px solid var(--app-border)', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--app-border)', background: 'var(--app-panel)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code size={16} color="var(--app-blue)" />
              <span style={{ fontSize: '13px', fontWeight: '600' }}>Message Body (JSON)</span>
            </div>
            <textarea
              value={payloadText}
              onChange={e => setPayloadText(e.target.value)}
              style={{
                flex: 1,
                padding: '16px',
                background: 'var(--app-bg)',
                color: 'var(--app-text)',
                border: 'none',
                resize: 'none',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                fontSize: '13px',
                lineHeight: '1.5',
                outline: 'none'
              }}
              spellCheck={false}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--app-window-bg)', border: '1px solid var(--app-border)', borderRadius: '8px', padding: '16px' }}>
            <div style={{ flex: 1 }}>
              {sendResult && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: sendResult.success ? 'var(--app-success)' : 'var(--app-danger)', fontSize: '13px', fontWeight: '500' }}>
                  {sendResult.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  {sendResult.msg}
                </div>
              )}
            </div>
            <button 
              onClick={handleFire} 
              disabled={sending || !selectedQueue || !eventName}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '8px', 
                padding: '12px 24px', 
                background: 'var(--app-blue)', 
                color: 'white', 
                borderRadius: '6px', 
                border: 'none', 
                fontWeight: '600', 
                cursor: 'pointer',
                opacity: (sending || !selectedQueue || !eventName) ? 0.6 : 1,
                transition: 'opacity 0.2s'
              }}
            >
              {sending ? <RefreshCw size={18} className="spin" /> : <Play size={18} fill="currentColor" />}
              {sending ? 'Sending...' : 'Fire Message'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
