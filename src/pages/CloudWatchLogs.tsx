import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, RefreshCw, Plus, Search, Trash2, Clock, ChevronRight } from "lucide-react";
import { useCloudWatchLogs } from "../hooks/useCloudWatchLogs";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { Spinner } from "../components/ui/Spinner";
import { useConfirmModal } from "../hooks/useConfirmModal";
import { CreateLogGroupModal } from "../components/logs/CreateLogGroupModal";
import type { LogGroup, LogStream, OutputLogEvent } from "@aws-sdk/client-cloudwatch-logs";

export const CloudWatchLogs = () => {
  const { "*": rawPath } = useParams();
  const navigate = useNavigate();
  const {
    logGroups,
    loading,
    fetchLogGroups,
    fetchLogStreams,
    fetchLogEvents,
    filterLogEvents,
    deleteLogGroup,
    createLogGroup,
  } = useCloudWatchLogs();
  const { confirm, ConfirmModalComponent } = useConfirmModal();

  const [logStreams, setLogStreams] = useState<LogStream[]>([]);
  const [streamsLoading, setStreamsLoading] = useState(false);
  const [logEvents, setLogEvents] = useState<OutputLogEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filterPattern, setFilterPattern] = useState("");

  const { logGroupName, logStreamName } = useMemo(() => {
    if (!rawPath) return { logGroupName: null, logStreamName: null };
    const parts = rawPath.split("/").filter(Boolean);
    return {
      logGroupName: parts[0] ? decodeURIComponent(parts[0]) : null,
      logStreamName: parts[1] ? decodeURIComponent(parts[1]) : null,
    };
  }, [rawPath]);

  const loadInitialData = useCallback(async () => {
    if (logGroupName && !logStreamName) {
      setStreamsLoading(true);
      const streams = await fetchLogStreams(logGroupName);
      setLogStreams(streams);
      setStreamsLoading(false);
    } else if (logGroupName && logStreamName) {
      setEventsLoading(true);
      const events = await fetchLogEvents(logGroupName, logStreamName);
      setLogEvents(events);
      setEventsLoading(false);
    }
  }, [logGroupName, logStreamName, fetchLogStreams, fetchLogEvents]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleRefresh = () => {
    if (!logGroupName) {
      fetchLogGroups();
    } else {
      loadInitialData();
    }
  };

  const handleCreateGroup = async (name: string) => {
    await createLogGroup(name);
  };

  const handleDeleteGroup = (group: LogGroup) => {
    if (!group.logGroupName) return;
    confirm({
      title: `Delete Log Group?`,
      description: `Are you sure you want to delete "${group.logGroupName}"? This will delete all log streams and events.`,
      action: () => deleteLogGroup(group.logGroupName!),
    });
  };

  const handleFilter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logGroupName) return;
    setEventsLoading(true);
    const events = await filterLogEvents(logGroupName, filterPattern);
    setLogEvents(events);
    setEventsLoading(false);
  };

  const renderLogGroups = () => (
    <DataTable
      columns={[
        {
          key: "name",
          header: "Name",
          render: (group: LogGroup) => (
            <button
              onClick={() => navigate(`/logs/${encodeURIComponent(group.logGroupName || "")}`)}
              className="font-medium text-cyan-500 hover:text-cyan-600 text-left transition-colors"
            >
              {group.logGroupName}
            </button>
          ),
        },
        { key: "retention", header: "Retention", render: (group: LogGroup) => group.retentionInDays ? `${group.retentionInDays} days` : "Never Expire" },
        { key: "size", header: "Stored Size", render: (group: LogGroup) => group.storedBytes ? `${(group.storedBytes / 1024).toFixed(2)} KB` : "0 B" },
        {
          key: "actions",
          header: "Actions",
          render: (group: LogGroup) => (
            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="text-text-muted hover:text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteGroup(group);
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ),
          className: "w-20",
        },
      ]}
      rows={logGroups}
      rowKey={(group: LogGroup) => group.logGroupName || ""}
      loading={loading}
      emptyIcon={FileText}
      emptyTitle="No log groups"
      emptyDescription="Create a log group to start collecting logs."
      emptyAction={{ label: "Create Log Group", onClick: () => setIsCreateModalOpen(true) }}
    />
  );

  const renderLogStreams = () => (
    <DataTable
      columns={[
        {
          key: "name",
          header: "Log Stream Name",
          render: (stream: LogStream) => (
            <button
              onClick={() => navigate(`/logs/${encodeURIComponent(logGroupName || "")}/${encodeURIComponent(stream.logStreamName || "")}`)}
              className="font-medium text-cyan-500 hover:text-cyan-600 text-left transition-colors"
            >
              {stream.logStreamName}
            </button>
          ),
        },
        { key: "lastEvent", header: "Last Event", render: (stream: LogStream) => stream.lastEventTimestamp ? new Date(stream.lastEventTimestamp).toLocaleString() : "No events" },
        { key: "creation", header: "Creation Time", render: (stream: LogStream) => stream.creationTime ? new Date(stream.creationTime).toLocaleString() : "-" },
      ]}
      rows={logStreams}
      rowKey={(stream: LogStream) => stream.logStreamName || ""}
      loading={streamsLoading}
      emptyIcon={Clock}
      emptyTitle="No log streams"
      emptyDescription="This log group doesn't have any streams yet."
    />
  );

  const renderLogEvents = () => (
    <div className="space-y-4">
      <form onSubmit={handleFilter} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input
            type="text"
            className="w-full bg-surface-elevated border border-border-subtle rounded px-8 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
            placeholder="Filter pattern..."
            value={filterPattern}
            onChange={(e) => setFilterPattern(e.target.value)}
          />
        </div>
        <Button type="submit" variant="cyan" size="sm" isLoading={eventsLoading}>
          Filter
        </Button>
      </form>

      <div className="bg-surface-elevated rounded border border-border-subtle overflow-hidden font-mono text-[11px] leading-relaxed">
        {eventsLoading ? (
          <div className="p-8 flex justify-center"><Spinner /></div>
        ) : logEvents.length === 0 ? (
          <div className="p-8 text-center text-text-muted">No log events found.</div>
        ) : (
          <div className="divide-y divide-border-subtle overflow-x-auto">
            {logEvents.map((event, idx) => (
              <div key={idx} className="flex py-1.5 px-3 hover:bg-surface-active/50 group whitespace-pre-wrap transition-colors">
                <span className="text-text-faint shrink-0 w-44 border-r border-border-subtle mr-3">
                  {event.timestamp ? new Date(event.timestamp).toISOString() : "-"}
                </span>
                <span className="text-text-primary flex-1 break-words">
                  {event.message}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="CloudWatch Logs"
        subtitle="View and manage local application logs"
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={handleRefresh} title="Refresh">
              <RefreshCw className={`w-4 h-4 ${(loading || streamsLoading || eventsLoading) ? "animate-spin" : ""}`} />
            </Button>
            {!logGroupName && (
              <Button
                variant="cyan"
                size="sm"
                onClick={() => setIsCreateModalOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Create Log Group
              </Button>
            )}
          </>
        }
      />

      <div className="flex items-center gap-2 text-xs text-text-muted">
        <button
          onClick={() => navigate("/logs")}
          className="flex items-center gap-1 hover:text-cyan-500 transition-colors"
        >
          <FileText className="w-3 h-3" />
          Log Groups
        </button>
        {logGroupName && (
          <>
            <ChevronRight className="w-3 h-3" />
            <button
              onClick={() => navigate(`/logs/${encodeURIComponent(logGroupName)}`)}
              className={`hover:text-cyan-500 transition-colors ${!logStreamName ? "font-semibold text-cyan-500" : ""}`}
            >
              {logGroupName}
            </button>
          </>
        )}
        {logStreamName && (
          <>
            <ChevronRight className="w-3 h-3" />
            <span className="font-semibold text-cyan-500 truncate max-w-xs">
              {logStreamName}
            </span>
          </>
        )}
      </div>

      <div className="bg-surface-card rounded-card border border-border-subtle overflow-hidden">
        {!logGroupName ? renderLogGroups() : !logStreamName ? renderLogStreams() : renderLogEvents()}
      </div>

      <CreateLogGroupModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onConfirm={handleCreateGroup}
      />
      {ConfirmModalComponent}
    </div>
  );
};
