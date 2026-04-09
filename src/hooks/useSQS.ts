import { useCallback } from "react";
import { CreateQueueCommand } from "@aws-sdk/client-sqs";
import { sqsClient } from "../services/awsClients";
import { useToast } from "./useToast";

export const useSQS = () => {
  const toast = useToast();

  const createQueue = useCallback(async (name: string, attributes?: Record<string, string>) => {
    try {
      await sqsClient.send(
        new CreateQueueCommand({
          QueueName: name,
          Attributes: attributes,
        })
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create queue";
      toast.error(message);
      throw err;
    }
  }, [toast]);

  return {
    createQueue,
  };
};
