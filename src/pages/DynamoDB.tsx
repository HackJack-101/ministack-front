import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RefreshCw, Plus, ArrowLeft } from "lucide-react";
import { useDynamoDB } from "../hooks/useDynamoDB";
import { TableList } from "../components/dynamodb/TableList";
import { ItemsTable } from "../components/dynamodb/ItemsTable";
import { AddItemModal } from "../components/dynamodb/AddItemModal";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { PageHeader } from "../components/ui/PageHeader";
import { useConfirmModal } from "../hooks/useConfirmModal";
import { pluralize } from "../utils/format";

export const DynamoDB = () => {
  const { tableName } = useParams();
  const navigate = useNavigate();
  const db = useDynamoDB();
  const { confirm, ConfirmModalComponent } = useConfirmModal();

  const [activeTab, setActiveTab] = useState<"items" | "settings">("items");
  const [isAddingItem, setIsAddingItem] = useState(false);

  useEffect(() => {
    if (tableName) {
      if (db.selectedTable?.TableName !== tableName) {
        db.fetchTableDetails(tableName);
      }
    } else {
      db.setSelectedTable(null);
    }
  }, [tableName, db]);

  const handleDeleteTable = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    confirm({
      title: `Delete table "${name}"?`,
      description: "All items will be permanently deleted. This action cannot be undone.",
      action: () => db.deleteTable(name),
    });
  };

  const handleDeleteItem = (item: Record<string, unknown>) => {
    if (!db.selectedTable) return;
    confirm({
      title: "Delete this item?",
      description: `Permanently remove the item with ${db.selectedTable.PartitionKey} = "${item[db.selectedTable.PartitionKey]}".`,
      action: () => db.deleteItem(db.selectedTable!, item),
    });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="DynamoDB"
        subtitle="Manage NoSQL tables and items in your local environment"
        actions={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => (db.selectedTable ? db.fetchTableDetails(db.selectedTable.TableName) : db.fetchTables())}
              title="Refresh"
              aria-label="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${db.loading || db.itemsLoading ? "animate-spin" : ""}`} />
            </Button>
            {!db.selectedTable && (
              <Button
                variant="success"
                size="sm"
                onClick={() => navigate("/dynamodb/create")}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Create Table
              </Button>
            )}
            {db.selectedTable && (
              <Button
                variant="success"
                size="sm"
                onClick={() => setIsAddingItem(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Create Item
              </Button>
            )}
          </>
        }
      />

      {db.selectedTable && (
        <AddItemModal
          open={isAddingItem}
          onClose={() => setIsAddingItem(false)}
          onConfirm={async (json) => {
            await db.addItem(db.selectedTable!.TableName, json);
          }}
          table={db.selectedTable}
          isLoading={db.itemsLoading}
        />
      )}

      {db.selectedTable ? (
        <div className="space-y-4">
          <div className="flex items-center gap-1 border-b border-border-subtle mb-5">
            <button
              onClick={() => setActiveTab("items")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
                activeTab === "items"
                  ? "border-emerald-500 text-text-primary"
                  : "border-transparent text-text-muted hover:text-text-primary"
              }`}
            >
              Items
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
                activeTab === "settings"
                  ? "border-emerald-500 text-text-primary"
                  : "border-transparent text-text-muted hover:text-text-primary"
              }`}
            >
              Settings
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                navigate("/dynamodb");
                setIsAddingItem(false);
              }}
              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Tables
            </button>
            <span className="text-text-faint">/</span>
            <button
              onClick={() => {
                navigate(`/dynamodb/${db.selectedTable?.TableName}`);
                setActiveTab("items");
              }}
              className="text-sm font-medium text-emerald-500 hover:text-emerald-600 transition-colors"
            >
              {db.selectedTable.TableName}
            </button>
            <Badge variant={db.selectedTable.Status === "ACTIVE" ? "success" : "warning"}>
              {db.selectedTable.Status}
            </Badge>
          </div>

          {activeTab === "items" ? (
            <div className="bg-surface-card rounded-card border border-border-subtle overflow-hidden">
              <ItemsTable
                items={db.items}
                loading={db.itemsLoading}
                selectedTable={db.selectedTable}
                onDelete={handleDeleteItem}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-surface-card rounded-card border border-border-subtle p-6 space-y-6">
                <h2 className="text-xs font-semibold text-text-secondary flex items-center gap-2 uppercase tracking-wider">
                  Table Configuration
                </h2>
                <div className="space-y-4">
                  <div>
                    <span className="block text-[10px] font-medium text-text-muted uppercase tracking-[0.15em] mb-1">
                      Partition Key
                    </span>
                    <span className="text-sm text-text-primary font-medium">{db.selectedTable.PartitionKey}</span>
                  </div>
                  {db.selectedTable.SortKey && (
                    <div>
                      <span className="block text-[10px] font-medium text-text-muted uppercase tracking-[0.15em] mb-1">
                        Sort Key
                      </span>
                      <span className="text-sm text-text-primary font-medium">{db.selectedTable.SortKey}</span>
                    </div>
                  )}
                  <div>
                    <span className="block text-[10px] font-medium text-text-muted uppercase tracking-[0.15em] mb-1">
                      Table ARN
                    </span>
                    <span className="text-xs text-text-muted font-mono break-all">{db.selectedTable.TableArn}</span>
                  </div>
                </div>
              </div>

              <div className="bg-surface-card rounded-card border border-border-subtle p-6 space-y-6">
                <h2 className="text-xs font-semibold text-text-secondary flex items-center gap-2 uppercase tracking-wider">
                  Capacity & Metrics
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-elevated p-3 rounded-lg border border-border-subtle">
                    <span className="block text-[10px] text-text-muted uppercase font-bold tracking-tighter mb-1">
                      Item Count
                    </span>
                    <span className="text-xl font-semibold text-text-primary">{db.selectedTable.ItemCount}</span>
                  </div>
                  <div className="bg-surface-elevated p-3 rounded-lg border border-border-subtle">
                    <span className="block text-[10px] text-text-muted uppercase font-bold tracking-tighter mb-1">
                      Table Size
                    </span>
                    <span className="text-xl font-semibold text-text-primary">
                      {pluralize(db.selectedTable.TableSizeBytes || 0, "byte")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <TableList
          tables={db.tables}
          loading={db.loading}
          onSelect={(name) => navigate(`/dynamodb/${name}`)}
          onDelete={handleDeleteTable}
          onCreateClick={() => navigate("/dynamodb/create")}
        />
      )}

      {ConfirmModalComponent}
    </div>
  );
};
