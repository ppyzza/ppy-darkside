import { SQSPreset } from '../../api/sqs/presets';

export interface SQSPageProps {
  queues: string[];
  loadingQueues: boolean;
  queueError: string;
  selectedQueue: string;
  selectedPreset: SQSPreset | null;
  eventName: string;
  payloadText: string;
  sending: boolean;
  sendResult: { success: boolean; msg: string } | null;
  
  setSelectedQueue: (q: string) => void;
  setEventName: (name: string) => void;
  setPayloadText: (text: string) => void;
  
  fetchQueues: () => void;
  handlePresetSelect: (presetName: string) => void;
  handleFire: () => void;
}
