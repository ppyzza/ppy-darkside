import { NextResponse } from 'next/server';
import { DeleteBucketCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/lib/aws';

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bucket = searchParams.get('bucket');

    if (!bucket) {
      return NextResponse.json({ error: 'bucket is required' }, { status: 400 });
    }

    await s3Client.send(new DeleteBucketCommand({
      Bucket: bucket,
    }));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
