import { useState, useCallback, useMemo, useEffect } from "react";
import {
  DescribeFileSystemsCommand,
  DescribeAccessPointsCommand,
  DeleteFileSystemCommand,
  DeleteAccessPointCommand,
  type FileSystemDescription,
  type AccessPointDescription,
} from "@aws-sdk/client-efs";
import { efsClient } from "../services/awsClients";
import { useToast } from "./useToast";

export const useEFS = () => {
  const toast = useToast();
  const [fileSystems, setFileSystems] = useState<FileSystemDescription[]>([]);
  const [accessPoints, setAccessPoints] = useState<AccessPointDescription[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [fsRes, apRes] = await Promise.all([
        efsClient.send(new DescribeFileSystemsCommand({})),
        efsClient.send(new DescribeAccessPointsCommand({})),
      ]);
      setFileSystems(fsRes.FileSystems || []);
      setAccessPoints(apRes.AccessPoints || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch EFS resources");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteFileSystem = useCallback(
    async (id: string) => {
      try {
        await efsClient.send(new DeleteFileSystemCommand({ FileSystemId: id }));
        toast.success("File system deleted");
        await fetchAll();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete file system");
      }
    },
    [fetchAll, toast],
  );

  const deleteAccessPoint = useCallback(
    async (id: string) => {
      try {
        await efsClient.send(new DeleteAccessPointCommand({ AccessPointId: id }));
        toast.success("Access point deleted");
        await fetchAll();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete access point");
      }
    },
    [fetchAll, toast],
  );

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return useMemo(
    () => ({
      fileSystems,
      accessPoints,
      loading,
      deleteFileSystem,
      deleteAccessPoint,
      refresh: fetchAll,
    }),
    [fileSystems, accessPoints, loading, deleteFileSystem, deleteAccessPoint, fetchAll],
  );
};
