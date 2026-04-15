import { useState, useCallback, useEffect, useMemo } from "react";
import {
  ListTopicsCommand,
  CreateTopicCommand,
  DeleteTopicCommand,
  ListSubscriptionsByTopicCommand,
  SubscribeCommand,
  UnsubscribeCommand,
  PublishCommand,
  type Topic,
  type Subscription,
} from "@aws-sdk/client-sns";
import { snsClient } from "../services/awsClients";
import { useToast } from "./useToast";

export const useSNS = () => {
  const toast = useToast();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTopics = useCallback(async () => {
    setLoading(true);
    try {
      const response = await snsClient.send(new ListTopicsCommand({}));
      setTopics(response.Topics || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch topics");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const createTopic = useCallback(
    async (name: string) => {
      await snsClient.send(new CreateTopicCommand({ Name: name }));
      await fetchTopics();
    },
    [fetchTopics],
  );

  const deleteTopic = useCallback(
    async (topicArn: string) => {
      await snsClient.send(new DeleteTopicCommand({ TopicArn: topicArn }));
      await fetchTopics();
    },
    [fetchTopics],
  );

  const listSubscriptions = useCallback(async (topicArn: string): Promise<Subscription[]> => {
    const response = await snsClient.send(new ListSubscriptionsByTopicCommand({ TopicArn: topicArn }));
    return response.Subscriptions || [];
  }, []);

  const subscribe = useCallback(async (topicArn: string, protocol: string, endpoint: string) => {
    await snsClient.send(new SubscribeCommand({ TopicArn: topicArn, Protocol: protocol, Endpoint: endpoint }));
  }, []);

  const unsubscribe = useCallback(async (subscriptionArn: string) => {
    await snsClient.send(new UnsubscribeCommand({ SubscriptionArn: subscriptionArn }));
  }, []);

  const publish = useCallback(async (topicArn: string, message: string, subject?: string) => {
    await snsClient.send(new PublishCommand({ TopicArn: topicArn, Message: message, Subject: subject }));
  }, []);

  return useMemo(
    () => ({
      topics,
      loading,
      fetchTopics,
      createTopic,
      deleteTopic,
      listSubscriptions,
      subscribe,
      unsubscribe,
      publish,
    }),
    [topics, loading, fetchTopics, createTopic, deleteTopic, listSubscriptions, subscribe, unsubscribe, publish],
  );
};
