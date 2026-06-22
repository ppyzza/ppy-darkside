import { S3Client } from '@aws-sdk/client-s3';
import { SQSClient } from '@aws-sdk/client-sqs';

const localstackConfig = {
  region: 'ap-southeast-1',
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
  endpoint: process.env.LOCALSTACK_ENDPOINT || 'http://localhost:4566',
};

export const s3Client = new S3Client({
  ...localstackConfig,
  forcePathStyle: true,
});

export const sqsClient = new SQSClient(localstackConfig);
