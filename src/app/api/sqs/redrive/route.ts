import { NextResponse } from 'next/server';
import { ReceiveMessageCommand, SendMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { sqsClient } from '@/lib/aws';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sourceQueueUrl, targetQueueUrl } = body;

    if (!sourceQueueUrl || !targetQueueUrl) {
      return NextResponse.json({ error: 'sourceQueueUrl and targetQueueUrl are required' }, { status: 400 });
    }

    let totalMoved = 0;
    
    // We will do a max of 10 loops (100 messages) to prevent infinite loops in the free tier implementation
    for (let i = 0; i < 10; i++) {
      // 1. Receive up to 10 messages from DLQ
      const receiveRes = await sqsClient.send(new ReceiveMessageCommand({
        QueueUrl: sourceQueueUrl,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 1, // Short wait
      }));

      const messages = receiveRes.Messages || [];
      if (messages.length === 0) break; // No more messages in DLQ

      // 2. Process each message
      for (const msg of messages) {
        if (!msg.Body || !msg.ReceiptHandle) continue;

        // Send to target queue
        await sqsClient.send(new SendMessageCommand({
          QueueUrl: targetQueueUrl,
          MessageBody: msg.Body,
          MessageAttributes: msg.MessageAttributes,
        }));

        // Delete from DLQ
        await sqsClient.send(new DeleteMessageCommand({
          QueueUrl: sourceQueueUrl,
          ReceiptHandle: msg.ReceiptHandle,
        }));

        totalMoved++;
      }
    }

    return NextResponse.json({ success: true, moved: totalMoved });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
