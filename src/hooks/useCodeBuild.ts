import { useState, useCallback, useMemo, useEffect } from "react";
import {
  ListProjectsCommand,
  BatchGetProjectsCommand,
  DeleteProjectCommand,
  StartBuildCommand,
  BatchGetBuildsCommand,
  ListBuildsForProjectCommand,
  type Project,
  type Build,
} from "@aws-sdk/client-codebuild";
import { codeBuildClient } from "../services/awsClients";
import { useToast } from "./useToast";

export const useCodeBuild = () => {
  const toast = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const listResponse = await codeBuildClient.send(new ListProjectsCommand({}));
      const names = listResponse.projects || [];
      if (names.length > 0) {
        const detailResponse = await codeBuildClient.send(new BatchGetProjectsCommand({ names }));
        setProjects(detailResponse.projects || []);
      } else {
        setProjects([]);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteProject = useCallback(
    async (name: string) => {
      try {
        await codeBuildClient.send(new DeleteProjectCommand({ name }));
        toast.success("Project deleted");
        await fetchProjects();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete project");
      }
    },
    [fetchProjects, toast],
  );

  const startBuild = useCallback(
    async (projectName: string) => {
      try {
        await codeBuildClient.send(new StartBuildCommand({ projectName }));
        toast.success(`Build started for ${projectName}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to start build");
      }
    },
    [toast],
  );

  const fetchBuildsForProject = useCallback(
    async (name: string) => {
      try {
        const listResponse = await codeBuildClient.send(new ListBuildsForProjectCommand({ projectName: name }));
        const ids = listResponse.ids || [];
        if (ids.length > 0) {
          const detailResponse = await codeBuildClient.send(new BatchGetBuildsCommand({ ids }));
          setBuilds(detailResponse.builds || []);
        } else {
          setBuilds([]);
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to fetch builds");
      }
    },
    [toast],
  );

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return useMemo(
    () => ({
      projects,
      builds,
      loading,
      fetchProjects,
      deleteProject,
      startBuild,
      fetchBuildsForProject,
      refresh: fetchProjects,
    }),
    [projects, builds, loading, fetchProjects, deleteProject, startBuild, fetchBuildsForProject],
  );
};
