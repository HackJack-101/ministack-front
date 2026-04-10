import { useState, useCallback, useEffect, useMemo } from "react";
import {
  DescribeLogGroupsCommand,
  DescribeLogStreamsCommand,
  GetLogEventsCommand,
  DeleteLogGroupCommand,
  CreateLogGroupCommand,
  FilterLogEventsCommand,
} from "@aws-sdk/client-cloudwatch-logs";
import type { LogGroup } from "@aws-sdk/client-cloudwatch-logs";
import { cwLogsClient } from "../services/awsClients";
import { useToast } from "./useToast";

export const useCloudWatchLogs = () => {
  const [logGroups, setLogGroups] = useState<LogGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetchLogGroups = useCallback(async () => {
    setLoading(true);
    try {
      const response = await cwLogsClient.send(new DescribeLogGroupsCommand({}));
      setLogGroups(response.logGroups || []);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch log groups");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchLogStreams = useCallback(
    async (logGroupName: string) => {
      try {
        const response = await cwLogsClient.send(
          new DescribeLogStreamsCommand({ logGroupName, orderBy: "LastEventTime", descending: true }),
        );
        return response.logStreams || [];
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to fetch log streams");
        return [];
      }
    },
    [toast],
  );

  const fetchLogEvents = useCallback(
    async (logGroupName: string, logStreamName: string) => {
      try {
        const response = await cwLogsClient.send(
          new GetLogEventsCommand({ logGroupName, logStreamName, startFromHead: false }),
        );
        return response.events || [];
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to fetch log events");
        return [];
      }
    },
    [toast],
  );

  const filterLogEvents = useCallback(
    async (logGroupName: string, filterPattern?: string) => {
      try {
        const response = await cwLogsClient.send(new FilterLogEventsCommand({ logGroupName, filterPattern }));
        return response.events || [];
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to filter log events");
        return [];
      }
    },
    [toast],
  );

  const deleteLogGroup = useCallback(
    async (logGroupName: string) => {
      try {
        await cwLogsClient.send(new DeleteLogGroupCommand({ logGroupName }));
        toast.success("Log group deleted successfully");
        await fetchLogGroups();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to delete log group");
      }
    },
    [fetchLogGroups, toast],
  );

  const createLogGroup = useCallback(
    async (logGroupName: string) => {
      try {
        await cwLogsClient.send(new CreateLogGroupCommand({ logGroupName }));
        toast.success("Log group created successfully");
        await fetchLogGroups();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to create log group");
      }
    },
    [fetchLogGroups, toast],
  );

  useEffect(() => {
    fetchLogGroups();
  }, [fetchLogGroups]);

  return useMemo(
    () => ({
      logGroups,
      loading,
      fetchLogGroups,
      fetchLogStreams,
      fetchLogEvents,
      filterLogEvents,
      deleteLogGroup,
      createLogGroup,
    }),
    [
      logGroups,
      loading,
      fetchLogGroups,
      fetchLogStreams,
      fetchLogEvents,
      filterLogEvents,
      deleteLogGroup,
      createLogGroup,
    ],
  );
};
