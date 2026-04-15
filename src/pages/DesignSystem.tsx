import { useState } from "react";
import { Plus, RefreshCw, Trash2, Database, ChevronRight, HardDrive } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Input, TextArea } from "../components/ui/Input";
import { PageHeader } from "../components/ui/PageHeader";
import { EmptyState } from "../components/ui/EmptyState";
import { Spinner } from "../components/ui/Spinner";
import { Skeleton } from "../components/ui/Skeleton";
import { DataTable } from "../components/ui/DataTable";
import { Alert } from "../components/ui/Alert";
import { useToast } from "../hooks/useToast";
import { useConfirmModal } from "../hooks/useConfirmModal";
import { serviceTokens } from "../design-system/serviceTokens";
import { Section } from "../components/design-system/Section";

export const DesignSystem = () => {
  const toast = useToast();
  const { confirm, ConfirmModalComponent } = useConfirmModal();
  const [inputValue, setInputValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-10 pb-20">
      <PageHeader
        title="Design System"
        subtitle="Live showcase of the Ministack UI primitives and service design tokens"
      />

      {/* 1. Service Palette */}
      <Section
        title="1. Service Palette"
        description="Every service has a designated color. These tokens are used for icons, buttons, badges, and focus rings."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Object.entries(serviceTokens).map(([key, token]) => (
            <div key={key} className="p-4 border border-border-subtle rounded-lg flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${token.iconBg}`}>
                  <token.icon className={`w-5 h-5 ${token.iconColor}`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">{token.label}</h3>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider">{token.category}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant={token.buttonVariant} size="xs" leftIcon={<Plus className="w-3 h-3" />}>
                  Create
                </Button>
                <Badge variant={token.badgeVariant}>Status</Badge>
              </div>

              <Input placeholder="Focus ring test" className={token.focusRing} />
            </div>
          ))}
        </div>
      </Section>

      {/* 2. Core Palette */}
      <Section title="2. Core Palette" description="Semantic colors defined in src/index.css using CSS variables.">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <div className="h-16 rounded-card border border-border-default bg-surface-base" />
            <p className="text-xs font-medium text-text-primary">Surface Base</p>
            <p className="text-[10px] text-text-muted font-mono">--color-surface-base</p>
          </div>
          <div className="space-y-2">
            <div className="h-16 rounded-card border border-border-default bg-surface-card" />
            <p className="text-xs font-medium text-text-primary">Surface Card</p>
            <p className="text-[10px] text-text-muted font-mono">--color-surface-card</p>
          </div>
          <div className="space-y-2">
            <div className="h-16 rounded-card border border-border-default bg-surface-elevated" />
            <p className="text-xs font-medium text-text-primary">Surface Elevated</p>
            <p className="text-[10px] text-text-muted font-mono">--color-surface-elevated</p>
          </div>
          <div className="space-y-2">
            <div className="h-16 rounded-card border border-border-default bg-surface-hover" />
            <p className="text-xs font-medium text-text-primary">Surface Hover</p>
            <p className="text-[10px] text-text-muted font-mono">--color-surface-hover</p>
          </div>
        </div>
      </Section>

      {/* 3. Buttons */}
      <Section title="3. Buttons" description="Primary, semantic, and service-branded action triggers.">
        <div className="space-y-8">
          <div className="space-y-3">
            <p className="text-[11px] text-text-muted uppercase tracking-widest font-medium">Semantic Variants</p>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="success">Success</Button>
              <Button variant="warning">Warning</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="outline">Outline</Button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] text-text-muted uppercase tracking-widest font-medium">Sizes</p>
            <div className="flex items-end gap-4">
              <Button size="xs">Extra Small</Button>
              <Button size="sm">Small Action</Button>
              <Button size="md">Medium Default</Button>
              <Button size="lg">Large Hero</Button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] text-text-muted uppercase tracking-widest font-medium">States & Props</p>
            <div className="flex flex-wrap gap-4">
              <Button isLoading>Loading</Button>
              <Button disabled>Disabled</Button>
              <Button leftIcon={<Plus className="w-3.5 h-3.5" />}>Left Icon</Button>
              <Button rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>Right Icon</Button>
              <Button variant="ghost" size="sm" title="Icon Only">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* 4. Badges */}
      <Section title="4. Badges" description="Status indicators, categorical labels, and technical tags.">
        <div className="space-y-8">
          <div className="space-y-3">
            <p className="text-[11px] text-text-muted uppercase tracking-widest font-medium">Semantic Badges</p>
            <div className="flex flex-wrap gap-3">
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="default">Default</Badge>
              <Badge variant="mono">v1.2.3 (Mono)</Badge>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] text-text-muted uppercase tracking-widest font-medium">Service Badges</p>
            <div className="flex flex-wrap gap-3">
              <Badge variant="purple">IAM</Badge>
              <Badge variant="blue">S3</Badge>
              <Badge variant="amber">Lambda</Badge>
              <Badge variant="orange">SQS</Badge>
              <Badge variant="emerald">DynamoDB</Badge>
              <Badge variant="rose">SNS</Badge>
              <Badge variant="indigo">Cognito</Badge>
              <Badge variant="cyan">Logs</Badge>
              <Badge variant="teal">Events</Badge>
              <Badge variant="pink">SES</Badge>
              <Badge variant="sky">Route53</Badge>
            </div>
          </div>
        </div>
      </Section>

      {/* 5. Form Inputs */}
      <Section title="5. Form Inputs" description="Standardized input components with label support and focus rings.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Input
              label="Standard Input"
              placeholder="Type something..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <Input label="Search" placeholder="Search..." />
            <Input label="Disabled" value="Cannot edit me" disabled />
          </div>
          <div className="space-y-4">
            <TextArea label="Text Area" placeholder="Write a description..." rows={4} />
          </div>
        </div>
      </Section>

      {/* 6. Page Primitives */}
      <Section title="6. Page Primitives" description="Core structural elements for consistent page building.">
        <div className="space-y-12">
          <div className="border border-border-subtle rounded-card overflow-hidden">
            <div className="bg-surface-base p-4 border-b border-border-subtle">
              <PageHeader
                title="Page Title"
                subtitle="This is a standard page subtitle"
                actions={<Button size="sm">Action</Button>}
              />
            </div>
            <div className="p-12 text-center">
              <p className="text-sm text-text-muted italic">Page content area</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="p-6 border border-border-subtle rounded-card">
              <EmptyState
                icon={HardDrive}
                title="No resources found"
                description="Create your first resource to get started."
                action={{ label: "Create Now", onClick: () => {} }}
              />
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-8">
                <Spinner size="sm" label="Small" />
                <Spinner size="md" label="Medium" />
                <Spinner size="lg" label="Large" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* 7. Feedback (Toasts & Modals) */}
      <Section
        title="7. Interactive Feedback"
        description="Hooks and components for user interaction and notifications."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <p className="text-[11px] text-text-muted uppercase tracking-widest font-medium">Toast Notifications</p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="success" onClick={() => toast.success("Operation completed successfully")}>
                Success
              </Button>
              <Button size="sm" variant="danger" onClick={() => toast.error("An error occurred")}>
                Error
              </Button>
              <Button size="sm" variant="primary" onClick={() => toast.info("New message received")}>
                Info
              </Button>
              <Button size="sm" variant="warning" onClick={() => toast.warning("Warning: Connection unstable")}>
                Warning
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[11px] text-text-muted uppercase tracking-widest font-medium">Modals</p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setIsModalOpen(true)}>
                Open Dialog
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() =>
                  confirm({
                    title: "Delete everything?",
                    description: "This action will permanently remove all data. You cannot undo this.",
                    confirmVariant: "danger",
                    action: () => toast.success("Deleted (simulated)"),
                  })
                }
              >
                Confirm Danger
              </Button>
              <Button
                size="sm"
                variant="warning"
                onClick={() =>
                  confirm({
                    title: "Purge messages?",
                    description: "This will clear the queue. It is recommended to backup first.",
                    confirmVariant: "warning",
                    action: () => toast.success("Purged (simulated)"),
                  })
                }
              >
                Confirm Warning
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* 8. DataTable */}
      <Section
        title="8. Data Table"
        description="Flexible table component with support for sorting and custom rendering."
      >
        <DataTable
          rowKey={(r) => r.id.toString()}
          rows={[
            { id: 1, name: "Project alpha", status: "active", owner: "Jean" },
            { id: 2, name: "Beta tests", status: "pending", owner: "Junie" },
            { id: 3, name: "Legacy system", status: "failed", owner: "HackJack" },
          ]}
          columns={[
            { key: "name", header: "Name", className: "font-medium", render: (r) => r.name },
            {
              key: "status",
              header: "Status",
              render: (r) => (
                <Badge variant={r.status === "active" ? "success" : r.status === "pending" ? "warning" : "error"}>
                  {r.status}
                </Badge>
              ),
            },
            { key: "owner", header: "Owner", render: (r) => r.owner },
            {
              key: "actions",
              header: "",
              className: "text-right",
              render: () => (
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button className="p-1 hover:bg-surface-hover rounded">
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>
              ),
            },
          ]}
        />
      </Section>

      {/* 9. Typography */}
      <Section title="9. Typography" description="Consistent font scale for hierarchy and readability.">
        <div className="space-y-6">
          <div>
            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">
              Page Title (.text-base.font-semibold)
            </p>
            <h1 className="text-base font-semibold text-text-primary">Ministack Dashboard</h1>
          </div>
          <div>
            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">
              Section Header (.text-xs.font-semibold.uppercase)
            </p>
            <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Storage Services</h2>
          </div>
          <div>
            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">
              Body Text (.text-sm.text-text-secondary)
            </p>
            <p className="text-sm text-text-secondary">
              Managing cloud infrastructure shouldn't be complicated. Ministack provides a simple, fast interface for
              your local AWS emulator.
            </p>
          </div>
          <div>
            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">
              Caption / Muted (.text-xs.text-text-muted)
            </p>
            <p className="text-xs text-text-muted">Last updated 2 minutes ago at 15:50:23</p>
          </div>
          <div>
            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">
              Technical / Mono (.font-mono.text-xs)
            </p>
            <p className="font-mono text-xs text-text-secondary">
              arn:aws:lambda:us-east-1:000000000000:function:my-function
            </p>
          </div>
        </div>
      </Section>

      {/* 10. Alert Variants */}
      <Section title="10. Alerts" description="Inline notifications for different contexts.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Alert type="info" message="A newer version of Ministack is available for download." />
          <Alert type="success" message="Your data has been successfully backed up to S3." />
          <Alert type="warning" message="Your current role does not have permission to delete RDS instances." />
          <Alert type="error" message="Unable to reach the backend service. Check your network." />
        </div>
      </Section>

      {/* 11. Spacing & Radii */}
      <Section title="11. Spacing & Radii" description="Geometric constants for consistency.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <p className="text-xs font-medium text-text-primary">Spacing Scale (space-y-5)</p>
            <div className="space-y-5 bg-surface-elevated/30 p-4 rounded border border-border-subtle">
              <div className="h-8 bg-surface-card border border-border-default rounded flex items-center justify-center text-[10px]">
                1
              </div>
              <div className="h-8 bg-surface-card border border-border-default rounded flex items-center justify-center text-[10px]">
                2
              </div>
              <div className="h-8 bg-surface-card border border-border-default rounded flex items-center justify-center text-[10px]">
                3
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 text-center">
              <div className="aspect-square bg-surface-base border border-border-default rounded-btn flex items-center justify-center">
                <div className="text-[10px] text-text-muted">rounded-btn</div>
              </div>
            </div>
            <div className="space-y-2 text-center">
              <div className="aspect-square bg-surface-base border border-border-default rounded-card flex items-center justify-center">
                <div className="text-[10px] text-text-muted">rounded-card</div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Internal Modal for Demo */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-card border border-border-default rounded-card shadow-2xl max-w-md w-full animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-600">
                  <Database className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-text-primary">Example Modal</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text-primary">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-text-secondary">
                This is a standard modal dialog. It follows the layout prescribed in UI_GUIDELINES.md section 6.
              </p>
              <Input label="Name" placeholder="Resource name" />
            </div>
            <div className="p-4 border-t border-border-subtle flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="purple" size="sm" onClick={() => setIsModalOpen(false)}>
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}

      {ConfirmModalComponent}
    </div>
  );
};
