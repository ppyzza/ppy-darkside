import { NextResponse } from 'next/server';
import { ListBucketsCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/lib/aws';

export async function GET() {
  try {
    const data = await s3Client.send(new ListBucketsCommand({}));
    return NextResponse.json(data.Buckets || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
