import { NextResponse } from 'next/server';
import { ListQueuesCommand, GetQueueAttributesCommand, SendMessageCommand } from '@aws-sdk/client-sqs';
import { sqsClient } from '@/lib/aws';

export async function GET() {
  try {
    const data = await sqsClient.send(new ListQueuesCommand({}));
    const queueUrls = data.QueueUrls || [];

    const queuesWithDetails = await Promise.all(queueUrls.map(async (url) => {
      const parts = url.split('/');
      const name = parts[parts.length - 1];
      
      try {
        const attributesData = await sqsClient.send(new GetQueueAttributesCommand({
          QueueUrl: url,
          AttributeNames: ['ApproximateNumberOfMessages', 'ApproximateNumberOfMessagesNotVisible']
        }));
        
        return {
          url,
          name,
          attributes: attributesData.Attributes || {},
        };
      } catch (err) {
        return { url, name, attributes: { error: 'Failed to fetch attributes' } };
      }
    }));

    return NextResponse.json(queuesWithDetails);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { queueUrl, messageBody } = body;

    if (!queueUrl || !messageBody) {
      return NextResponse.json({ error: 'queueUrl and messageBody are required' }, { status: 400 });
    }

    const data = await sqsClient.send(new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: typeof messageBody === 'string' ? messageBody : JSON.stringify(messageBody),
    }));

    return NextResponse.json({ success: true, messageId: data.MessageId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
