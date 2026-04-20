import { useState, useCallback, useMemo, useEffect } from "react";
import {
  ListNamespacesCommand,
  CreateHttpNamespaceCommand,
  DeleteNamespaceCommand,
  ListServicesCommand,
  type Namespace,
  type Service,
} from "@aws-sdk/client-servicediscovery";
import { serviceDiscoveryClient } from "../services/awsClients";
import { useToast } from "./useToast";

export const useCloudMap = () => {
  const toast = useToast();
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNamespaces = useCallback(async () => {
    setLoading(true);
    try {
      const response = await serviceDiscoveryClient.send(new ListNamespacesCommand({}));
      setNamespaces(response.Namespaces || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch namespaces");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchServices = useCallback(async () => {
    try {
      const response = await serviceDiscoveryClient.send(new ListServicesCommand({}));
      setServices(response.Services || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch services");
    }
  }, [toast]);

  const createNamespace = useCallback(
    async (name: string) => {
      try {
        await serviceDiscoveryClient.send(
          new CreateHttpNamespaceCommand({
            Name: name,
            CreatorRequestId: `ministack-${Date.now()}`,
          }),
        );
        toast.success("Namespace created successfully");
        await fetchNamespaces();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to create namespace");
      }
    },
    [fetchNamespaces, toast],
  );

  const deleteNamespace = useCallback(
    async (id: string) => {
      try {
        await serviceDiscoveryClient.send(new DeleteNamespaceCommand({ Id: id }));
        toast.success("Namespace deleted");
        await fetchNamespaces();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete namespace");
      }
    },
    [fetchNamespaces, toast],
  );

  useEffect(() => {
    fetchNamespaces();
    fetchServices();
  }, [fetchNamespaces, fetchServices]);

  return useMemo(
    () => ({
      namespaces,
      services,
      loading,
      fetchNamespaces,
      fetchServices,
      createNamespace,
      deleteNamespace,
      refresh: () => {
        fetchNamespaces();
        fetchServices();
      },
    }),
    [namespaces, services, loading, fetchNamespaces, fetchServices, createNamespace, deleteNamespace],
  );
};
