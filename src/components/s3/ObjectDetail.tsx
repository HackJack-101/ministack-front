import React, { useState, useEffect } from "react";
import type { _Object, ObjectVersion } from "@aws-sdk/client-s3";
import { 
  FileText, 
  Copy, 
  Download, 
  Trash2, 
  Clock, 
  HardDrive, 
  Shield, 
  Hash, 
  Database,
  ExternalLink,
  History,
  Lock,
  LockOpen,
  Info,
  RefreshCw
} from "lucide-react";
import { Button } from "../ui/Button";
import { useToast } from "../../hooks/useToast";
import { useS3 } from "../../hooks/useS3";
import { MINISTACK_ENDPOINT } from "../../services/awsClients";
import { Spinner } from "../ui/Spinner";

interface ObjectDetailProps {
  bucketName: string;
  object: _Object;
  onDelete: (key: string) => void;
  onDownload: (key: string) => void;
}

export const ObjectDetail: React.FC<ObjectDetailProps> = ({ 
  bucketName, 
  object, 
  onDelete, 
  onDownload 
}) => {
  const toast = useToast();
  const s3 = useS3();
  const s3Uri = `s3://${bucketName}/${object.Key}`;
  const [loading, setLoading] = useState(true);
  const [headInfo, setHeadInfo] = useState<any>(null);
  const [versions, setVersions] = useState<ObjectVersion[]>([]);
  const [legalHold, setLegalHold] = useState<any>(null);

  useEffect(() => {
    loadObjectDetails();
  }, [bucketName, object.Key]);

  const loadObjectDetails = async () => {
    setLoading(true);
    try {
      const [h, v, lh] = await Promise.all([
        s3.headObject(object.Key!),
        s3.listObjectVersions(object.Key!),
        s3.getObjectLegalHold(object.Key!)
      ]);
      setHeadInfo(h);
      setVersions(v);
      setLegalHold(lh);
    } catch (err) {
      console.error("Failed to load object details", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLegalHold = async () => {
    try {
      const newStatus = legalHold?.Status === "ON" ? "OFF" : "ON";
      await s3.putObjectLegalHold(object.Key!, newStatus);
      setLegalHold({ Status: newStatus });
      toast.success(`Legal Hold turned ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update Legal Hold");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const formatSize = (bytes?: number) => {
    if (bytes === undefined) return "0 B";
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="md" color="text-blue-500" label="Loading details..." />
      </div>
    );
  }

  return (
    <div className="bg-surface-card rounded-card border border-border-subtle overflow-hidden">
      <div className="p-4 border-b border-border-subtle bg-surface-elevated flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500/10 rounded">
            <FileText className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text-primary truncate max-w-md">
              {object.Key?.split("/").pop()}
            </h2>
            <p className="text-[10px] text-text-faint font-mono uppercase tracking-wider">Object Metadata</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onDelete(object.Key!)} 
            className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            Delete
          </Button>
        </div>
      </div>
      
      <div className="p-6 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          <div className="space-y-8">
             <DetailItem 
               icon={<Hash className="w-3.5 h-3.5" />} 
               label="Object Key" 
               value={object.Key || ""} 
               copyable 
               onCopy={() => copyToClipboard(object.Key || "")}
               valueClassName="font-mono text-xs"
             />
             <DetailItem 
               icon={<Shield className="w-3.5 h-3.5" />} 
               label="Full S3 URI" 
               value={s3Uri} 
               copyable 
               onCopy={() => copyToClipboard(s3Uri)}
               valueClassName="font-mono text-xs text-blue-500"
             />
             <div className="grid grid-cols-2 gap-4">
               <DetailItem 
                 icon={<HardDrive className="w-3.5 h-3.5" />} 
                 label="File Size" 
                 value={formatSize(object.Size)} 
               />
               <DetailItem 
                 icon={<Info className="w-3.5 h-3.5" />} 
                 label="Content Type" 
                 value={headInfo?.ContentType || "application/octet-stream"} 
               />
             </div>
          </div>
          <div className="space-y-8">
             <div className="grid grid-cols-2 gap-4">
                <DetailItem 
                  icon={<Clock className="w-3.5 h-3.5" />} 
                  label="Last Modified" 
                  value={object.LastModified?.toLocaleString() || "Unknown"} 
                />
                <DetailItem 
                  icon={<Database className="w-3.5 h-3.5" />} 
                  label="Storage Class" 
                  value={object.StorageClass || headInfo?.StorageClass || "Standard"} 
                />
             </div>
             <DetailItem 
               icon={<Hash className="w-3.5 h-3.5" />} 
               label="ETag" 
               value={object.ETag?.replace(/"/g, "") || headInfo?.ETag?.replace(/"/g, "") || "None"} 
               valueClassName="font-mono text-xs"
             />
             <div className="flex gap-4">
                <div className="flex-1 p-3 bg-surface-elevated rounded-lg border border-border-subtle flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History className="w-3.5 h-3.5 text-text-muted" />
                    <span className="text-[10px] uppercase font-bold text-text-muted">Versions</span>
                  </div>
                  <span className="text-xs font-mono bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded">
                    {versions.length}
                  </span>
                </div>
                <button 
                  onClick={handleToggleLegalHold}
                  className={`flex-1 p-3 rounded-lg border flex items-center justify-between transition-colors ${
                    legalHold?.Status === "ON" 
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-600" 
                    : "bg-surface-elevated border-border-subtle text-text-muted hover:bg-surface-hover"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {legalHold?.Status === "ON" ? <Lock className="w-3.5 h-3.5" /> : <LockOpen className="w-3.5 h-3.5" />}
                    <span className="text-[10px] uppercase font-bold">Legal Hold</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded">
                    {legalHold?.Status || "OFF"}
                  </span>
                </button>
             </div>
          </div>
        </div>

        {versions.length > 1 && (
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2">
              <History className="w-3.5 h-3.5" />
              Recent Versions
            </h3>
            <div className="bg-surface-elevated rounded-lg border border-border-subtle divide-y divide-border-subtle overflow-hidden">
              {versions.slice(0, 5).map((v) => (
                <div key={v.VersionId} className="px-4 py-2.5 flex items-center justify-between hover:bg-surface-hover transition-colors group">
                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] font-mono px-1 py-0.5 rounded ${v.IsLatest ? "bg-emerald-500/10 text-emerald-500" : "bg-text-faint/10 text-text-faint"}`}>
                      {v.IsLatest ? "LATEST" : "PREVIOUS"}
                    </span>
                    <span className="text-xs font-mono text-text-primary truncate max-w-[150px]">{v.VersionId}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-xs text-text-muted">{v.LastModified?.toLocaleString()}</span>
                    <span className="text-xs text-text-faint w-16 text-right">{formatSize(v.Size)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="pt-8 flex justify-between items-center border-t border-border-subtle">
           <div className="flex gap-2">
             <Button 
               variant="ghost" 
               size="sm" 
               onClick={loadObjectDetails}
               leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
             >
               Reload
             </Button>
           </div>
           <div className="flex gap-3">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => onDownload(object.Key!)}
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Download Object
              </Button>
              <a
                href={`${MINISTACK_ENDPOINT}/${bucketName}/${object.Key}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-1.5 text-xs font-medium text-blue-500 hover:text-white hover:bg-blue-500 border border-blue-500/30 rounded-md transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                Open in Browser
              </a>
           </div>
        </div>
      </div>
    </div>
  );
};

interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  copyable?: boolean;
  onCopy?: () => void;
  valueClassName?: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon, label, value, copyable, onCopy, valueClassName }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-1.5 text-text-faint text-[10px] uppercase tracking-widest font-bold">
      {icon}
      <span>{label}</span>
    </div>
    <div className="flex items-center gap-2 group min-h-[1.5rem]">
      <span className={`text-sm text-text-primary break-all leading-relaxed ${valueClassName || ""}`}>
        {value}
      </span>
      {copyable && (
        <button 
          onClick={onCopy}
          className="p-1 text-text-faint hover:text-text-primary opacity-0 group-hover:opacity-100 transition-all"
          title={`Copy ${label}`}
        >
          <Copy className="w-3 h-3" />
        </button>
      )}
    </div>
  </div>
);
