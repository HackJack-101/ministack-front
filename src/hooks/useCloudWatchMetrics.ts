import { useState, useCallback, useMemo, useEffect } from "react";
import {
  ListMetricsCommand,
  DescribeAlarmsCommand,
  DeleteAlarmsCommand,
  SetAlarmStateCommand,
  type Metric,
  type MetricAlarm,
  StateValue,
} from "@aws-sdk/client-cloudwatch";
import { cwMetricsClient } from "../services/awsClients";
import { useToast } from "./useToast";

export const useCloudWatchMetrics = () => {
  const toast = useToast();
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [alarms, setAlarms] = useState<MetricAlarm[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const response = await cwMetricsClient.send(new ListMetricsCommand({}));
      setMetrics(response.Metrics || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch metrics");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchAlarms = useCallback(async () => {
    try {
      const response = await cwMetricsClient.send(new DescribeAlarmsCommand({}));
      setAlarms(response.MetricAlarms || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch alarms");
    }
  }, [toast]);

  const deleteAlarm = useCallback(
    async (alarmName: string) => {
      try {
        await cwMetricsClient.send(new DeleteAlarmsCommand({ AlarmNames: [alarmName] }));
        toast.success("Alarm deleted");
        await fetchAlarms();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete alarm");
      }
    },
    [fetchAlarms, toast],
  );

  const setAlarmState = useCallback(
    async (alarmName: string, state: StateValue) => {
      try {
        await cwMetricsClient.send(
          new SetAlarmStateCommand({
            AlarmName: alarmName,
            StateValue: state,
            StateReason: "Manually set via Ministack",
          }),
        );
        toast.success("Alarm state updated");
        await fetchAlarms();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to set alarm state");
      }
    },
    [fetchAlarms, toast],
  );

  const refresh = useCallback(() => {
    fetchMetrics();
    fetchAlarms();
  }, [fetchMetrics, fetchAlarms]);

  useEffect(() => {
    fetchMetrics();
    fetchAlarms();
  }, [fetchMetrics, fetchAlarms]);

  return useMemo(
    () => ({
      metrics,
      alarms,
      loading,
      fetchMetrics,
      fetchAlarms,
      deleteAlarm,
      setAlarmState,
      refresh,
    }),
    [metrics, alarms, loading, fetchMetrics, fetchAlarms, deleteAlarm, setAlarmState, refresh],
  );
};
