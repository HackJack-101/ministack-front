import { useState, useEffect } from "react";
import { ListBucketsCommand } from "@aws-sdk/client-s3";
import { ListTablesCommand } from "@aws-sdk/client-dynamodb";
import { ListQueuesCommand } from "@aws-sdk/client-sqs";
import { ListTopicsCommand } from "@aws-sdk/client-sns";
import { ListSecretsCommand } from "@aws-sdk/client-secrets-manager";
import { ListFunctionsCommand } from "@aws-sdk/client-lambda";
import { ListUsersCommand } from "@aws-sdk/client-iam";
import {
  s3Client,
  ddbDocClient,
  sqsClient,
  snsClient,
  secretsManagerClient,
  lambdaClient,
  iamClient,
} from "../services/awsClients";

export interface DashboardCounts {
  s3: number;
  dynamoDB: number;
  sqs: number;
  sns: number;
  secrets: number;
  lambda: number;
  iam: number;
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
      ]);

      setCounts({
        s3: results[0].status === "fulfilled" ? (results[0].value.Buckets?.length ?? 0) : 0,
        dynamoDB: results[1].status === "fulfilled" ? (results[1].value.TableNames?.length ?? 0) : 0,
        sqs: results[2].status === "fulfilled" ? (results[2].value.QueueUrls?.length ?? 0) : 0,
        sns: results[3].status === "fulfilled" ? (results[3].value.Topics?.length ?? 0) : 0,
        secrets: results[4].status === "fulfilled" ? (results[4].value.SecretList?.length ?? 0) : 0,
        lambda: results[5].status === "fulfilled" ? (results[5].value.Functions?.length ?? 0) : 0,
        iam: results[6].status === "fulfilled" ? (results[6].value.Users?.length ?? 0) : 0,
        loading: false,
      });
    };

    fetchCounts();
  }, []);

  return counts;
};
