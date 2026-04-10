import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Database, RefreshCw, Plus, ArrowLeft, Upload } from "lucide-react";
import { useS3 } from "../hooks/useS3";
import { BucketList } from "../components/s3/BucketList";
import { ObjectsTable } from "../components/s3/ObjectsTable";
import { UploadZone } from "../components/s3/UploadZone";
import { ObjectDetail } from "../components/s3/ObjectDetail";
import { BucketSettings } from "../components/s3/BucketSettings";
import { Button } from "../components/ui/Button";
import { PageHeader } from "../components/ui/PageHeader";
import { useConfirmModal } from "../hooks/useConfirmModal";
import { pluralize } from "../utils/format";

export const S3 = () => {
  const { bucketName, "*": objectPath } = useParams();
  const navigate = useNavigate();
  const {
    setSelectedBucket,
    fetchObjects,
    fetchBuckets,
    loading,
    objectsLoading,
    objects,
    buckets,
    uploadingFiles,
    fileInputRef,
    downloadObject,
    deleteObjects,
    copyObject,
    deleteBucket,
    uploadFiles,
    selectedBucket: s3SelectedBucket,
  } = useS3();

  const { confirm, ConfirmModalComponent } = useConfirmModal();
  const [activeTab, setActiveTab] = useState<"objects" | "settings">("objects");
  const [isUploading, setIsUploading] = useState(false);
  const [prevObjectPath, setPrevObjectPath] = useState(objectPath);
  const [uploadPath, setUploadPath] = useState(() => {
    if (!objectPath) return "";
    if (objectPath.endsWith("/")) return objectPath;
    const parts = objectPath.split("/");
    return parts.length > 1 ? parts.slice(0, -1).join("/") + "/" : "";
  });

  if (objectPath !== prevObjectPath) {
    setPrevObjectPath(objectPath);
    if (!objectPath) {
      setUploadPath("");
    } else if (objectPath.endsWith("/")) {
      setUploadPath(objectPath);
    } else {
      const parts = objectPath.split("/");
      if (parts.length > 1) {
        setUploadPath(parts.slice(0, -1).join("/") + "/");
      } else {
        setUploadPath("");
      }
    }
  }

  const selectedObject = objectPath ? objects.find((obj) => obj.Key === objectPath) : null;
  const isBrowsing = !selectedObject || (objects.length > 1 && objectPath?.endsWith("/"));
  const showObjectDetail = !isBrowsing && selectedObject;

  useEffect(() => {
    if (bucketName) {
      setSelectedBucket(bucketName);
      fetchObjects(bucketName, objectPath);
    } else {
      setSelectedBucket(null);
    }
  }, [bucketName, objectPath, setSelectedBucket, fetchObjects]);

  const handleDeleteBucket = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    confirm({
      title: `Delete bucket "${name}"?`,
      description: "The bucket must be empty. This action cannot be undone.",
      action: () => deleteBucket(name),
    });
  };

  const handleDeleteObjects = (keys: string[]) => {
    confirm({
      title: `Delete ${keys.length} objects?`,
      description: "This action cannot be undone.",
      action: () => deleteObjects(keys),
    });
  };

  const handleCopyObject = (key: string) => {
    const destKey = prompt("Enter destination key:", `${key}_copy`);
    if (destKey) {
      copyObject(key, destKey);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="S3 Storage"
        subtitle="Manage buckets and objects in your local environment"
        actions={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => (s3SelectedBucket ? fetchObjects(s3SelectedBucket, objectPath) : fetchBuckets())}
              title="Refresh"
              aria-label="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading || objectsLoading ? "animate-spin" : ""}`} />
            </Button>
            {!s3SelectedBucket && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate("/s3/create")}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Create Bucket
              </Button>
            )}
            {s3SelectedBucket && !showObjectDetail && (
              <Button
                variant={isUploading ? "outline" : "primary"}
                size="sm"
                onClick={() => {
                  setIsUploading(!isUploading);
                  setActiveTab("objects");
                }}
                leftIcon={isUploading ? <Database className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
              >
                {isUploading ? "View Objects" : "Upload Files"}
              </Button>
            )}
          </>
        }
      />

      {s3SelectedBucket ? (
        <div className="space-y-4">
          <div className="flex items-center gap-1 border-b border-border-subtle mb-5">
            <button
              onClick={() => setActiveTab("objects")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
                activeTab === "objects"
                  ? "border-blue-500 text-text-primary"
                  : "border-transparent text-text-muted hover:text-text-primary"
              }`}
            >
              Objects
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
                activeTab === "settings"
                  ? "border-blue-500 text-text-primary"
                  : "border-transparent text-text-muted hover:text-text-primary"
              }`}
            >
              Settings
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                navigate("/s3");
                setIsUploading(false);
              }}
              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Buckets
            </button>
            <span className="text-text-faint">/</span>
            <button
              onClick={() => {
                navigate(`/s3/${s3SelectedBucket}`);
                setActiveTab("objects");
              }}
              className="text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors"
            >
              {s3SelectedBucket}
            </button>
            {objectPath && (
              <div className="flex items-center gap-1.5">
                {objectPath.split("/").map((segment, index, array) => {
                  if (segment === "" && index === array.length - 1) return null;
                  const isLast = index === array.length - 1 || (index === array.length - 2 && array[index + 1] === "");
                  const path = array.slice(0, index + 1).join("/") + (isLast ? "" : "/");

                  return (
                    <React.Fragment key={path}>
                      <span className="text-text-faint">/</span>
                      {isLast ? (
                        <span className="text-xs font-mono text-text-primary bg-surface-elevated px-1.5 py-0.5 rounded">
                          {segment}
                        </span>
                      ) : (
                        <button
                          onClick={() => navigate(`/s3/${s3SelectedBucket}/${path}`)}
                          className="text-xs font-mono text-blue-500 hover:text-blue-600 transition-colors"
                        >
                          {segment}
                        </button>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}
            {!isUploading && (
              <span className="text-xs text-text-muted bg-surface-elevated border border-border-subtle px-1.5 py-0.5 rounded">
                {pluralize(objects.length, "object")}
              </span>
            )}
            {isUploading && (
              <span className="text-xs text-blue-500 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider font-medium">
                Upload Mode
              </span>
            )}
          </div>

          {activeTab === "objects" ? (
            <div className="bg-surface-card rounded-card border border-border-subtle overflow-hidden">
              {isUploading ? (
                <UploadZone
                  selectedBucket={s3SelectedBucket}
                  uploadPath={uploadPath}
                  onUploadPathChange={setUploadPath}
                  uploadingFiles={uploadingFiles}
                  isLoading={objectsLoading}
                  fileInputRef={fileInputRef}
                  onFilesSelected={(files) => uploadFiles(files, uploadPath)}
                />
              ) : showObjectDetail ? (
                <ObjectDetail
                  bucketName={s3SelectedBucket}
                  object={selectedObject}
                  onDelete={(key) => handleDeleteObjects([key])}
                  onDownload={downloadObject}
                />
              ) : (
                <ObjectsTable
                  objects={objects}
                  loading={objectsLoading}
                  onDelete={(key) => handleDeleteObjects([key])}
                  onDeleteBatch={handleDeleteObjects}
                  onCopy={handleCopyObject}
                  onSelect={(key) => navigate(`/s3/${s3SelectedBucket}/${key}`)}
                />
              )}
            </div>
          ) : (
            <BucketSettings bucketName={s3SelectedBucket} />
          )}
        </div>
      ) : (
        <BucketList
          buckets={buckets}
          loading={loading}
          onSelect={(name) => navigate(`/s3/${name}`)}
          onDelete={handleDeleteBucket}
          onSettings={(e, name) => {
            e.stopPropagation();
            navigate(`/s3/${name}`);
            setActiveTab("settings");
          }}
          onCreateClick={() => navigate("/s3/create")}
        />
      )}

      {ConfirmModalComponent}
    </div>
  );
};
