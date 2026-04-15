import { useMemo, useState } from "react";
import type { _Object } from "@aws-sdk/client-s3";
import {
  File,
  Folder,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Copy,
  MoveRight,
  CheckSquare,
  Square,
} from "lucide-react";
import { Spinner } from "../ui/Spinner";
import { EmptyState } from "../ui/EmptyState";
import { Button } from "../ui/Button";

type SortField = "Key" | "Size" | "LastModified";
type SortDir = "asc" | "desc";

interface ObjectsTableProps {
  objects: _Object[];
  loading: boolean;
  onDelete: (key: string) => void;
  onDeleteBatch: (keys: string[]) => void;
  onCopy: (key: string) => void;
  onMove: (key: string) => void;
  onSelect?: (key: string) => void;
}

const SortIcon = ({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) => {
  if (sortField !== field) return <ChevronsUpDown className="w-3 h-3 opacity-40" />;
  return sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
};

export const ObjectsTable = ({
  objects,
  loading,
  onDelete,
  onDeleteBatch,
  onCopy,
  onMove,
  onSelect,
}: ObjectsTableProps) => {
  const [sortField, setSortField] = useState<SortField>("Key");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const toggleSelectAll = () => {
    if (selectedKeys.length === objects.length) {
      setSelectedKeys([]);
    } else {
      setSelectedKeys(objects.map((o) => o.Key!).filter(Boolean));
    }
  };

  const toggleSelect = (e: React.MouseEvent, key: string) => {
    e.stopPropagation();
    setSelectedKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sorted = useMemo(() => {
    return [...objects].sort((a, b) => {
      const isAFolder = a.Key?.endsWith("/");
      const isBFolder = b.Key?.endsWith("/");

      // Folders always first
      if (isAFolder && !isBFolder) return -1;
      if (!isAFolder && isBFolder) return 1;

      let cmp = 0;
      if (sortField === "Key") cmp = (a.Key ?? "").localeCompare(b.Key ?? "");
      else if (sortField === "Size") cmp = (a.Size ?? 0) - (b.Size ?? 0);
      else if (sortField === "LastModified") cmp = (a.LastModified?.getTime() ?? 0) - (b.LastModified?.getTime() ?? 0);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [objects, sortField, sortDir]);

  const getDisplayName = (key: string) => {
    if (!key) return "";
    const parts = key.split("/");
    if (key.endsWith("/")) {
      return parts[parts.length - 2] + "/";
    }
    return parts[parts.length - 1];
  };

  return (
    <div className="flex flex-col">
      {selectedKeys.length > 0 && (
        <div className="bg-blue-500/10 border-b border-blue-500/20 px-4 py-2 flex items-center justify-between animate-in fade-in slide-in-from-top-1">
          <span className="text-xs font-medium text-blue-500">
            {selectedKeys.length} {selectedKeys.length === 1 ? "object" : "objects"} selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteBatch(selectedKeys)}
              className="!text-red-500 hover:!bg-red-500/10 h-7"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedKeys([])} className="h-7">
              Deselect All
            </Button>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-subtle text-[11px] uppercase tracking-wider">
              <th className="px-4 py-2.5 w-10">
                <button
                  onClick={toggleSelectAll}
                  className="p-1 text-text-faint hover:text-text-primary transition-colors"
                >
                  {selectedKeys.length === objects.length && objects.length > 0 ? (
                    <CheckSquare className="w-3.5 h-3.5 text-blue-500" />
                  ) : (
                    <Square className="w-3.5 h-3.5" />
                  )}
                </button>
              </th>
              {(["Key", "Size", "LastModified"] as SortField[]).map((field) => (
                <th
                  key={field}
                  className="px-4 py-2.5 font-medium text-text-muted cursor-pointer hover:text-text-secondary select-none"
                  onClick={() => handleSort(field)}
                >
                  <span className="flex items-center gap-1">
                    {field === "LastModified" ? "Last Modified" : field}
                    <SortIcon field={field} sortField={sortField} sortDir={sortDir} />
                  </span>
                </th>
              ))}
              <th className="px-4 py-2.5 font-medium text-text-muted text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center">
                  <Spinner size="md" color="text-blue-500" label="Loading objects..." />
                </td>
              </tr>
            ) : objects.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16">
                  <EmptyState icon={File} title="Bucket is empty" description="Upload files to get started." />
                </td>
              </tr>
            ) : (
              sorted.map((obj) => {
                const isFolder = obj.Key?.endsWith("/");
                const isSelected = selectedKeys.includes(obj.Key!);
                return (
                  <tr
                    key={obj.Key}
                    className={`hover:bg-surface-hover transition-colors group ${
                      isSelected ? "bg-blue-500/5" : ""
                    } ${onSelect ? "cursor-pointer" : ""}`}
                    onClick={() => onSelect?.(obj.Key!)}
                  >
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => toggleSelect(e, obj.Key!)}
                        className={`p-1 transition-colors ${
                          isSelected ? "text-blue-500" : "text-text-faint opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        {isSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-surface-elevated rounded group-hover:bg-blue-500/10 transition-colors">
                          {isFolder ? (
                            <Folder className="w-3.5 h-3.5 text-blue-500 transition-colors" />
                          ) : (
                            <File className="w-3.5 h-3.5 text-text-muted group-hover:text-blue-500 transition-colors" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-text-primary truncate max-w-xs">
                          {getDisplayName(obj.Key || "")}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-muted">
                      {!isFolder && (obj.Size ? (obj.Size / 1024).toFixed(2) + " KB" : "0 B")}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-muted">
                      {!isFolder && obj.LastModified?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        {!isFolder && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onMove(obj.Key!);
                              }}
                              className="p-1.5 text-text-faint hover:text-yellow-500 hover:bg-yellow-500/10 rounded transition-all opacity-0 group-hover:opacity-100"
                              title="Move Object"
                            >
                              <MoveRight className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onCopy(obj.Key!);
                              }}
                              className="p-1.5 text-text-faint hover:text-blue-500 hover:bg-blue-500/10 rounded transition-all opacity-0 group-hover:opacity-100"
                              title="Copy Object"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(obj.Key!);
                          }}
                          className="p-1.5 text-text-faint hover:text-red-500 hover:bg-red-500/10 rounded transition-all opacity-0 group-hover:opacity-100"
                          title="Delete"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
