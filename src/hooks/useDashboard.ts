import { useState, useEffect } from "react";
import { ListBucketsCommand } from "@aws-sdk/client-s3";
import { ListTablesCommand } from "@aws-sdk/client-dynamodb";
import { ListQueuesCommand } from "@aws-sdk/client-sqs";
import { ListTopicsCommand } from "@aws-sdk/client-sns";
import { ListSecretsCommand } from "@aws-sdk/client-secrets-manager";
import { ListFunctionsCommand } from "@aws-sdk/client-lambda";
import { ListUsersCommand } from "@aws-sdk/client-iam";
import { DescribeLogGroupsCommand } from "@aws-sdk/client-cloudwatch-logs";
import { DescribeParametersCommand } from "@aws-sdk/client-ssm";
import { ListIdentitiesCommand } from "@aws-sdk/client-ses";
import { ListEventBusesCommand } from "@aws-sdk/client-eventbridge";
import { ListKeysCommand } from "@aws-sdk/client-kms";
import { ListHostedZonesCommand } from "@aws-sdk/client-route-53";
import { ListStacksCommand } from "@aws-sdk/client-cloudformation";
import { ListClustersCommand } from "@aws-sdk/client-ecs";
import { DescribeDBInstancesCommand } from "@aws-sdk/client-rds";
import { ListUserPoolsCommand } from "@aws-sdk/client-cognito-identity-provider";
import { DescribeInstancesCommand } from "@aws-sdk/client-ec2";
import { ListCertificatesCommand } from "@aws-sdk/client-acm";
import { ListWebACLsCommand } from "@aws-sdk/client-wafv2";
import { ListStreamsCommand } from "@aws-sdk/client-kinesis";
import { ListStateMachinesCommand } from "@aws-sdk/client-sfn";
import {
  s3Client,
  ddbDocClient,
  sqsClient,
  snsClient,
  secretsManagerClient,
  lambdaClient,
  iamClient,
  cwLogsClient,
  ssmClient,
  sesClient,
  eventBridgeClient,
  kmsClient,
  route53Client,
  cloudFormationClient,
  ecsClient,
  rdsClient,
  cognitoClient,
  ec2Client,
  acmClient,
  wafv2Client,
  kinesisClient,
  sfnClient,
} from "../services/awsClients";

export interface DashboardCounts {
  s3: number;
  dynamoDB: number;
  sqs: number;
  sns: number;
  secrets: number;
  lambda: number;
  iam: number;
  logs: number;
  ssm: number;
  ses: number;
  events: number;
  kms: number;
  route53: number;
  cloudformation: number;
  ecs: number;
  rds: number;
  cognito: number;
  ec2: number;
  acm: number;
  wafv2: number;
  kinesis: number;
  sfn: number;
  loading: boolean;
}

export const useDashboard = (): DashboardCounts => {
  const [counts, setCounts] = useState<DashboardCounts>({
    s3: 0,
    dynamoDB: 0,
    sqs: 0,
    sns: 0,
    secrets: 0,
    lambda: 0,
    iam: 0,
    logs: 0,
    ssm: 0,
    ses: 0,
    events: 0,
    kms: 0,
    route53: 0,
    cloudformation: 0,
    ecs: 0,
    rds: 0,
    cognito: 0,
    ec2: 0,
    acm: 0,
    wafv2: 0,
    kinesis: 0,
    sfn: 0,
    loading: true,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      const results = await Promise.allSettled([
        s3Client.send(new ListBucketsCommand({})),
        ddbDocClient.send(new ListTablesCommand({})),
        sqsClient.send(new ListQueuesCommand({})),
        snsClient.send(new ListTopicsCommand({})),
        secretsManagerClient.send(new ListSecretsCommand({})),
        lambdaClient.send(new ListFunctionsCommand({})),
        iamClient.send(new ListUsersCommand({})),
        cwLogsClient.send(new DescribeLogGroupsCommand({})),
        ssmClient.send(new DescribeParametersCommand({})),
        sesClient.send(new ListIdentitiesCommand({})),
        eventBridgeClient.send(new ListEventBusesCommand({})),
        kmsClient.send(new ListKeysCommand({})),
        route53Client.send(new ListHostedZonesCommand({})),
        cloudFormationClient.send(new ListStacksCommand({})),
        ecsClient.send(new ListClustersCommand({})),
        rdsClient.send(new DescribeDBInstancesCommand({})),
        cognitoClient.send(new ListUserPoolsCommand({ MaxResults: 100 })),
        ec2Client.send(new DescribeInstancesCommand({})),
        acmClient.send(new ListCertificatesCommand({})),
        wafv2Client.send(new ListWebACLsCommand({ Scope: "REGIONAL" })),
        kinesisClient.send(new ListStreamsCommand({})),
        sfnClient.send(new ListStateMachinesCommand({})),
      ]);

      setCounts({
        s3: results[0].status === "fulfilled" ? (results[0].value.Buckets?.length ?? 0) : 0,
        dynamoDB: results[1].status === "fulfilled" ? (results[1].value.TableNames?.length ?? 0) : 0,
        sqs: results[2].status === "fulfilled" ? (results[2].value.QueueUrls?.length ?? 0) : 0,
        sns: results[3].status === "fulfilled" ? (results[3].value.Topics?.length ?? 0) : 0,
        secrets: results[4].status === "fulfilled" ? (results[4].value.SecretList?.length ?? 0) : 0,
        lambda: results[5].status === "fulfilled" ? (results[5].value.Functions?.length ?? 0) : 0,
        iam: results[6].status === "fulfilled" ? (results[6].value.Users?.length ?? 0) : 0,
        logs: results[7].status === "fulfilled" ? (results[7].value.logGroups?.length ?? 0) : 0,
        ssm: results[8].status === "fulfilled" ? (results[8].value.Parameters?.length ?? 0) : 0,
        ses: results[9].status === "fulfilled" ? (results[9].value.Identities?.length ?? 0) : 0,
        events: results[10].status === "fulfilled" ? (results[10].value.EventBuses?.length ?? 0) : 0,
        kms: results[11].status === "fulfilled" ? (results[11].value.Keys?.length ?? 0) : 0,
        route53: results[12].status === "fulfilled" ? (results[12].value.HostedZones?.length ?? 0) : 0,
        cloudformation: results[13].status === "fulfilled" ? (results[13].value.StackSummaries?.length ?? 0) : 0,
        ecs: results[14].status === "fulfilled" ? (results[14].value.clusterArns?.length ?? 0) : 0,
        rds: results[15].status === "fulfilled" ? (results[15].value.DBInstances?.length ?? 0) : 0,
        cognito: results[16].status === "fulfilled" ? (results[16].value.UserPools?.length ?? 0) : 0,
        ec2: results[17].status === "fulfilled" ? (results[17].value.Reservations?.reduce((acc, r) => acc + (r.Instances?.length ?? 0), 0) ?? 0) : 0,
        acm: results[18].status === "fulfilled" ? (results[18].value.CertificateSummaryList?.length ?? 0) : 0,
        wafv2: results[19].status === "fulfilled" ? (results[19].value.WebACLs?.length ?? 0) : 0,
        kinesis: results[20].status === "fulfilled" ? (results[20].value.StreamNames?.length ?? 0) : 0,
        sfn: results[21].status === "fulfilled" ? (results[21].value.stateMachines?.length ?? 0) : 0,
        loading: false,
      });
    };

    fetchCounts();
  }, []);

  return counts;
};
