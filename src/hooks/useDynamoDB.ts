import { useState, useEffect, useCallback } from "react";
import {
  ListTablesCommand,
  CreateTableCommand,
  DeleteTableCommand,
  DescribeTableCommand,
} from "@aws-sdk/client-dynamodb";
import { ScanCommand, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../services/awsClients";
import { useToast } from "./useToast";

export interface TableInfo {
  TableName: string;
  PartitionKey: string;
  SortKey?: string;
  Status?: string;
  ItemCount?: number;
}

export interface NewTableForm {
  name: string;
  partitionKey: string;
  partitionKeyType: "S" | "N";
  sortKey: string;
  sortKeyType: "S" | "N";
}

export const useDynamoDB = () => {
  const toast = useToast();
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableInfo | null>(null);
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);

  const fetchTables = useCallback(async () => {
    setLoading(true);
    try {
      const response = await ddbDocClient.send(new ListTablesCommand({}));
      setTables(response.TableNames || []);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch tables");
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTableDetails = useCallback(async (tableName: string) => {
    setItemsLoading(true);
    try {
      const descResponse = await ddbDocClient.send(new DescribeTableCommand({ TableName: tableName }));
      const table = descResponse.Table;
      if (!table) throw new Error("Table not found");

      const pk = table.KeySchema?.find((k) => k.KeyType === "HASH")?.AttributeName ?? "";
      const sk = table.KeySchema?.find((k) => k.KeyType === "RANGE")?.AttributeName;

      setSelectedTable({
        TableName: tableName,
        PartitionKey: pk,
        SortKey: sk,
        Status: table.TableStatus,
        ItemCount: table.ItemCount,
      });

      const scanResponse = await ddbDocClient.send(new ScanCommand({ TableName: tableName }));
      setItems((scanResponse.Items as Record<string, unknown>[]) || []);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : `Failed to fetch details for ${tableName}`);
    } finally {
      setItemsLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const createTable = async (form: NewTableForm) => {
    const attributeDefinitions = [{ AttributeName: form.partitionKey, AttributeType: form.partitionKeyType }];
    const keySchema: { AttributeName: string; KeyType: "HASH" | "RANGE" }[] = [
      { AttributeName: form.partitionKey, KeyType: "HASH" },
    ];
    if (form.sortKey) {
      attributeDefinitions.push({ AttributeName: form.sortKey, AttributeType: form.sortKeyType });
      keySchema.push({ AttributeName: form.sortKey, KeyType: "RANGE" });
    }
    await ddbDocClient.send(
      new CreateTableCommand({
        TableName: form.name,
        AttributeDefinitions: attributeDefinitions,
        KeySchema: keySchema,
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      }),
    );
    toast.success(`Table "${form.name}" created successfully.`);
    fetchTables();
  };

  const deleteTable = async (tableName: string) => {
    try {
      await ddbDocClient.send(new DeleteTableCommand({ TableName: tableName }));
      if (selectedTable?.TableName === tableName) setSelectedTable(null);
      fetchTables();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete table");
    }
  };

  const addItem = async (tableName: string, json: string) => {
    const item = JSON.parse(json);
    await ddbDocClient.send(new PutCommand({ TableName: tableName, Item: item }));
    toast.success("Item added successfully");
    fetchTableDetails(tableName);
  };

  const deleteItem = async (table: TableInfo, item: Record<string, unknown>) => {
    const key: Record<string, unknown> = { [table.PartitionKey]: item[table.PartitionKey] };
    if (table.SortKey) key[table.SortKey] = item[table.SortKey];
    try {
      await ddbDocClient.send(new DeleteCommand({ TableName: table.TableName, Key: key }));
      fetchTableDetails(table.TableName);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete item");
    }
  };

  return {
    tables,
    selectedTable,
    setSelectedTable,
    items,
    loading,
    itemsLoading,
    fetchTables,
    fetchTableDetails,
    createTable,
    deleteTable,
    addItem,
    deleteItem,
  };
};
