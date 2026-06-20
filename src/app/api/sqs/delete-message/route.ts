import { NextResponse } from 'next/server';
import { DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { sqsClient } from '@/lib/aws';

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queueUrl = searchParams.get('queueUrl');
    const receiptHandle = searchParams.get('receiptHandle');

    if (!queueUrl || !receiptHandle) {
      return NextResponse.json({ error: 'queueUrl and receiptHandle are required' }, { status: 400 });
    }

    await sqsClient.send(new DeleteMessageCommand({
      QueueUrl: queueUrl,
      ReceiptHandle: receiptHandle,
    }));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
