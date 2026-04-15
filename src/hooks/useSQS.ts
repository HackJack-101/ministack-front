import { useCallback, useState, useEffect } from "react";
import {
  CreateQueueCommand,
  ListQueuesCommand,
  GetQueueAttributesCommand,
  ReceiveMessageCommand,
  SendMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";
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
    } catch (err) {
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
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create queue";
        toast.error(message);
        throw err;
      }
    },
    [toast, fetchQueues],
  );

  const moveMessages = useCallback(
    async (sourceUrl: string, destinationUrl: string) => {
      let movedCount = 0;
      try {
        // Since MiniStack may not support StartMessageMoveTaskCommand, we implement it manually
        // by receiving, sending, and deleting messages in batches or one by one.
        // For simplicity and to avoid visibility timeout issues, we'll do it sequentially
        // but it could be optimized with batches.

        while (true) {
          const receiveResp = await sqsClient.send(
            new ReceiveMessageCommand({
              QueueUrl: sourceUrl,
              MaxNumberOfMessages: 10,
              WaitTimeSeconds: 0,
              VisibilityTimeout: 30, // Make sure we have time to process
              AttributeNames: ["All"],
              MessageAttributeNames: ["All"],
            }),
          );

          if (!receiveResp.Messages || receiveResp.Messages.length === 0) break;

          for (const msg of receiveResp.Messages) {
            await sqsClient.send(
              new SendMessageCommand({
                QueueUrl: destinationUrl,
                MessageBody: msg.Body,
                MessageAttributes: msg.MessageAttributes,
                // Handle FIFO if needed
                MessageGroupId: destinationUrl.endsWith(".fifo") ? "redrive" : undefined,
                MessageDeduplicationId: destinationUrl.endsWith(".fifo")
                  ? `redrive-${msg.MessageId}-${Date.now()}`
                  : undefined,
              }),
            );

            await sqsClient.send(
              new DeleteMessageCommand({
                QueueUrl: sourceUrl,
                ReceiptHandle: msg.ReceiptHandle!,
              }),
            );
            movedCount++;
          }

          // Stop if we reach a reasonable limit to prevent infinite loops in case of issues
          if (movedCount > 1000) break;
        }

        await fetchQueues();
        return movedCount;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to move messages";
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
      moveMessages,
    }),
    [queues, loading, fetchQueues, createQueue, moveMessages],
  );

  return value;
};
