import { useState, useCallback, useMemo, useEffect } from "react";
import { ListStreamsCommand, CreateStreamCommand, DeleteStreamCommand } from "@aws-sdk/client-kinesis";
import { kinesisClient } from "../services/awsClients";
import { useToast } from "./useToast";

export const useKinesis = () => {
  const toast = useToast();
  const [streams, setStreams] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStreams = useCallback(async () => {
    setLoading(true);
    try {
      const response = await kinesisClient.send(new ListStreamsCommand({}));
      setStreams(response.StreamNames || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch streams");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createStream = useCallback(
    async (name: string, shardCount: number = 1) => {
      try {
        await kinesisClient.send(new CreateStreamCommand({ StreamName: name, ShardCount: shardCount }));
        toast.success(`Stream ${name} created`);
        await fetchStreams();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to create stream");
      }
    },
    [fetchStreams, toast],
  );

  const deleteStream = useCallback(
    async (name: string) => {
      try {
        await kinesisClient.send(new DeleteStreamCommand({ StreamName: name }));
        toast.success("Stream deleted");
        await fetchStreams();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete stream");
      }
    },
    [fetchStreams, toast],
  );

  useEffect(() => {
    fetchStreams();
  }, [fetchStreams]);

  return useMemo(
    () => ({
      streams,
      loading,
      fetchStreams,
      createStream,
      deleteStream,
      refresh: fetchStreams,
    }),
    [streams, loading, fetchStreams, createStream, deleteStream],
  );
};
