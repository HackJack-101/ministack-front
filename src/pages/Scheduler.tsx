import { useState } from "react";
import { CalendarClock, RefreshCw, Trash2 } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { useScheduler } from "../hooks/useScheduler";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { EmptyState } from "../components/ui/EmptyState";
import { Spinner } from "../components/ui/Spinner";
import { useConfirmModal } from "../hooks/useConfirmModal";
import type { ScheduleSummary, ScheduleGroupSummary } from "@aws-sdk/client-scheduler";

type Tab = "schedules" | "groups";

const SCHEDULE_STATE_VARIANT = (state: string | undefined) => {
  if (state === "ENABLED") return "success";
  if (state === "DISABLED") return "error";
  return "default";
};

const GROUP_STATE_VARIANT = (state: string | undefined) => {
  if (state === "ACTIVE") return "success";
  if (state === "DELETING") return "warning";
  return "default";
};

export default function Scheduler() {
  const { schedules, groups, loading, deleteSchedule, deleteGroup, refresh } = useScheduler();
  const [activeTab, setActiveTab] = useState<Tab>("schedules");
  const { confirm, ConfirmModalComponent } = useConfirmModal();

  const handleDeleteSchedule = (schedule: ScheduleSummary) => {
    confirm({
      title: `Delete schedule "${schedule.Name}"?`,
      description: "This schedule will be permanently deleted.",
      confirmVariant: "danger",
      action: () => deleteSchedule(schedule.Name!, schedule.GroupName ?? "default"),
    });
  };

  const handleDeleteGroup = (group: ScheduleGroupSummary) => {
    confirm({
      title: `Delete group "${group.Name}"?`,
      description: "All schedules in this group will also be deleted.",
      confirmVariant: "danger",
      action: () => deleteGroup(group.Name!),
    });
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "schedules", label: `Schedules${schedules.length > 0 ? ` (${schedules.length})` : ""}` },
    { key: "groups", label: `Groups${groups.length > 0 ? ` (${groups.length})` : ""}` },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scheduler"
        subtitle="EventBridge Scheduler — manage schedules and schedule groups"
        actions={
          <Button variant="ghost" size="sm" onClick={refresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        }
      />

      <div className="flex items-center gap-1 border-b border-border-subtle mb-5">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
              activeTab === key
                ? "border-teal-600 text-text-primary"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && schedules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" color="text-teal-600" />
          <p className="mt-4 text-text-muted">Loading schedules...</p>
        </div>
      ) : (
        <>
          {activeTab === "schedules" &&
            (schedules.length === 0 ? (
              <EmptyState
                title="No Schedules"
                description="No schedules found. Use the AWS CLI or SDK to create one."
                icon={CalendarClock}
              />
            ) : (
              <DataTable
                rows={schedules}
                rowKey={(s: ScheduleSummary) => s.Arn || s.Name || ""}
                accentColor="teal"
                columns={[
                  {
                    key: "name",
                    header: "Name",
                    render: (s: ScheduleSummary) => (
                      <span className="font-medium text-text-primary">{s.Name || "—"}</span>
                    ),
                  },
                  {
                    key: "group",
                    header: "Group",
                    render: (s: ScheduleSummary) => (
                      <span className="text-sm text-text-secondary">{s.GroupName || "default"}</span>
                    ),
                  },
                  {
                    key: "state",
                    header: "State",
                    render: (s: ScheduleSummary) => (
                      <Badge variant={SCHEDULE_STATE_VARIANT(s.State)}>{s.State || "—"}</Badge>
                    ),
                  },
                  {
                    key: "actions",
                    header: "",
                    className: "text-right",
                    render: (s: ScheduleSummary) => (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSchedule(s)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </Button>
                    ),
                  },
                ]}
              />
            ))}

          {activeTab === "groups" &&
            (groups.length === 0 ? (
              <EmptyState
                title="No Schedule Groups"
                description="No schedule groups found. The default group is created automatically."
                icon={CalendarClock}
              />
            ) : (
              <DataTable
                rows={groups}
                rowKey={(g: ScheduleGroupSummary) => g.Arn || g.Name || ""}
                accentColor="teal"
                columns={[
                  {
                    key: "name",
                    header: "Name",
                    render: (g: ScheduleGroupSummary) => (
                      <span className="font-medium text-text-primary">{g.Name || "—"}</span>
                    ),
                  },
                  {
                    key: "state",
                    header: "State",
                    render: (g: ScheduleGroupSummary) => (
                      <Badge variant={GROUP_STATE_VARIANT(g.State)}>{g.State || "—"}</Badge>
                    ),
                  },
                  {
                    key: "created",
                    header: "Created",
                    render: (g: ScheduleGroupSummary) => (
                      <span className="text-sm text-text-secondary">
                        {g.CreationDate ? new Date(g.CreationDate).toLocaleString() : "—"}
                      </span>
                    ),
                  },
                  {
                    key: "actions",
                    header: "",
                    className: "text-right",
                    render: (g: ScheduleGroupSummary) =>
                      g.Name === "default" ? null : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteGroup(g)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </Button>
                      ),
                  },
                ]}
              />
            ))}
        </>
      )}

      {ConfirmModalComponent}
    </div>
  );
}
