'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { SQS_PRESETS, SQSPreset } from '../api/sqs/presets';
import SQSXP from './components/SQSXP';
import SQSDarkside from './components/SQSDarkside';
import SQSGlass from './components/SQSGlass';
import { SQSPageProps } from './components/types';

export default function SQSPage() {
  const { theme } = useTheme();
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

  const props: SQSPageProps = {
    queues, loadingQueues, queueError, selectedQueue, selectedPreset,
    eventName, payloadText, sending, sendResult,
    setSelectedQueue, setEventName, setPayloadText,
    fetchQueues, handlePresetSelect, handleFire
  };

  switch (theme) {
    case 'darkside':
      return <SQSDarkside {...props} />;
    case 'glass':
      return <SQSGlass {...props} />;
    case 'xp':
    default:
      return <SQSXP {...props} />;
  }
}
