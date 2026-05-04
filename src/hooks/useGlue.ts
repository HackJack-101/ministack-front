import { useState, useCallback, useMemo, useEffect } from "react";
import {
  GetDatabasesCommand,
  GetTablesCommand,
  GetCrawlersCommand,
  GetJobsCommand,
  StartCrawlerCommand,
  DeleteDatabaseCommand,
  DeleteCrawlerCommand,
  DeleteJobCommand,
  type Database,
  type Table,
  type Crawler,
  type Job,
} from "@aws-sdk/client-glue";
import { glueClient } from "../services/awsClients";
import { useToast } from "./useToast";

export const useGlue = () => {
  const toast = useToast();
  const [databases, setDatabases] = useState<Database[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [crawlers, setCrawlers] = useState<Crawler[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [dbRes, crawlerRes, jobRes] = await Promise.all([
        glueClient.send(new GetDatabasesCommand({})),
        glueClient.send(new GetCrawlersCommand({})),
        glueClient.send(new GetJobsCommand({})),
      ]);
      const dbs = dbRes.DatabaseList || [];
      setDatabases(dbs);
      setCrawlers(crawlerRes.Crawlers || []);
      setJobs(jobRes.Jobs || []);

      if (dbs.length > 0) {
        const tableResults = await Promise.all(
          dbs.map((db) =>
            glueClient.send(new GetTablesCommand({ DatabaseName: db.Name! })).catch(() => ({ TableList: [] })),
          ),
        );
        setTables(tableResults.flatMap((r) => r.TableList || []));
      } else {
        setTables([]);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch Glue resources");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const startCrawler = useCallback(
    async (name: string) => {
      try {
        await glueClient.send(new StartCrawlerCommand({ Name: name }));
        toast.success(`Crawler "${name}" started`);
        await fetchAll();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to start crawler");
      }
    },
    [fetchAll, toast],
  );

  const deleteDatabase = useCallback(
    async (name: string) => {
      try {
        await glueClient.send(new DeleteDatabaseCommand({ Name: name }));
        toast.success("Database deleted");
        await fetchAll();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete database");
      }
    },
    [fetchAll, toast],
  );

  const deleteCrawler = useCallback(
    async (name: string) => {
      try {
        await glueClient.send(new DeleteCrawlerCommand({ Name: name }));
        toast.success("Crawler deleted");
        await fetchAll();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete crawler");
      }
    },
    [fetchAll, toast],
  );

  const deleteJob = useCallback(
    async (name: string) => {
      try {
        await glueClient.send(new DeleteJobCommand({ JobName: name }));
        toast.success("Job deleted");
        await fetchAll();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete job");
      }
    },
    [fetchAll, toast],
  );

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return useMemo(
    () => ({
      databases,
      tables,
      crawlers,
      jobs,
      loading,
      startCrawler,
      deleteDatabase,
      deleteCrawler,
      deleteJob,
      refresh: fetchAll,
    }),
    [databases, tables, crawlers, jobs, loading, startCrawler, deleteDatabase, deleteCrawler, deleteJob, fetchAll],
  );
};
