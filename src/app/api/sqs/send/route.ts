import { NextResponse } from 'next/server';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const LOCALSTACK_ENDPOINT = process.env.LOCALSTACK_ENDPOINT || 'http://localhost:4566';
const REGION = 'ap-southeast-1';

export async function POST(req: Request) {
  try {
    const { queueUrl, payload, eventName } = await req.json();

    if (!queueUrl) {
      return NextResponse.json({ success: false, error: 'Queue URL is required' }, { status: 400 });
    }

    if (!payload || !eventName) {
      return NextResponse.json({ success: false, error: 'Payload and eventName are required' }, { status: 400 });
    }

    const sqs = new SQSClient({
      endpoint: LOCALSTACK_ENDPOINT,
      region: REGION,
      credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
    });

    // The consumer might expect the raw SQS message body to match AwsEventMessageBody
    // Wait, the consumer parses: const { eventName, payload } = context;
    // So the SQS MessageBody should be JSON.stringify({ eventName, payload })
    const messageBody = JSON.stringify({
      eventName,
      payload
    });

    // If it's a FIFO queue, we need MessageGroupId
    const isFifo = queueUrl.endsWith('.fifo');
    const params: any = {
      QueueUrl: queueUrl,
      MessageBody: messageBody,
    };

    if (isFifo) {
      params.MessageGroupId = `simulator-group-${Date.now()}`;
      params.MessageDeduplicationId = `simulator-dedup-${Date.now()}`;
    }

    const command = new SendMessageCommand(params);
    const response = await sqs.send(command);

    return NextResponse.json({
      success: true,
      messageId: response.MessageId,
    });
  } catch (error: any) {
    console.error('Failed to send SQS message:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
