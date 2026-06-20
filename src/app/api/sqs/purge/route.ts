import { NextResponse } from 'next/server';
import { PurgeQueueCommand } from '@aws-sdk/client-sqs';
import { sqsClient } from '@/lib/aws';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { queueUrl } = body;

    if (!queueUrl) {
      return NextResponse.json({ error: 'queueUrl is required' }, { status: 400 });
    }

    await sqsClient.send(new PurgeQueueCommand({ QueueUrl: queueUrl }));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
