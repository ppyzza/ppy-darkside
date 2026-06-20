import { NextResponse } from 'next/server';
import { ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/lib/aws';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bucket } = body;

    if (!bucket) {
      return NextResponse.json({ error: 'bucket is required' }, { status: 400 });
    }

    let isTruncated = true;
    let continuationToken: string | undefined = undefined;
    let totalDeleted = 0;

    // Loop until all objects are deleted
    while (isTruncated) {
      const listRes = await s3Client.send(new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: continuationToken,
      }));

      const objects = listRes.Contents || [];
      
      if (objects.length > 0) {
        // Delete in batches of up to 1000
        const deleteRes = await s3Client.send(new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: {
            Objects: objects.map(obj => ({ Key: obj.Key })),
            Quiet: true, // Don't return success responses for each, saves bandwidth
          }
        }));
        
        totalDeleted += objects.length;
      }

      isTruncated = listRes.IsTruncated || false;
      continuationToken = listRes.NextContinuationToken;
    }

    return NextResponse.json({ success: true, deletedCount: totalDeleted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
