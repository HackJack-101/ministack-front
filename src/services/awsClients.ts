import { SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { S3Client } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { SQSClient } from "@aws-sdk/client-sqs";
import { SNSClient } from "@aws-sdk/client-sns";
import { LambdaClient } from "@aws-sdk/client-lambda";
import { IAMClient } from "@aws-sdk/client-iam";
import { CloudWatchLogsClient } from "@aws-sdk/client-cloudwatch-logs";
import { CloudWatchClient } from "@aws-sdk/client-cloudwatch";
import { SSMClient } from "@aws-sdk/client-ssm";
import { SESClient } from "@aws-sdk/client-ses";
import { EventBridgeClient } from "@aws-sdk/client-eventbridge";
import { KMSClient } from "@aws-sdk/client-kms";
import { Route53Client } from "@aws-sdk/client-route-53";
import { CloudFormationClient } from "@aws-sdk/client-cloudformation";
import { ECSClient } from "@aws-sdk/client-ecs";
import { RDSClient } from "@aws-sdk/client-rds";
import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { EC2Client } from "@aws-sdk/client-ec2";
import { ACMClient } from "@aws-sdk/client-acm";
import { WAFV2Client } from "@aws-sdk/client-wafv2";
import { KinesisClient } from "@aws-sdk/client-kinesis";
import { SFNClient } from "@aws-sdk/client-sfn";

const REGION = "us-east-1";
const getMinistackEndpoint = () => {
  // Try to get from localStorage first to allow easy runtime configuration
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("ministack-endpoint");
    if (saved) return saved;
  }

  // Try to get from environment variable first (Vite-style)
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_MINISTACK_ENDPOINT) {
    return import.meta.env.VITE_MINISTACK_ENDPOINT;
  }

  // If we are in a browser, use the current hostname to handle remote access
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    // Use the same hostname as the current page to match origins and avoid CORS issues
    // while keeping the port 4566 for the MiniStack backend.
    return `http://${hostname}:4566`;
  }

  return "http://localhost:4566";
};

export const MINISTACK_ENDPOINT = getMinistackEndpoint();

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

export const cwLogsClient = new CloudWatchLogsClient({
  region: REGION,
  endpoint: MINISTACK_ENDPOINT,
  credentials,
});

export const cwMetricsClient = new CloudWatchClient({
  region: REGION,
  endpoint: MINISTACK_ENDPOINT,
  credentials,
});

export const ssmClient = new SSMClient({
  region: REGION,
  endpoint: MINISTACK_ENDPOINT,
  credentials,
});

export const sesClient = new SESClient({
  region: REGION,
  endpoint: MINISTACK_ENDPOINT,
  credentials,
});

export const eventBridgeClient = new EventBridgeClient({
  region: REGION,
  endpoint: MINISTACK_ENDPOINT,
  credentials,
});

export const kmsClient = new KMSClient({
  region: REGION,
  endpoint: MINISTACK_ENDPOINT,
  credentials,
});

export const route53Client = new Route53Client({
  region: REGION,
  endpoint: MINISTACK_ENDPOINT,
  credentials,
});

export const cloudFormationClient = new CloudFormationClient({
  region: REGION,
  endpoint: MINISTACK_ENDPOINT,
  credentials,
});

export const ecsClient = new ECSClient({
  region: REGION,
  endpoint: MINISTACK_ENDPOINT,
  credentials,
});

export const rdsClient = new RDSClient({
  region: REGION,
  endpoint: MINISTACK_ENDPOINT,
  credentials,
});

export const cognitoClient = new CognitoIdentityProviderClient({
  region: REGION,
  endpoint: MINISTACK_ENDPOINT,
  credentials,
});

export const cognitoIdentityClient = new CognitoIdentityClient({
  region: REGION,
  endpoint: MINISTACK_ENDPOINT,
  credentials,
});

export const ec2Client = new EC2Client({
  region: REGION,
  endpoint: MINISTACK_ENDPOINT,
  credentials,
});

export const acmClient = new ACMClient({
  region: REGION,
  endpoint: MINISTACK_ENDPOINT,
  credentials,
});

export const wafv2Client = new WAFV2Client({
  region: REGION,
  endpoint: MINISTACK_ENDPOINT,
  credentials,
});

export const kinesisClient = new KinesisClient({
  region: REGION,
  endpoint: MINISTACK_ENDPOINT,
  credentials,
});

export const sfnClient = new SFNClient({
  region: REGION,
  endpoint: MINISTACK_ENDPOINT,
  credentials,
});
