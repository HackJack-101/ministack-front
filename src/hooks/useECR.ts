import { useState, useCallback, useMemo, useEffect } from "react";
import {
  DescribeRepositoriesCommand,
  CreateRepositoryCommand,
  DeleteRepositoryCommand,
  type Repository,
  ImageTagMutability,
} from "@aws-sdk/client-ecr";
import { ecrClient } from "../services/awsClients";
import { useToast } from "./useToast";

export const useECR = () => {
  const toast = useToast();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRepositories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await ecrClient.send(new DescribeRepositoriesCommand({}));
      setRepositories(response.repositories || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch repositories");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createRepository = useCallback(
    async (name: string, imageTagMutability: ImageTagMutability = ImageTagMutability.MUTABLE) => {
      try {
        await ecrClient.send(new CreateRepositoryCommand({ repositoryName: name, imageTagMutability }));
        toast.success("Repository created successfully");
        await fetchRepositories();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to create repository");
      }
    },
    [fetchRepositories, toast],
  );

  const deleteRepository = useCallback(
    async (name: string) => {
      try {
        await ecrClient.send(new DeleteRepositoryCommand({ repositoryName: name, force: true }));
        toast.success("Repository deleted");
        await fetchRepositories();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete repository");
      }
    },
    [fetchRepositories, toast],
  );

  useEffect(() => {
    fetchRepositories();
  }, [fetchRepositories]);

  return useMemo(
    () => ({
      repositories,
      loading,
      fetchRepositories,
      createRepository,
      deleteRepository,
      refresh: fetchRepositories,
    }),
    [repositories, loading, fetchRepositories, createRepository, deleteRepository],
  );
};
