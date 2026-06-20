import { NextResponse } from 'next/server';
import { ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '@/lib/aws';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bucket = searchParams.get('bucket');
  const prefix = searchParams.get('prefix') || '';

  if (!bucket) {
    return NextResponse.json({ error: 'Bucket parameter is required' }, { status: 400 });
  }

  try {
    const data = await s3Client.send(new ListObjectsV2Command({ 
      Bucket: bucket, 
      MaxKeys: 100,
      Prefix: prefix,
      Delimiter: '/'
    }));
    
    // Process Folders
    const folders = (data.CommonPrefixes || []).map(p => ({
      Key: p.Prefix,
      isFolder: true,
      Size: 0,
    }));

    // Process Files (Generate pre-signed URLs)
    const objects = await Promise.all((data.Contents || []).filter(obj => obj.Key !== prefix).map(async (obj) => {
      const url = await getSignedUrl(s3Client, new GetObjectCommand({ Bucket: bucket, Key: obj.Key }), { expiresIn: 3600 });
      return {
        ...obj,
        url,
        isFolder: false,
      };
    }));

    return NextResponse.json([...folders, ...objects]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
