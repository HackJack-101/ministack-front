import { useState, useEffect, useRef, useCallback } from "react";
import {
  ListBucketsCommand,
  CreateBucketCommand,
  DeleteBucketCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  CopyObjectCommand,
  GetBucketVersioningCommand,
  PutBucketVersioningCommand,
  GetBucketEncryptionCommand,
  PutBucketEncryptionCommand,
  DeleteBucketEncryptionCommand,
  GetBucketLifecycleConfigurationCommand,
  PutBucketLifecycleConfigurationCommand,
  DeleteBucketLifecycleCommand,
  GetBucketCorsCommand,
  PutBucketCorsCommand,
  DeleteBucketCorsCommand,
  GetBucketAclCommand,
  PutBucketAclCommand,
  GetBucketTaggingCommand,
  PutBucketTaggingCommand,
  DeleteBucketTaggingCommand,
  GetBucketPolicyCommand,
  PutBucketPolicyCommand,
  DeleteBucketPolicyCommand,
  GetBucketNotificationConfigurationCommand,
  PutBucketNotificationConfigurationCommand,
  GetBucketLoggingCommand,
  PutBucketLoggingCommand,
  ListObjectVersionsCommand,
  PutObjectLockConfigurationCommand,
  GetObjectLockConfigurationCommand,
  PutObjectRetentionCommand,
  GetObjectRetentionCommand,
  PutObjectLegalHoldCommand,
  GetObjectLegalHoldCommand,
  PutBucketReplicationCommand,
  GetBucketReplicationCommand,
  DeleteBucketReplicationCommand,
  type Bucket,
  type _Object,
  type NotificationConfiguration,
} from "@aws-sdk/client-s3";

export type { NotificationConfiguration };
export { type Bucket, type _Object };
import { s3Client } from "../services/awsClients";
import { useToast } from "./useToast";

export type UploadFileStatus = { name: string; status: "uploading" | "done" | "error" };

export const useS3 = () => {
  const toast = useToast();
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null);
  const [objects, setObjects] = useState<_Object[]>([]);
  const [loading, setLoading] = useState(true);
  const [objectsLoading, setObjectsLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadFileStatus[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchBuckets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await s3Client.send(new ListBucketsCommand({}));
      setBuckets(response.Buckets || []);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch buckets");
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchObjects = useCallback(async (bucketName: string, prefix?: string) => {
    setObjectsLoading(true);
    try {
      const response = await s3Client.send(
        new ListObjectsV2Command({
          Bucket: bucketName,
          Prefix: prefix || undefined,
          Delimiter: "/",
        }),
      );

      const folders: _Object[] = (response.CommonPrefixes || []).map((p) => ({
        Key: p.Prefix,
        Size: 0,
      }));

      // Filter out the prefix itself if it's returned in Contents and it's a folder (ends with /)
      const files = (response.Contents || []).filter((obj) => {
        if (!prefix || !prefix.endsWith("/")) return true;
        return obj.Key !== prefix;
      });

      setObjects([...folders, ...files]);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : `Failed to fetch objects for ${bucketName}`);
    } finally {
      setObjectsLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchBuckets();
  }, [fetchBuckets]);

  const createBucket = async (name: string, objectLockEnabled?: boolean) => {
    await s3Client.send(
      new CreateBucketCommand({
        Bucket: name,
        ObjectLockEnabledForBucket: objectLockEnabled,
      }),
    );
    fetchBuckets();
  };

  const deleteBucket = async (name: string) => {
    try {
      await s3Client.send(new DeleteBucketCommand({ Bucket: name }));
      if (selectedBucket === name) setSelectedBucket(null);
      fetchBuckets();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete bucket. Is it empty?");
    }
  };

  const deleteObject = async (key: string) => {
    if (!selectedBucket) return;
    try {
      await s3Client.send(new DeleteObjectCommand({ Bucket: selectedBucket, Key: key }));
      // Refresh current prefix
      const parentPrefix = key.includes("/") ? key.substring(0, key.lastIndexOf("/") + 1) : "";
      fetchObjects(selectedBucket, parentPrefix);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete object");
    }
  };

  const deleteObjects = async (keys: string[]) => {
    if (!selectedBucket || keys.length === 0) return;
    try {
      await s3Client.send(
        new DeleteObjectsCommand({
          Bucket: selectedBucket,
          Delete: { Objects: keys.map((Key) => ({ Key })) },
        }),
      );
      // Refresh current prefix from the first key
      const key = keys[0];
      const parentPrefix = key.includes("/") ? key.substring(0, key.lastIndexOf("/") + 1) : "";
      fetchObjects(selectedBucket, parentPrefix);
      toast.success(`Deleted ${keys.length} objects.`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete objects");
    }
  };

  const copyObject = async (sourceKey: string, destKey: string) => {
    if (!selectedBucket) return;
    try {
      await s3Client.send(
        new CopyObjectCommand({
          Bucket: selectedBucket,
          CopySource: `${selectedBucket}/${sourceKey}`,
          Key: destKey,
        }),
      );
      const parentPrefix = destKey.includes("/") ? destKey.substring(0, destKey.lastIndexOf("/") + 1) : "";
      fetchObjects(selectedBucket, parentPrefix);
      toast.success(`Copied ${sourceKey} to ${destKey}.`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to copy object");
    }
  };

  const headObject = async (key: string) => {
    if (!selectedBucket) return null;
    try {
      return await s3Client.send(new HeadObjectCommand({ Bucket: selectedBucket, Key: key }));
    } catch (err: unknown) {
      console.error("HeadObject failed:", err);
      return null;
    }
  };

  const listObjectVersions = async (key: string) => {
    if (!selectedBucket) return [];
    try {
      const response = await s3Client.send(
        new ListObjectVersionsCommand({ Bucket: selectedBucket, Prefix: key }),
      );
      return response.Versions || [];
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch object versions");
      return [];
    }
  };

  const getBucketVersioning = async (name: string) => {
    try {
      const response = await s3Client.send(new GetBucketVersioningCommand({ Bucket: name }));
      return response.Status || "Disabled";
    } catch {
      return "Disabled";
    }
  };

  const putBucketVersioning = async (name: string, status: "Enabled" | "Suspended") => {
    await s3Client.send(
      new PutBucketVersioningCommand({ Bucket: name, VersioningConfiguration: { Status: status } }),
    );
  };

  const getBucketEncryption = async (name: string) => {
    try {
      const response = await s3Client.send(new GetBucketEncryptionCommand({ Bucket: name }));
      return response.ServerSideEncryptionConfiguration?.Rules?.[0];
    } catch {
      return null;
    }
  };

  const putBucketEncryption = async (name: string, kmsId?: string) => {
    await s3Client.send(
      new PutBucketEncryptionCommand({
        Bucket: name,
        ServerSideEncryptionConfiguration: {
          Rules: [
            {
              ApplyServerSideEncryptionByDefault: {
                SSEAlgorithm: kmsId ? "aws:kms" : "AES256",
                KMSMasterKeyID: kmsId,
              },
            },
          ],
        },
      }),
    );
  };

  const deleteBucketEncryption = async (name: string) => {
    await s3Client.send(new DeleteBucketEncryptionCommand({ Bucket: name }));
  };

  const getBucketCors = async (name: string) => {
    try {
      const response = await s3Client.send(new GetBucketCorsCommand({ Bucket: name }));
      return response.CORSRules || [];
    } catch {
      return [];
    }
  };

  const putBucketCors = async (name: string, rules: any[]) => {
    await s3Client.send(new PutBucketCorsCommand({ Bucket: name, CORSConfiguration: { CORSRules: rules } }));
  };

  const deleteBucketCors = async (name: string) => {
    await s3Client.send(new DeleteBucketCorsCommand({ Bucket: name }));
  };

  const getBucketTagging = async (name: string) => {
    try {
      const response = await s3Client.send(new GetBucketTaggingCommand({ Bucket: name }));
      return response.TagSet || [];
    } catch {
      return [];
    }
  };

  const putBucketTagging = async (name: string, tags: { Key: string; Value: string }[]) => {
    await s3Client.send(new PutBucketTaggingCommand({ Bucket: name, Tagging: { TagSet: tags } }));
  };

  const deleteBucketTagging = async (name: string) => {
    await s3Client.send(new DeleteBucketTaggingCommand({ Bucket: name }));
  };

  const getBucketPolicy = async (name: string) => {
    try {
      const response = await s3Client.send(new GetBucketPolicyCommand({ Bucket: name }));
      return response.Policy || "";
    } catch {
      return "";
    }
  };

  const putBucketPolicy = async (name: string, policy: string) => {
    await s3Client.send(new PutBucketPolicyCommand({ Bucket: name, Policy: policy }));
  };

  const deleteBucketPolicy = async (name: string) => {
    await s3Client.send(new DeleteBucketPolicyCommand({ Bucket: name }));
  };

  const getBucketLifecycle = async (name: string) => {
    try {
      const response = await s3Client.send(new GetBucketLifecycleConfigurationCommand({ Bucket: name }));
      return response.Rules || [];
    } catch {
      return [];
    }
  };

  const putBucketLifecycle = async (name: string, rules: any[]) => {
    await s3Client.send(
      new PutBucketLifecycleConfigurationCommand({
        Bucket: name,
        LifecycleConfiguration: { Rules: rules },
      }),
    );
  };

  const deleteBucketLifecycle = async (name: string) => {
    await s3Client.send(new DeleteBucketLifecycleCommand({ Bucket: name }));
  };

  const getBucketAcl = async (name: string) => {
    try {
      return await s3Client.send(new GetBucketAclCommand({ Bucket: name }));
    } catch {
      return null;
    }
  };

  const putBucketAcl = async (name: string, acl: any) => {
    await s3Client.send(new PutBucketAclCommand({ Bucket: name, ...acl }));
  };

  const getBucketLogging = async (name: string) => {
    try {
      const response = await s3Client.send(new GetBucketLoggingCommand({ Bucket: name }));
      return response.LoggingEnabled;
    } catch {
      return null;
    }
  };

  const putBucketLogging = async (name: string, logging: any) => {
    await s3Client.send(new PutBucketLoggingCommand({ Bucket: name, BucketLoggingStatus: logging }));
  };

  const getBucketNotification = async (name: string): Promise<NotificationConfiguration | null> => {
    try {
      const response = await s3Client.send(new GetBucketNotificationConfigurationCommand({ Bucket: name }));
      return response;
    } catch {
      return null;
    }
  };

  const putBucketNotification = async (name: string, config: NotificationConfiguration) => {
    await s3Client.send(
      new PutBucketNotificationConfigurationCommand({
        Bucket: name,
        NotificationConfiguration: config,
      }),
    );
  };

  const getBucketReplication = async (name: string) => {
    try {
      const response = await s3Client.send(new GetBucketReplicationCommand({ Bucket: name }));
      return response.ReplicationConfiguration;
    } catch {
      return null;
    }
  };

  const putBucketReplication = async (name: string, config: any) => {
    await s3Client.send(
      new PutBucketReplicationCommand({ Bucket: name, ReplicationConfiguration: config }),
    );
  };

  const deleteBucketReplication = async (name: string) => {
    await s3Client.send(new DeleteBucketReplicationCommand({ Bucket: name }));
  };

  const getObjectLockConfiguration = async (name: string) => {
    try {
      const response = await s3Client.send(new GetObjectLockConfigurationCommand({ Bucket: name }));
      return response.ObjectLockConfiguration;
    } catch {
      return null;
    }
  };

  const putObjectLockConfiguration = async (name: string, config: any) => {
    await s3Client.send(
      new PutObjectLockConfigurationCommand({ Bucket: name, ObjectLockConfiguration: config }),
    );
  };

  const getObjectRetention = async (key: string) => {
    if (!selectedBucket) return null;
    try {
      const response = await s3Client.send(
        new GetObjectRetentionCommand({ Bucket: selectedBucket, Key: key }),
      );
      return response.Retention;
    } catch {
      return null;
    }
  };

  const putObjectRetention = async (key: string, retention: any) => {
    if (!selectedBucket) return;
    await s3Client.send(
      new PutObjectRetentionCommand({ Bucket: selectedBucket, Key: key, Retention: retention }),
    );
  };

  const getObjectLegalHold = async (key: string) => {
    if (!selectedBucket) return null;
    try {
      const response = await s3Client.send(
        new GetObjectLegalHoldCommand({ Bucket: selectedBucket, Key: key }),
      );
      return response.LegalHold;
    } catch {
      return null;
    }
  };

  const putObjectLegalHold = async (key: string, status: "ON" | "OFF") => {
    if (!selectedBucket) return;
    await s3Client.send(
      new PutObjectLegalHoldCommand({ Bucket: selectedBucket, Key: key, LegalHold: { Status: status } }),
    );
  };

  const uploadFiles = async (files: File[], uploadPath: string) => {
    if (!selectedBucket) return;
    setObjectsLoading(true);
    const statuses: UploadFileStatus[] = files.map((f) => ({ name: f.name, status: "uploading" }));
    setUploadingFiles(statuses);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const body = new Uint8Array(await file.arrayBuffer());
        const cleanPath = uploadPath.replace(/^\/+/, "").replace(/\/+$/, "");
        const key = cleanPath ? `${cleanPath}/${file.name}` : file.name;
        await s3Client.send(
          new PutObjectCommand({
            Bucket: selectedBucket,
            Key: key,
            Body: body,
            ContentType: file.type || "application/octet-stream",
          }),
        );
        setUploadingFiles((prev) => prev.map((f, idx) => (idx === i ? { ...f, status: "done" } : f)));
        successCount++;
      } catch {
        setUploadingFiles((prev) => prev.map((f, idx) => (idx === i ? { ...f, status: "error" } : f)));
        errorCount++;
      }
    }

    if (successCount > 0) toast.success(`Uploaded ${successCount} file(s) to ${selectedBucket}.`);
    if (errorCount > 0) toast.error(`Failed to upload ${errorCount} file(s).`);

    fetchObjects(selectedBucket, uploadPath);
    setTimeout(() => setUploadingFiles([]), 5000);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setObjectsLoading(false);
  };

  const downloadObject = async (key: string) => {
    if (!selectedBucket) return;
    try {
      const response = await s3Client.send(new GetObjectCommand({ Bucket: selectedBucket, Key: key }));
      const stream = response.Body as ReadableStream;
      const reader = stream.getReader();
      const chunks: Uint8Array[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      const blob = new Blob(chunks as BlobPart[], { type: response.ContentType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = key.split("/").pop() || "download";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Downloaded ${key}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to download object");
    }
  };

  return {
    buckets,
    selectedBucket,
    setSelectedBucket,
    objects,
    loading,
    objectsLoading,
    uploadingFiles,
    fileInputRef,
    fetchBuckets,
    fetchObjects,
    createBucket,
    deleteBucket,
    deleteObject,
    deleteObjects,
    copyObject,
    headObject,
    listObjectVersions,
    uploadFiles,
    downloadObject,
    getBucketVersioning,
    putBucketVersioning,
    getBucketEncryption,
    putBucketEncryption,
    deleteBucketEncryption,
    getBucketCors,
    putBucketCors,
    deleteBucketCors,
    getBucketTagging,
    putBucketTagging,
    deleteBucketTagging,
    getBucketPolicy,
    putBucketPolicy,
    deleteBucketPolicy,
    getBucketLifecycle,
    putBucketLifecycle,
    deleteBucketLifecycle,
    getBucketAcl,
    putBucketAcl,
    getBucketLogging,
    putBucketLogging,
    getBucketNotification,
    putBucketNotification,
    getBucketReplication,
    putBucketReplication,
    deleteBucketReplication,
    getObjectLockConfiguration,
    putObjectLockConfiguration,
    getObjectRetention,
    putObjectRetention,
    getObjectLegalHold,
    putObjectLegalHold,
  };
};
