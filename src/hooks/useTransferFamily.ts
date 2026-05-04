import { useState, useCallback, useEffect, useMemo } from "react";
import {
  ListServersCommand,
  ListUsersCommand,
  StartServerCommand,
  StopServerCommand,
  DeleteServerCommand,
  DeleteUserCommand,
  type ListedServer,
  type ListedUser,
} from "@aws-sdk/client-transfer";
import { transferClient } from "../services/awsClients";
import { useToast } from "./useToast";

export function useTransferFamily() {
  const [servers, setServers] = useState<ListedServer[]>([]);
  const [users, setUsers] = useState<ListedUser[]>([]);
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetchServers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await transferClient.send(new ListServersCommand({ MaxResults: 100 }));
      setServers(res.Servers ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to fetch Transfer servers");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchUsers = useCallback(
    async (serverId: string) => {
      setSelectedServerId(serverId);
      setLoading(true);
      try {
        const res = await transferClient.send(new ListUsersCommand({ ServerId: serverId, MaxResults: 100 }));
        setUsers(res.Users ?? []);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  const startServer = useCallback(
    async (serverId: string) => {
      try {
        await transferClient.send(new StartServerCommand({ ServerId: serverId }));
        toast.success("Server started");
        await fetchServers();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to start server");
      }
    },
    [toast, fetchServers],
  );

  const stopServer = useCallback(
    async (serverId: string) => {
      try {
        await transferClient.send(new StopServerCommand({ ServerId: serverId }));
        toast.success("Server stopped");
        await fetchServers();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to stop server");
      }
    },
    [toast, fetchServers],
  );

  const deleteServer = useCallback(
    async (serverId: string) => {
      try {
        await transferClient.send(new DeleteServerCommand({ ServerId: serverId }));
        toast.success("Server deleted");
        await fetchServers();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to delete server");
      }
    },
    [toast, fetchServers],
  );

  const deleteUser = useCallback(
    async (serverId: string, userName: string) => {
      try {
        await transferClient.send(new DeleteUserCommand({ ServerId: serverId, UserName: userName }));
        toast.success(`User "${userName}" deleted`);
        await fetchUsers(serverId);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to delete user");
      }
    },
    [toast, fetchUsers],
  );

  const refresh = useCallback(() => {
    fetchServers();
  }, [fetchServers]);

  useEffect(() => {
    fetchServers();
  }, [fetchServers]);

  return useMemo(
    () => ({
      servers,
      users,
      selectedServerId,
      loading,
      fetchUsers,
      startServer,
      stopServer,
      deleteServer,
      deleteUser,
      refresh,
    }),
    [servers, users, selectedServerId, loading, fetchUsers, startServer, stopServer, deleteServer, deleteUser, refresh],
  );
}
