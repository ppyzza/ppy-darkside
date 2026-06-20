import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/lib/aws';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bucket, folderName } = body;

    if (!bucket || !folderName) {
      return NextResponse.json({ error: 'bucket and folderName are required' }, { status: 400 });
    }

    // Ensure folderName ends with a trailing slash to identify it as a folder in S3
    const key = folderName.endsWith('/') ? folderName : `${folderName}/`;

    // In S3, a folder is just a 0-byte object with a trailing slash
    await s3Client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: Buffer.alloc(0), 
    }));

    return NextResponse.json({ success: true, key });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
