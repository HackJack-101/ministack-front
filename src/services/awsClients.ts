import { SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { S3Client } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { SQSClient } from "@aws-sdk/client-sqs";
import { SNSClient } from "@aws-sdk/client-sns";
import { LambdaClient } from "@aws-sdk/client-lambda";
import { IAMClient } from "@aws-sdk/client-iam";

const REGION = "us-east-1";
const MINISTACK_ENDPOINT = "http://localhost:4566";

const credentials = {
  accessKeyId: "test",
  secretAccessKey: "test",
};

export const secretsManagerClient = new SecretsManagerClient({
  region: REGION,
  endpoint: MINISTACK_ENDPOINT,
  credentials,
});

export const s3Client = new S3Client({
  region: REGION,
  endpoint: MINISTACK_ENDPOINT,
  forcePathStyle: true,
  credentials,
});

const ddbClient = new DynamoDBClient({
  region: REGION,
  endpoint: MINISTACK_ENDPOINT,
  credentials,
});

export const ddbDocClient = DynamoDBDocumentClient.from(ddbClient, {
  marshallOptions: {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
  unmarshallOptions: {
    wrapNumbers: false,
  },
});

export const sqsClient = new SQSClient({
  region: REGION,
  endpoint: MINISTACK_ENDPOINT,
  credentials,
});

export const snsClient = new SNSClient({
  region: REGION,
  endpoint: MINISTACK_ENDPOINT,
  credentials,
});

export const lambdaClient = new LambdaClient({
  region: REGION,
  endpoint: MINISTACK_ENDPOINT,
  credentials,
});

export const iamClient = new IAMClient({
  region: REGION,
  endpoint: MINISTACK_ENDPOINT,
  credentials,
});
