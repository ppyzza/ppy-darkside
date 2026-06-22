import { NextResponse } from 'next/server';
import { SQSClient, ListQueuesCommand } from '@aws-sdk/client-sqs';

const LOCALSTACK_ENDPOINT = process.env.LOCALSTACK_ENDPOINT || 'http://localhost:4566';
const REGION = 'ap-southeast-1';

export async function GET() {
  try {
    const sqs = new SQSClient({
      endpoint: LOCALSTACK_ENDPOINT,
      region: REGION,
      credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
    });

    const command = new ListQueuesCommand({});
    const response = await sqs.send(command);

    return NextResponse.json({
      success: true,
      queues: response.QueueUrls || [],
    });
  } catch (error: any) {
    console.error('Failed to list SQS queues:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
