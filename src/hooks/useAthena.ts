import { useState, useCallback, useMemo, useEffect } from "react";
import {
  ListQueryExecutionsCommand,
  BatchGetQueryExecutionCommand,
  ListWorkGroupsCommand,
  ListNamedQueriesCommand,
  BatchGetNamedQueryCommand,
  StartQueryExecutionCommand,
  StopQueryExecutionCommand,
  DeleteWorkGroupCommand,
  DeleteNamedQueryCommand,
  type QueryExecution,
  type WorkGroupSummary,
  type NamedQuery,
} from "@aws-sdk/client-athena";
import { athenaClient } from "../services/awsClients";
import { useToast } from "./useToast";

export const useAthena = () => {
  const toast = useToast();
  const [executions, setExecutions] = useState<QueryExecution[]>([]);
  const [workgroups, setWorkgroups] = useState<WorkGroupSummary[]>([]);
  const [namedQueries, setNamedQueries] = useState<NamedQuery[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [execRes, wgRes, nqRes] = await Promise.all([
        athenaClient.send(new ListQueryExecutionsCommand({})),
        athenaClient.send(new ListWorkGroupsCommand({})),
        athenaClient.send(new ListNamedQueriesCommand({})),
      ]);

      const execIds = execRes.QueryExecutionIds || [];
      if (execIds.length > 0) {
        const details = await athenaClient.send(
          new BatchGetQueryExecutionCommand({ QueryExecutionIds: execIds.slice(0, 50) }),
        );
        setExecutions(details.QueryExecutions || []);
      } else {
        setExecutions([]);
      }

      setWorkgroups(wgRes.WorkGroups || []);

      const nqIds = nqRes.NamedQueryIds || [];
      if (nqIds.length > 0) {
        const nqDetails = await athenaClient.send(new BatchGetNamedQueryCommand({ NamedQueryIds: nqIds.slice(0, 50) }));
        setNamedQueries(nqDetails.NamedQueries || []);
      } else {
        setNamedQueries([]);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch Athena resources");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const startQuery = useCallback(
    async (sql: string, workgroup = "primary") => {
      try {
        const res = await athenaClient.send(
          new StartQueryExecutionCommand({
            QueryString: sql,
            WorkGroup: workgroup,
            ResultConfiguration: { OutputLocation: "s3://athena-results/" },
          }),
        );
        toast.success(`Query started: ${res.QueryExecutionId}`);
        await fetchAll();
        return res.QueryExecutionId;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to start query");
      }
    },
    [fetchAll, toast],
  );

  const stopQuery = useCallback(
    async (id: string) => {
      try {
        await athenaClient.send(new StopQueryExecutionCommand({ QueryExecutionId: id }));
        toast.success("Query stopped");
        await fetchAll();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to stop query");
      }
    },
    [fetchAll, toast],
  );

  const deleteWorkgroup = useCallback(
    async (name: string) => {
      try {
        await athenaClient.send(new DeleteWorkGroupCommand({ WorkGroup: name, RecursiveDeleteOption: true }));
        toast.success("Workgroup deleted");
        await fetchAll();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete workgroup");
      }
    },
    [fetchAll, toast],
  );

  const deleteNamedQuery = useCallback(
    async (id: string) => {
      try {
        await athenaClient.send(new DeleteNamedQueryCommand({ NamedQueryId: id }));
        toast.success("Named query deleted");
        await fetchAll();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete named query");
      }
    },
    [fetchAll, toast],
  );

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return useMemo(
    () => ({
      executions,
      workgroups,
      namedQueries,
      loading,
      startQuery,
      stopQuery,
      deleteWorkgroup,
      deleteNamedQuery,
      refresh: fetchAll,
    }),
    [executions, workgroups, namedQueries, loading, startQuery, stopQuery, deleteWorkgroup, deleteNamedQuery, fetchAll],
  );
};
