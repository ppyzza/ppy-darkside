import { NextResponse } from 'next/server';
import { ReceiveMessageCommand } from '@aws-sdk/client-sqs';
import { sqsClient } from '@/lib/aws';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queueUrl = searchParams.get('queueUrl');

    if (!queueUrl) {
      return NextResponse.json({ error: 'queueUrl is required' }, { status: 400 });
    }

    const data = await sqsClient.send(new ReceiveMessageCommand({
      QueueUrl: queueUrl,
      MaxNumberOfMessages: 10,
      VisibilityTimeout: 10, // Hide for 10 seconds while viewing
      WaitTimeSeconds: 0,
    }));

    return NextResponse.json({ messages: data.Messages || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
