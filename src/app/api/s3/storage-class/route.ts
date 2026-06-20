import { NextResponse } from 'next/server';
import { CopyObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/lib/aws';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bucket, key, storageClass } = body;

    if (!bucket || !key || !storageClass) {
      return NextResponse.json({ error: 'bucket, key, and storageClass are required' }, { status: 400 });
    }

    // Changing storage class in S3 is done by copying the object to itself with a new StorageClass
    await s3Client.send(new CopyObjectCommand({
      Bucket: bucket,
      CopySource: encodeURI(`${bucket}/${key}`),
      Key: key,
      StorageClass: storageClass,
      MetadataDirective: 'COPY', // Preserve metadata
    }));

    return NextResponse.json({ success: true, storageClass });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
