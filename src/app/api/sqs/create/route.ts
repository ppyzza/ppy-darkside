import { NextResponse } from 'next/server';
import { CreateQueueCommand } from '@aws-sdk/client-sqs';
import { sqsClient } from '@/lib/aws';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { queueName } = body;

    if (!queueName) {
      return NextResponse.json({ error: 'queueName is required' }, { status: 400 });
    }

    const data = await sqsClient.send(new CreateQueueCommand({
      QueueName: queueName,
    }));

    return NextResponse.json({ success: true, queueUrl: data.QueueUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
