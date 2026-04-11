# UI Guidelines — Ministack Front-End

This document defines the UI conventions to follow across all sessions to keep the interface coherent.
It is automatically loaded via `CLAUDE.md` and must be updated whenever a new pattern is established.

---

## 1. Service Color Mapping

Each AWS service has a designated color used consistently for icons, badges, button variants, focus rings, and tab accents.

| Category     | Service         | Color   | Tailwind token | Button variant | Focus ring class              |
| ------------ | --------------- | ------- | -------------- | -------------- | ----------------------------- |
| **Core**     | Dashboard       | Purple  | `purple-500`   | `purple`       | `focus:border-purple-500/60`  |
|              | IAM             | Purple  | `purple-600`   | `purple`       | `focus:border-purple-600/60`  |
| **Compute**  | Lambda          | Amber   | `amber-500`    | `amber`        | `focus:border-amber-500/60`   |
|              | EC2             | Orange  | `orange-600`   | `warning`      | `focus:border-orange-600/60`  |
|              | ECS             | Orange  | `orange-500`   | `warning`      | `focus:border-orange-500/60`  |
|              | Step Functions  | Rose    | `rose-600`     | `rose`         | `focus:border-rose-600/60`    |
| **Storage**  | S3              | Blue    | `blue-500`     | `primary`      | `focus:border-blue-500/60`    |
| **Database** | DynamoDB        | Emerald | `emerald-500`  | `emerald`      | `focus:border-emerald-500/60` |
|              | RDS             | Blue    | `blue-600`     | `primary`      | `focus:border-blue-600/60`    |
| **Network**  | Route 53        | Sky     | `sky-500`      | `sky`          | `focus:border-sky-500/60`     |
|              | ACM             | Emerald | `emerald-600`  | `emerald`      | `focus:border-emerald-600/60` |
|              | WAFv2           | Rose    | `rose-500`     | `rose`         | `focus:border-rose-500/60`    |
| **App Int**  | SQS             | Orange  | `orange-500`   | `warning`      | `focus:border-orange-500/60`  |
|              | SNS             | Rose    | `rose-500`     | `rose`         | `focus:border-rose-500/60`    |
|              | EventBridge     | Teal    | `teal-500`     | `teal`         | `focus:border-teal-500/60`    |
|              | SES             | Pink    | `pink-500`     | `pink`         | `focus:border-pink-500/60`    |
| **Security** | KMS             | Amber   | `amber-600`    | `amber`        | `focus:border-amber-600/60`   |
|              | Secrets Manager | Purple  | `purple-500`   | `purple`       | `focus:border-purple-500/60`  |
|              | Cognito         | Indigo  | `indigo-600`   | `indigo`       | `focus:border-indigo-600/60`  |
| **Manage**   | CloudFormation  | Pink    | `pink-600`     | `pink`         | `focus:border-pink-600/60`    |
|              | CloudWatch Logs | Cyan    | `cyan-500`     | `cyan`         | `focus:border-cyan-500/60`    |
|              | Parameter Store | Indigo  | `indigo-500`   | `indigo`       | `focus:border-indigo-500/60`  |
| **Stream**   | Kinesis         | Blue    | `blue-400`     | `sky`          | `focus:border-blue-400/60`    |

Icon backgrounds always use the `bg-{color}/10` form (e.g. `bg-amber-500/10`).

---

## 2. Core UI Palette

These colors are defined in `src/index.css` and use semantic CSS variables for consistency and theming support.

| Element            | CSS Variable (Light) | CSS Variable (Dark)   | Description                           |
| ------------------ | -------------------- | --------------------- | ------------------------------------- |
| **Surface Base**   | `#ffffff`            | `#07080a`             | Main page background                  |
| **Surface Card**   | `#f9f9f9`            | `#0d0e12`             | Card / Sidebar background             |
| **Elevated**       | `#f3f3f3`            | `#13151b`             | Modal headers / Section backgrounds   |
| **Text Primary**   | `#0a0a0a`            | `rgba(255, ... 0.92)` | Main titles and emphasis text         |
| **Text Secondary** | `#555555`            | `rgba(255, ... 0.55)` | Body text and less emphasized headers |
| **Text Muted**     | `#888888`            | `rgba(255, ... 0.28)` | Subtitles and meta information        |
| **Border Default** | `rgba(0,0,0,0.1)`    | `rgba(255,... 0.08)`  | Standard resource card borders        |
| **Border Subtle**  | `rgba(0,0,0,0.06)`   | `rgba(255,... 0.05)`  | Table dividers and subtle lines       |

---

## 3. Page Layout Structure

```
┌─ TopBar (fixed, h-12) ───────────────────────────────────────┐
├─ Sidebar (left) + Main content area ──────────────────────────┤
│  ┌─ <PageHeader title subtitle actions /> ───────────────── │
│  ├─ Tab navigation row (optional) ─────────────────────────  │
│  ├─ Main content (space-y-5) ───────────────────────────────  │
│  │   Tables / Cards / Inline forms / Modals                   │
│  └──────────────────────────────────────────────────────────  │
└──────────────────────────────────────────────────────────────┘
```

### PageHeader

```tsx
<PageHeader
  title="Functions"
  subtitle="Manage your Lambda functions"
  actions={
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" onClick={refresh}>
        <RefreshCw />
      </Button>
      <Button size="sm" leftIcon={<Plus />}>
        Create Function
      </Button>
    </div>
  }
/>
```

- Title: `text-base font-semibold text-text-primary`
- Subtitle: `text-xs text-text-muted mt-0.5`
- Actions: always right-aligned, `flex items-center gap-2`

---

## 4. Button Conventions

### Placement rules

| Context      | Alignment       | Notes                                                  |
| ------------ | --------------- | ------------------------------------------------------ |
| Page header  | Right side      | Refresh icon-only (ghost) + Create (colored)           |
| Modal footer | Right side      | Cancel (ghost) then Confirm, `flex justify-end gap-2`  |
| Card footer  | Right side      | `flex justify-end gap-3 border-t pt-3`                 |
| Table row    | Right cell      | Hidden by default, `opacity-0 group-hover:opacity-100` |
| Inline form  | Right, last row | `flex justify-end gap-2 pt-2`                          |

### Size

Always `size="sm"` for page-level and table-level actions.

### Action-specific patterns

**Create**

- Label: `"Create [Resource]"` (singular, capitalized)
- Icon: `<Plus className="w-3.5 h-3.5" />` via `leftIcon` prop
- Variant: service color (see table above)

**Refresh**

- Icon-only, `variant="ghost"`, `size="sm"`
- Icon: `<RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />`

**Delete (table row)**

- Icon: `<Trash2 className="w-3.5 h-3.5 text-red-500" />`
- Classes: `p-1.5 text-text-faint hover:text-red-500 hover:bg-red-500/10 rounded transition-colors`
- Visibility: `opacity-0 group-hover:opacity-100 transition-all`
- Always opens `ConfirmModal` before executing

**Delete (modal / card)**

- `variant="danger"` → `bg-red-600 hover:bg-red-500`

**Purge / Batch delete**

- Icon: `<Trash />` (filled variant)
- Classes: `ghost` + `hover:!text-red-500 hover:!bg-red-500/10`

**Copy**

- Icon: `<Copy className="w-3 h-3" />`
- Visibility: `opacity-0 group-hover:opacity-100`
- On click: `toast.success("Copied to clipboard")`

**Download**

- Icon: `<Download className="w-3.5 h-3.5" />`
- `variant="secondary"` or custom, in card footer

**Send / Invoke**

- Icon: `<Send />` or `<Play className="w-3.5 h-3.5" />`
- Full-width in form contexts: `w-full !justify-center`
- Use `isLoading` prop for async feedback

---

## 5. Confirmation Modal

Always use `useConfirmModal()` before any destructive operation. Never delete without confirmation.

```tsx
const { confirm, ConfirmModalComponent } = useConfirmModal();

const handleDelete = (name: string) => {
  confirm({
    title: `Delete "${name}"?`,
    description: "This action cannot be undone.",
    confirmVariant: "danger", // "danger" | "warning"
    action: () => deleteResource(name),
  });
};

// In JSX:
{
  ConfirmModalComponent;
}
```

- **danger** (default for deletes): red
- **warning** (purge, non-delete destructive ops): yellow

### Standard confirmation messages by resource type

| Resource       | Title                     | Description                                             |
| -------------- | ------------------------- | ------------------------------------------------------- |
| S3 Bucket      | `Delete bucket '{name}'?` | The bucket must be empty before deletion.               |
| S3 Object      | `Delete '{key}'?`         | This object will be permanently removed.                |
| DynamoDB Table | `Delete table '{name}'?`  | All items will be permanently deleted.                  |
| DynamoDB Item  | `Delete this item?`       | Permanently remove the item with {pk}='{value}'.        |
| SQS Queue      | `Delete queue '{name}'?`  | All messages will be lost.                              |
| SQS Purge      | `Purge queue '{name}'?`   | All messages in this queue will be permanently deleted. |

---

## 6. Modals (Creation / Edit)

```
┌─ Header ──────────────────────────────────────────────────────┐
│  [Icon in colored bg]  Title                            [X]   │
├─ Body (p-4 space-y-4) ────────────────────────────────────────┤
│  Form fields                                                   │
├─ Footer (p-4 border-t flex justify-end gap-2) ────────────────┤
│                                             Cancel   Confirm  │
└───────────────────────────────────────────────────────────────┘
```

- Backdrop: `fixed inset-0 bg-black/50 backdrop-blur-sm z-50`
- Dialog: `bg-surface-card border border-border-default rounded-card shadow-2xl animate-in fade-in zoom-in-95`
- Max width: `max-w-md` (simple), `max-w-lg` (complex)
- Close: ESC key + X button top-right
- Cancel: `variant="ghost"`, Confirm: service color variant

---

## 7. Data Tables

```
┌─ Table header row ────────────────────────────────────────────┐
│  bg-surface-elevated, text-[11px] uppercase tracking-wider    │
├─ Body rows ───────────────────────────────────────────────────┤
│  divide-y divide-border-subtle, hover:bg-surface-hover        │
│  px-4 py-3 per cell                                           │
└───────────────────────────────────────────────────────────────┘
```

- Header cells: `px-4 py-2.5 font-medium text-text-muted`
- Key column: `text-sm text-text-primary font-medium`
- Secondary columns: `text-sm text-text-secondary`
- Sortable headers: `cursor-pointer hover:text-text-secondary` + sort icon
  - Icons: `<ChevronUp />`, `<ChevronDown />`, `<ChevronsUpDown className="opacity-40" />`
- Last column (actions): `text-right`

---

## 8. Empty States

Use the shared `<EmptyState />` component. Never inline custom empty state markup.

```tsx
<EmptyState
  icon={BucketIcon}
  title="No buckets yet"
  description="Create your first S3 bucket to get started."
  action={{ label: "Create Bucket", onClick: openModal }}
/>
```

- Centered, `py-12 px-6`
- Icon: service color, `w-4 h-4 text-text-faint`
- Title: `text-sm text-text-secondary`
- Description: `text-xs text-text-muted mt-1`
- Action button: subtle border style, `text-xs`

---

## 9. Toast Notifications

Use `useToast()`. Never use browser `alert()`.

```tsx
const toast = useToast();
toast.success("Bucket created");
toast.error("Failed to delete queue");
toast.info("No messages available");
toast.warning("Bucket is not empty");
```

| Type    | Duration | Auto-dismiss |
| ------- | -------- | ------------ |
| success | 4000 ms  | Yes          |
| info    | 4000 ms  | Yes          |
| warning | 6000 ms  | Yes          |
| error   | —        | No           |

Position: `fixed bottom-4 left-4`, stacked vertically with `gap-2`.

### Standard messages

- Copy: `"Copied to clipboard"` (success)
- Create: `"[Resource] created successfully"` (success)
- Delete: `"[Resource] deleted"` (success)
- Error: raw error message string (error)

---

## 10. Form Inputs

```tsx
<Input
  label="Function Name"
  placeholder="my-function"
  accentColor="amber" // maps to focus:border-amber-500/60
  value={name}
  onChange={(e) => setName(e.target.value)}
/>
```

- Label: `text-[11px] text-text-muted uppercase tracking-[0.15em] font-medium px-0.5`
- Input: `w-full bg-surface-input border border-border-default rounded-btn px-3 py-1.5`
- Multi-column forms: `grid grid-cols-1 md:grid-cols-2 gap-4`
- Mono textarea (JSON / code): `font-mono text-sm resize-none`

---

## 11. Typography Scale

| Element          | Classes                                                               |
| ---------------- | --------------------------------------------------------------------- |
| Page title       | `text-base font-semibold text-text-primary`                           |
| Page subtitle    | `text-xs text-text-muted`                                             |
| Section header   | `text-xs font-semibold text-text-secondary uppercase tracking-wider`  |
| Form label       | `text-[11px] text-text-muted uppercase tracking-[0.15em] font-medium` |
| Table header     | `text-[11px] uppercase tracking-wider font-medium text-text-muted`    |
| Body             | `text-sm text-text-secondary`                                         |
| Caption / hint   | `text-xs text-text-muted`                                             |
| Monospace ID/ARN | `font-mono text-xs`                                                   |

---

## 12. Status & Resource Badges

Use the shared `<Badge />` component for all status indicators, types, and categorical labels.

### Variants

| Type        | Variant   | Context                                             |
| ----------- | --------- | --------------------------------------------------- |
| **Status**  | `success` | ACTIVE, CONFIRMED, COMPLETED, RUNNING, HEALTHY      |
|             | `warning` | PENDING, UNCONFIRMED, UPDATING                      |
|             | `error`   | FAILED, DISABLED, STOPPED, UNHEALTHY                |
|             | `info`    | Informational tags (same as `blue`)                 |
| **Service** | `purple`  | IAM, Secrets Manager                                |
|             | `amber`   | Lambda, KMS                                         |
|             | `orange`  | SQS, EC2, ECS                                       |
|             | `rose`    | SNS, WAFv2, Step Functions                          |
|             | `blue`    | S3, RDS, Kinesis                                    |
|             | `emerald` | DynamoDB, ACM                                       |
|             | `sky`     | Route 53                                            |
|             | `teal`    | EventBridge                                         |
|             | `pink`    | SES, CloudFormation                                 |
|             | `cyan`    | CloudWatch Logs                                     |
|             | `indigo`  | Cognito, Parameter Store                            |
| **Special** | `mono`    | For technical IDs or versions (uses monospace font) |
|             | `default` | Neutral fallback for secondary information          |

### Implementation Details

- **Font**: `text-[10px]`, `font-semibold`, `uppercase`, `tracking-wider`.
- **Spacing**: `px-2 py-0.5`.
- **Visuals**: Subtle background (`/10` opacity), matching border (`/30` opacity), and small shadow.

### Usage Example

```tsx
<Badge variant="success">Confirmed</Badge>
<Badge variant="indigo">User Pool</Badge>
```

---

## 13. Loading States

- **Full-page / section**: `<Spinner size="md" />` centered in `py-12 text-center`
- **Skeleton rows**: `h-3 w-{n} bg-surface-skeleton rounded animate-pulse`, 3–5 rows
- **Button async**: `isLoading={true}` prop on `<Button />` — shows spinner, disables click
- **Refresh icon**: `animate-spin` on `<RefreshCw />` while fetching

---

## 14. Spacing & Sizing Cheat Sheet

| Purpose               | Value          |
| --------------------- | -------------- |
| Between page sections | `space-y-5`    |
| Between form fields   | `space-y-4`    |
| Between buttons       | `gap-2`        |
| Icon + label gap      | `gap-3`        |
| Card padding compact  | `p-4`          |
| Card padding default  | `p-5`          |
| Card padding spacious | `p-6`          |
| Icon inline           | `w-3.5 h-3.5`  |
| Icon standard         | `w-4 h-4`      |
| Card border radius    | `rounded-card` |
| Button border radius  | `rounded-btn`  |

---

## 15. Animation & Transition Classes

| Effect                    | Class                                              |
| ------------------------- | -------------------------------------------------- |
| Hover color change        | `transition-colors`                                |
| Opacity + position change | `transition-all`                                   |
| Loading spinner           | `animate-spin`                                     |
| Skeleton loader           | `animate-pulse`                                    |
| Modal entry               | `animate-in fade-in zoom-in-95 duration-150`       |
| Toast entry               | `animate-in fade-in slide-in-from-bottom-2`        |
| Inline form entry         | `animate-in fade-in slide-in-from-top-2`           |
| Row hover                 | `hover:bg-surface-hover transition-colors`         |
| Hidden → hover visible    | `opacity-0 group-hover:opacity-100 transition-all` |

---

## 16. Adding a New Service Page — Checklist

1. Pick a color from the service color table (or assign a new one and add it to the table).
2. Create `src/pages/MyService.tsx` with `<PageHeader>` + right-aligned actions.
3. Use the service color for Create button, tab accent, icon backgrounds, and focus rings.
4. Wire delete/destructive actions through `useConfirmModal()`.
5. Show toasts via `useToast()` for all user-facing outcomes.
6. Use `<EmptyState />` for the zero-items state.
7. Use `<Spinner />` / skeleton rows for loading.
8. Add service-specific components to `src/components/myservice/`.
9. Update this document if a new pattern is introduced.

---

## 17. Resource Creation Patterns

The choice of UI pattern for creating resources depends on the complexity and number of configuration settings.

| Complexity | Criteria                                       | UI Pattern         |
| ---------- | ---------------------------------------------- | ------------------ |
| Simple     | Name, Description, and few basic fields        | **Modal**          |
| Complex    | Advanced settings, multiple tabs, JSON editors | **Dedicated View** |

**Modal Pattern (Simple)**

- Fast interaction without leaving the current context.
- Used for: SNS Topics, IAM Users, IAM Groups, Simple Secrets.

**Dedicated View Pattern (Complex)**

- Provides space for detailed configuration, validation, and multi-step workflows.
- Uses `<PageHeader>` with a back button to return to the list view.
- Used for: S3 Buckets, DynamoDB Tables, Lambda Functions, IAM Policies, IAM Roles.

---

## 18. Resource Settings & Tabbed Navigation

For resources that have multiple management areas (e.g. S3 objects vs settings), use top-level tabbed navigation within the service page.

### Tab Row Layout

- Position: Directly below `<PageHeader />` and above main content.
- Style: `flex items-center gap-1 border-b border-border-subtle mb-5`
- Active Tab: Bottom border in service color, `text-text-primary`, font-medium.
- Inactive Tab: `text-text-muted`, `hover:text-text-primary`.

```tsx
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
```

### Standard Tab Names by Service

| Service  | Tab 1 (Data/Action) | Tab 2 (Management) |
| -------- | ------------------- | ------------------ |
| S3       | Objects             | Settings           |
| Lambda   | Invoke              | Settings           |
| SQS      | Messages            | Settings           |
| SNS      | Publish             | Subscriptions      |
| DynamoDB | Items               | Settings           |
