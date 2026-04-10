import { useCallback, useState, useEffect } from "react";
import { CreateQueueCommand, ListQueuesCommand, GetQueueAttributesCommand } from "@aws-sdk/client-sqs";
import { sqsClient } from "../services/awsClients";
import { useToast } from "./useToast";
import { useMemo } from "react";

export interface QueueInfo {
  url: string;
  arn: string;
  approximateNumberOfMessages: number;
  approximateNumberOfMessagesNotVisible: number;
  approximateNumberOfMessagesDelayed: number;
  maxReceiveCount?: number;
}

export const useSQS = () => {
  const toast = useToast();
  const [queues, setQueues] = useState<QueueInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchQueues = useCallback(async () => {
    setLoading(true);
    try {
      const listResponse = await sqsClient.send(new ListQueuesCommand({}));
      const urls = listResponse.QueueUrls || [];

      const queueInfos = await Promise.all(
        urls.map(async (url) => {
          const attrResponse = await sqsClient.send(
            new GetQueueAttributesCommand({
              QueueUrl: url,
              AttributeNames: [
                "QueueArn",
                "ApproximateNumberOfMessages",
                "ApproximateNumberOfMessagesNotVisible",
                "ApproximateNumberOfMessagesDelayed",
                "RedrivePolicy",
              ],
            }),
          );

          const attributes = attrResponse.Attributes || {};
          let maxReceiveCount: number | undefined;

          if (attributes.RedrivePolicy) {
            try {
              const policy = JSON.parse(attributes.RedrivePolicy);
              maxReceiveCount = parseInt(policy.maxReceiveCount);
            } catch (e) {
              console.error("Failed to parse RedrivePolicy", e);
            }
          }

          return {
            url,
            arn: attributes.QueueArn || "",
            approximateNumberOfMessages: parseInt(attributes.ApproximateNumberOfMessages || "0"),
            approximateNumberOfMessagesNotVisible: parseInt(attributes.ApproximateNumberOfMessagesNotVisible || "0"),
            approximateNumberOfMessagesDelayed: parseInt(attributes.ApproximateNumberOfMessagesDelayed || "0"),
            maxReceiveCount,
          };
        }),
      );

      setQueues(queueInfos);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch queues");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchQueues();
  }, [fetchQueues]);

  const createQueue = useCallback(
    async (name: string, attributes?: Record<string, string>) => {
      try {
        await sqsClient.send(
          new CreateQueueCommand({
            QueueName: name,
            Attributes: attributes,
          }),
        );
        await fetchQueues();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to create queue";
        toast.error(message);
        throw err;
      }
    },
    [toast, fetchQueues],
  );

  const value = useMemo(
    () => ({
      queues,
      loading,
      fetchQueues,
      createQueue,
    }),
    [queues, loading, fetchQueues, createQueue],
  );

  return value;
};
