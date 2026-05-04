import { useState, useCallback, useEffect, useMemo } from "react";
import {
  ListSchedulesCommand,
  ListScheduleGroupsCommand,
  DeleteScheduleCommand,
  DeleteScheduleGroupCommand,
  type ScheduleSummary,
  type ScheduleGroupSummary,
} from "@aws-sdk/client-scheduler";
import { schedulerClient } from "../services/awsClients";
import { useToast } from "./useToast";

export function useScheduler() {
  const [schedules, setSchedules] = useState<ScheduleSummary[]>([]);
  const [groups, setGroups] = useState<ScheduleGroupSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [schedulesRes, groupsRes] = await Promise.all([
        schedulerClient.send(new ListSchedulesCommand({ MaxResults: 100 })),
        schedulerClient.send(new ListScheduleGroupsCommand({ MaxResults: 100 })),
      ]);
      setSchedules(schedulesRes.Schedules ?? []);
      setGroups(groupsRes.ScheduleGroups ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to fetch schedules");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteSchedule = useCallback(
    async (name: string, groupName: string) => {
      try {
        await schedulerClient.send(new DeleteScheduleCommand({ Name: name, GroupName: groupName }));
        toast.success(`Schedule "${name}" deleted`);
        await fetchAll();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to delete schedule");
      }
    },
    [toast, fetchAll],
  );

  const deleteGroup = useCallback(
    async (name: string) => {
      try {
        await schedulerClient.send(new DeleteScheduleGroupCommand({ Name: name }));
        toast.success(`Schedule group "${name}" deleted`);
        await fetchAll();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to delete schedule group");
      }
    },
    [toast, fetchAll],
  );

  const refresh = useCallback(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return useMemo(
    () => ({ schedules, groups, loading, deleteSchedule, deleteGroup, refresh }),
    [schedules, groups, loading, deleteSchedule, deleteGroup, refresh],
  );
}
