import { useState, useCallback, useMemo, useEffect } from "react";
import {
  ListApplicationsCommand,
  CreateApplicationCommand,
  DeleteApplicationCommand,
  ListEnvironmentsCommand,
  type Application,
  type Environment,
} from "@aws-sdk/client-appconfig";
import { appConfigClient } from "../services/awsClients";
import { useToast } from "./useToast";

export const useAppConfig = () => {
  const toast = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await appConfigClient.send(new ListApplicationsCommand({}));
      setApplications(response.Items || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createApplication = useCallback(
    async (name: string, description?: string) => {
      try {
        await appConfigClient.send(new CreateApplicationCommand({ Name: name, Description: description }));
        toast.success("Application created successfully");
        await fetchApplications();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to create application");
      }
    },
    [fetchApplications, toast],
  );

  const deleteApplication = useCallback(
    async (appId: string) => {
      try {
        await appConfigClient.send(new DeleteApplicationCommand({ ApplicationId: appId }));
        toast.success("Application deleted");
        await fetchApplications();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete application");
      }
    },
    [fetchApplications, toast],
  );

  const fetchEnvironments = useCallback(
    async (appId: string) => {
      try {
        const response = await appConfigClient.send(new ListEnvironmentsCommand({ ApplicationId: appId }));
        setEnvironments((prev) => {
          const filtered = prev.filter((e) => e.ApplicationId !== appId);
          return [...filtered, ...(response.Items || [])];
        });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to fetch environments");
      }
    },
    [toast],
  );

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return useMemo(
    () => ({
      applications,
      environments,
      loading,
      fetchApplications,
      createApplication,
      deleteApplication,
      fetchEnvironments,
      refresh: fetchApplications,
    }),
    [applications, environments, loading, fetchApplications, createApplication, deleteApplication, fetchEnvironments],
  );
};
