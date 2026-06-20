'use client';

import { useState, useEffect } from 'react';

export default function SQSPage() {
  const [queues, setQueues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingQueueUrl, setSendingQueueUrl] = useState<string | null>(null);
  const [messagePayload, setMessagePayload] = useState('{\n  "key": "value"\n}');
  const [sendLoading, setSendLoading] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newQueueName, setNewQueueName] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  const [viewingQueueUrl, setViewingQueueUrl] = useState<string | null>(null);
  const [polledMessages, setPolledMessages] = useState<any[]>([]);
  const [pollLoading, setPollLoading] = useState(false);

  const [redriveSourceUrl, setRedriveSourceUrl] = useState<string | null>(null);
  const [redriveTargetUrl, setRedriveTargetUrl] = useState('');
  const [redriveLoading, setRedriveLoading] = useState(false);

  const fetchQueues = () => {
    setLoading(true);
    fetch('/api/sqs')
      .then(res => res.json())
      .then(data => {
        setQueues(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchQueues();
  }, []);

  const handleCreateQueue = async () => {
    if (!newQueueName) return;
    setCreateLoading(true);
    try {
      const res = await fetch('/api/sqs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queueName: newQueueName })
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        setNewQueueName('');
        fetchQueues();
      } else {
        alert('❌ Error: ' + data.error);
      }
    } catch (err: any) {
      alert('❌ Error: ' + err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!sendingQueueUrl) return;
    
    setSendLoading(true);
    try {
      const res = await fetch('/api/sqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queueUrl: sendingQueueUrl,
          messageBody: messagePayload
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ Message sent successfully! ID: ' + data.messageId);
        setSendingQueueUrl(null);
        fetchQueues(); // Refresh counts
      } else {
        alert('❌ Error: ' + data.error);
      }
    } catch (err: any) {
      alert('❌ Error sending message: ' + err.message);
    } finally {
      setSendLoading(false);
    }
  };

  const handlePurgeQueue = async (queueUrl: string) => {
    if (!confirm('Are you sure you want to purge all messages in this queue?')) return;
    
    try {
      const res = await fetch('/api/sqs/purge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queueUrl })
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ Queue purged successfully! (It may take up to 60 seconds for counts to update)');
        fetchQueues();
      } else {
        alert('❌ Error purging: ' + data.error);
      }
    } catch (err: any) {
      alert('❌ Error purging: ' + err.message);
    }
  };

  const handlePollMessages = async (queueUrl: string) => {
    setViewingQueueUrl(queueUrl);
    setPollLoading(true);
    try {
      const res = await fetch(`/api/sqs/receive?queueUrl=${encodeURIComponent(queueUrl)}`);
      const data = await res.json();
      setPolledMessages(data.messages || []);
    } catch (err: any) {
      alert('❌ Error polling messages: ' + err.message);
    } finally {
      setPollLoading(false);
    }
  };

  const handleDeleteMessage = async (receiptHandle: string) => {
    if (!viewingQueueUrl) return;
    try {
      const res = await fetch(`/api/sqs/delete-message?queueUrl=${encodeURIComponent(viewingQueueUrl)}&receiptHandle=${encodeURIComponent(receiptHandle)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setPolledMessages(polledMessages.filter(m => m.ReceiptHandle !== receiptHandle));
        fetchQueues();
      } else {
        alert('❌ Error deleting message: ' + data.error);
      }
    } catch (err: any) {
      alert('❌ Error deleting message: ' + err.message);
    }
  };

  const handleRedrive = async () => {
    if (!redriveSourceUrl || !redriveTargetUrl) return;
    setRedriveLoading(true);
    try {
      const res = await fetch('/api/sqs/redrive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceQueueUrl: redriveSourceUrl,
          targetQueueUrl: redriveTargetUrl
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ Redrive completed! Moved ${data.moved} messages to target queue.`);
        setRedriveSourceUrl(null);
        setRedriveTargetUrl('');
        fetchQueues();
      } else {
        alert('❌ Error running redrive: ' + data.error);
      }
    } catch (err: any) {
      alert('❌ Error running redrive: ' + err.message);
    } finally {
      setRedriveLoading(false);
    }
  };

  return (
    <div className="xp-window" style={{ height: '100%' }}>
      <div className="xp-titlebar">
        <span>SQS Manager</span>
        <div className="xp-titlebar-buttons">
          <div className="xp-titlebar-btn">X</div>
        </div>
      </div>
      
      <div className="xp-content flex-col" style={{ display: 'flex', flexDirection: 'column' }}>
        
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '8px', paddingBottom: '8px', borderBottom: '1px solid #ACA899', marginBottom: '8px' }}>
          <button className="btn" onClick={() => setShowCreateModal(true)}>✨ New Queue</button>
          <div style={{ width: '1px', background: '#ACA899', margin: '0 4px' }}></div>
          <button className="btn" onClick={fetchQueues}>🔄 Refresh</button>
        </div>

        {/* Content Area */}
        <div className="window-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FFFFFF' }}>
          {loading ? (
            <div style={{ padding: '8px' }}>Loading queues...</div>
          ) : (
            <div style={{ flex: 1, overflow: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '20px' }}></th>
                    <th>Queue Name</th>
                    <th style={{ width: '80px', textAlign: 'right' }}>Visible</th>
                    <th style={{ width: '80px', textAlign: 'right' }}>In Flight</th>
                    <th style={{ width: '320px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {queues.map(q => (
                    <tr key={q.url}>
                      <td style={{ textAlign: 'center' }}>📨</td>
                      <td style={{ fontWeight: 'bold' }} title={q.url}>{q.name}</td>
                      <td style={{ textAlign: 'right' }}>{q.attributes?.ApproximateNumberOfMessages || 0}</td>
                      <td style={{ textAlign: 'right' }}>{q.attributes?.ApproximateNumberOfMessagesNotVisible || 0}</td>
                      <td>
                        <div className="flex gap-1" style={{ justifyContent: 'flex-start' }}>
                          <button className="btn" onClick={() => handlePollMessages(q.url)}>👁️ View</button>
                          <button className="btn" onClick={() => setSendingQueueUrl(q.url)}>🚀 Send</button>
                          <button className="btn" onClick={() => setRedriveSourceUrl(q.url)}>🔄 Redrive</button>
                          <button className="btn btn-danger" onClick={() => handlePurgeQueue(q.url)}>🧹 Purge</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {queues.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: '8px', textAlign: 'center' }}>No queues found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="xp-window" style={{ width: '300px' }}>
            <div className="xp-titlebar"><span>Create Queue</span><div className="xp-titlebar-buttons"><div className="xp-titlebar-btn" onClick={() => { setShowCreateModal(false); setNewQueueName(''); }}>X</div></div></div>
            <div className="xp-content">
              <div style={{ marginBottom: '8px', fontSize: '11px' }}>Queue Name:</div>
              <input type="text" style={{ width: '100%', marginBottom: '16px' }} value={newQueueName} onChange={e => setNewQueueName(e.target.value)} autoFocus />
              <div className="flex justify-end gap-2">
                <button className="btn btn-primary" onClick={handleCreateQueue} disabled={createLoading || !newQueueName}>OK</button>
                <button className="btn" onClick={() => { setShowCreateModal(false); setNewQueueName(''); }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {sendingQueueUrl && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="xp-window" style={{ width: '400px' }}>
            <div className="xp-titlebar"><span>Send Message</span><div className="xp-titlebar-buttons"><div className="xp-titlebar-btn" onClick={() => setSendingQueueUrl(null)}>X</div></div></div>
            <div className="xp-content">
              <div style={{ marginBottom: '4px', fontSize: '11px', fontWeight: 'bold' }}>Target Queue:</div>
              <div className="text-muted text-sm truncate mb-4">{sendingQueueUrl}</div>
              <div style={{ marginBottom: '8px', fontSize: '11px' }}>Message Body:</div>
              <textarea 
                style={{ width: '100%', height: '150px', marginBottom: '16px', resize: 'vertical' }}
                value={messagePayload}
                onChange={e => setMessagePayload(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button className="btn btn-primary" onClick={handleSendMessage} disabled={sendLoading}>Send</button>
                <button className="btn" onClick={() => setSendingQueueUrl(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {redriveSourceUrl && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="xp-window" style={{ width: '400px' }}>
            <div className="xp-titlebar"><span>Redrive Messages</span><div className="xp-titlebar-buttons"><div className="xp-titlebar-btn" onClick={() => { setRedriveSourceUrl(null); setRedriveTargetUrl(''); }}>X</div></div></div>
            <div className="xp-content">
              <div style={{ marginBottom: '4px', fontSize: '11px', fontWeight: 'bold' }}>From DLQ:</div>
              <div className="text-muted text-sm truncate mb-4">{redriveSourceUrl}</div>
              <div style={{ marginBottom: '8px', fontSize: '11px' }}>Target Queue URL:</div>
              <input 
                type="text"
                style={{ width: '100%', marginBottom: '16px' }}
                value={redriveTargetUrl}
                onChange={e => setRedriveTargetUrl(e.target.value)}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button className="btn btn-primary" onClick={handleRedrive} disabled={redriveLoading || !redriveTargetUrl}>Start Redrive</button>
                <button className="btn" onClick={() => { setRedriveSourceUrl(null); setRedriveTargetUrl(''); }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewingQueueUrl && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="xp-window" style={{ width: '600px', height: '80%', display: 'flex', flexDirection: 'column' }}>
            <div className="xp-titlebar"><span>Polled Messages</span><div className="xp-titlebar-buttons"><div className="xp-titlebar-btn" onClick={() => setViewingQueueUrl(null)}>X</div></div></div>
            <div className="xp-content" style={{ display: 'flex', flexDirection: 'column', padding: '0' }}>
              <div style={{ padding: '8px', background: '#F5F4EA', borderBottom: '1px solid #ACA899' }}>
                <div style={{ fontSize: '11px', fontWeight: 'bold' }}>Queue:</div>
                <div className="text-muted text-sm truncate">{viewingQueueUrl}</div>
              </div>
              
              <div style={{ flex: 1, overflow: 'auto', background: '#FFFFFF', padding: '8px' }}>
                {pollLoading ? (
                  <div>Polling messages...</div>
                ) : polledMessages.length === 0 ? (
                  <div className="text-muted">No visible messages found in this queue right now.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {polledMessages.map(msg => (
                      <div key={msg.MessageId} className="window-panel" style={{ padding: '8px', background: '#F9F9F9' }}>
                        <div className="flex justify-between items-start mb-2 border-b pb-2" style={{ borderBottom: '1px solid #EBEBEB' }}>
                          <div className="text-sm font-bold truncate" style={{ maxWidth: '80%' }}>ID: {msg.MessageId}</div>
                          <button className="btn btn-danger" onClick={() => handleDeleteMessage(msg.ReceiptHandle)}>🗑️ Delete</button>
                        </div>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '11px', fontFamily: 'monospace' }}>
                          {msg.Body}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
