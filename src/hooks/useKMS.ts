import { useState, useCallback, useMemo } from "react";
import {
  ListKeysCommand,
  DescribeKeyCommand,
  CreateKeyCommand,
  DisableKeyCommand,
  EnableKeyCommand,
  ScheduleKeyDeletionCommand,
} from "@aws-sdk/client-kms";
import type { KeyMetadata } from "@aws-sdk/client-kms";
import { kmsClient } from "../services/awsClients";
import { useToast } from "./useToast";

export const useKMS = () => {
  const [keys, setKeys] = useState<KeyMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    try {
      const listResponse = await kmsClient.send(new ListKeysCommand({}));
      const keyEntries = listResponse.Keys || [];
      
      const keyDetails = await Promise.all(
        keyEntries.map(async (k) => {
          try {
            const detailResponse = await kmsClient.send(new DescribeKeyCommand({ KeyId: k.KeyId }));
            return detailResponse.KeyMetadata!;
          } catch {
            return null;
          }
        })
      );
      
      setKeys(keyDetails.filter((k): k is KeyMetadata => k !== null));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch keys");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createKey = useCallback(async (description: string) => {
    try {
      await kmsClient.send(new CreateKeyCommand({ Description: description }));
      toast.success("KMS key created successfully");
      await fetchKeys();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create key");
    }
  }, [fetchKeys, toast]);

  const toggleKeyStatus = useCallback(async (keyId: string, enabled: boolean) => {
    try {
      if (enabled) {
        await kmsClient.send(new DisableKeyCommand({ KeyId: keyId }));
        toast.success("Key disabled");
      } else {
        await kmsClient.send(new EnableKeyCommand({ KeyId: keyId }));
        toast.success("Key enabled");
      }
      await fetchKeys();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update key status");
    }
  }, [fetchKeys, toast]);

  const deleteKey = useCallback(async (keyId: string) => {
    try {
      await kmsClient.send(new ScheduleKeyDeletionCommand({ KeyId: keyId, PendingWindowInDays: 7 }));
      toast.success("Key deletion scheduled");
      await fetchKeys();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to schedule key deletion");
    }
  }, [fetchKeys, toast]);

  return useMemo(() => ({
    keys,
    loading,
    fetchKeys,
    createKey,
    toggleKeyStatus,
    deleteKey,
  }), [keys, loading, fetchKeys, createKey, toggleKeyStatus, deleteKey]);
};
