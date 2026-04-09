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

  const [isAddingItem, setIsAddingItem] = useState(false);

  useEffect(() => {
    if (tableName) {
      if (db.selectedTable?.TableName !== tableName) {
        db.fetchTableDetails(tableName);
      }
    } else {
      db.setSelectedTable(null);
    }
  }, [tableName, db.fetchTableDetails, db.setSelectedTable, db.selectedTable?.TableName]);

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
            <span className="text-sm font-medium text-emerald-500">{db.selectedTable.TableName}</span>
            <Badge variant={db.selectedTable.Status === "ACTIVE" ? "success" : "warning"}>
              {db.selectedTable.Status}
            </Badge>
            <div className="flex items-center gap-2 ml-1">
              <span className="text-[10px] font-medium text-text-muted bg-surface-elevated border border-border-subtle px-1.5 py-0.5 rounded font-mono">
                PK: {db.selectedTable.PartitionKey}
              </span>
              {db.selectedTable.SortKey && (
                <span className="text-[10px] font-medium text-text-muted bg-surface-elevated border border-border-subtle px-1.5 py-0.5 rounded font-mono">
                  SK: {db.selectedTable.SortKey}
                </span>
              )}
            </div>
            <span className="text-xs text-text-muted ml-auto">{pluralize(db.items.length, "item")}</span>
          </div>

          <div className="bg-surface-card rounded-card border border-border-subtle overflow-hidden">
            <ItemsTable
              items={db.items}
              loading={db.itemsLoading}
              selectedTable={db.selectedTable}
              onDelete={handleDeleteItem}
            />
          </div>
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
