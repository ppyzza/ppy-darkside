import React from 'react';
import { SQSPageProps } from './types';
import { SQS_PRESETS } from '../../api/sqs/presets';
import { Send, RefreshCw, AlertCircle, CheckCircle2, Server, List, Code, Play } from 'lucide-react';

export default function SQSGlass(props: SQSPageProps) {
  const {
    queues, loadingQueues, queueError, selectedQueue, selectedPreset,
    eventName, payloadText, sending, sendResult,
    setSelectedQueue, setEventName, setPayloadText,
    fetchQueues, handlePresetSelect, handleFire
  } = props;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', gap: '24px', overflow: 'hidden' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, background: 'linear-gradient(135deg, var(--app-blue), #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Send size={28} color="var(--app-blue)" />
            SQS Event Simulator
          </h1>
          <p style={{ color: 'var(--app-text-muted)', marginTop: '8px', fontSize: '14px' }}>
            Mock application events by sending payloads directly to LocalStack.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', flex: 1, overflow: 'hidden' }}>
        
        {/* Left Panel: Configuration */}
        <div style={{ 
          width: '380px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '24px', 
          background: 'var(--app-window-bg)', 
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--app-border)', 
          borderRadius: '24px', 
          padding: '24px', 
          overflowY: 'auto',
          boxShadow: 'var(--app-shadow)'
        }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--app-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ padding: '6px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px' }}><Server size={16} color="var(--app-blue)" /></div>
              Target Queue
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <select 
                  value={selectedQueue} 
                  onChange={e => setSelectedQueue(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--app-border)', color: 'var(--app-text)', borderRadius: '12px', appearance: 'none', outline: 'none', fontSize: '14px', transition: 'border-color 0.2s' }}
                >
                  {queues.length === 0 && <option value="" disabled>No queues available</option>}
                  {queues.map(q => <option key={q} value={q}>{q.split('/').pop()}</option>)}
                </select>
                <div style={{ position: 'absolute', right: '16px', top: '14px', pointerEvents: 'none', color: 'var(--app-text-muted)' }}>▼</div>
              </div>
              <button onClick={fetchQueues} disabled={loadingQueues} style={{ padding: '0 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--app-border)', color: 'var(--app-text)', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'background 0.2s' }}>
                <RefreshCw size={18} className={loadingQueues ? "spin" : ""} color="var(--app-text-muted)" />
              </button>
            </div>
            {queueError && <div style={{ color: 'var(--app-danger)', fontSize: '13px', padding: '8px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px' }}>{queueError}</div>}
          </div>

          <div style={{ height: '1px', background: 'var(--app-border)' }}></div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--app-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ padding: '6px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '8px' }}><List size={16} color="#a855f7" /></div>
              Scenario Preset
            </label>
            <div style={{ position: 'relative' }}>
              <select 
                onChange={e => handlePresetSelect(e.target.value)}
                value={selectedPreset?.name || ''}
                style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--app-border)', color: 'var(--app-text)', borderRadius: '12px', appearance: 'none', outline: 'none', fontSize: '14px', transition: 'border-color 0.2s' }}
              >
                <option value="" disabled>-- Custom Payload --</option>
                {SQS_PRESETS.map(p => (
                  <option key={p.name} value={p.name}>{p.name}</option>
                ))}
              </select>
              <div style={{ position: 'absolute', right: '16px', top: '14px', pointerEvents: 'none', color: 'var(--app-text-muted)' }}>▼</div>
            </div>
            {selectedPreset && (
              <div style={{ padding: '16px', background: 'rgba(168, 85, 247, 0.05)', border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '12px', fontSize: '13px', color: 'var(--app-text-muted)', lineHeight: '1.6' }}>
                {selectedPreset.description}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--app-text)' }}>Event Name Header</label>
            <input 
              type="text" 
              value={eventName}
              onChange={e => setEventName(e.target.value)}
              placeholder="e.g. UserCreatedEvent"
              style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--app-border)', color: 'var(--app-text)', borderRadius: '12px', outline: 'none', fontSize: '14px', transition: 'border-color 0.2s' }}
            />
          </div>

        </div>

        {/* Right Panel: JSON Editor & Action */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--app-window-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--app-border)', borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--app-shadow)' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--app-border)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Code size={18} color="var(--app-blue)" />
              <span style={{ fontSize: '15px', fontWeight: '600' }}>Message Body (JSON)</span>
            </div>
            <textarea
              value={payloadText}
              onChange={e => setPayloadText(e.target.value)}
              style={{
                flex: 1,
                padding: '24px',
                background: 'transparent',
                color: 'var(--app-text)',
                border: 'none',
                resize: 'none',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                fontSize: '14px',
                lineHeight: '1.6',
                outline: 'none'
              }}
              spellCheck={false}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--app-window-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--app-border)', borderRadius: '24px', padding: '20px 24px', boxShadow: 'var(--app-shadow)' }}>
            <div style={{ flex: 1 }}>
              {sendResult && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: sendResult.success ? 'var(--app-success)' : 'var(--app-danger)', fontSize: '14px', fontWeight: '500', padding: '12px 16px', background: sendResult.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderRadius: '12px' }}>
                  {sendResult.success ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                  {sendResult.msg}
                </div>
              )}
            </div>
            <button 
              onClick={handleFire} 
              disabled={sending || !selectedQueue || !eventName}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '12px', 
                padding: '14px 32px', 
                background: 'linear-gradient(135deg, var(--app-blue), #6366f1)', 
                color: 'white', 
                borderRadius: '16px', 
                border: 'none', 
                fontWeight: '600', 
                fontSize: '15px',
                cursor: 'pointer',
                opacity: (sending || !selectedQueue || !eventName) ? 0.6 : 1,
                transition: 'all 0.2s',
                boxShadow: (sending || !selectedQueue || !eventName) ? 'none' : '0 8px 20px rgba(59, 130, 246, 0.3)'
              }}
            >
              {sending ? <RefreshCw size={20} className="spin" /> : <Play size={20} fill="currentColor" />}
              {sending ? 'Publishing...' : 'Publish Event'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
