import { NextResponse } from 'next/server';
import { CreateBucketCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/lib/aws';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bucket } = body;

    if (!bucket) {
      return NextResponse.json({ error: 'bucket is required' }, { status: 400 });
    }

    await s3Client.send(new CreateBucketCommand({
      Bucket: bucket,
    }));

    return NextResponse.json({ success: true, bucket });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
