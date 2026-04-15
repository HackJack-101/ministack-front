import { useState, useCallback, useMemo } from "react";
import {
  ListEventBusesCommand,
  ListRulesCommand,
  PutEventsCommand,
  CreateEventBusCommand,
  DeleteEventBusCommand,
} from "@aws-sdk/client-eventbridge";
import type { EventBus } from "@aws-sdk/client-eventbridge";
import { eventBridgeClient } from "../services/awsClients";
import { useToast } from "./useToast";

export const useEventBridge = () => {
  const [eventBuses, setEventBuses] = useState<EventBus[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetchEventBuses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await eventBridgeClient.send(new ListEventBusesCommand({}));
      setEventBuses(response.EventBuses || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch event buses");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchRules = useCallback(
    async (eventBusName: string) => {
      try {
        const response = await eventBridgeClient.send(new ListRulesCommand({ EventBusName: eventBusName }));
        return response.Rules || [];
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to fetch rules");
        return [];
      }
    },
    [toast],
  );

  const createEventBus = useCallback(
    async (name: string) => {
      try {
        await eventBridgeClient.send(new CreateEventBusCommand({ Name: name }));
        toast.success("Event bus created successfully");
        await fetchEventBuses();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to create event bus");
      }
    },
    [fetchEventBuses, toast],
  );

  const deleteEventBus = useCallback(
    async (name: string) => {
      try {
        await eventBridgeClient.send(new DeleteEventBusCommand({ Name: name }));
        toast.success("Event bus deleted successfully");
        await fetchEventBuses();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete event bus");
      }
    },
    [fetchEventBuses, toast],
  );

  const putEvents = useCallback(
    async (busName: string, source: string, detailType: string, detail: string) => {
      try {
        await eventBridgeClient.send(
          new PutEventsCommand({
            Entries: [
              {
                EventBusName: busName,
                Source: source,
                DetailType: detailType,
                Detail: detail,
              },
            ],
          }),
        );
        toast.success("Event sent successfully");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to send event");
      }
    },
    [toast],
  );

  return useMemo(
    () => ({
      eventBuses,
      loading,
      fetchEventBuses,
      fetchRules,
      createEventBus,
      deleteEventBus,
      putEvents,
    }),
    [eventBuses, loading, fetchEventBuses, fetchRules, createEventBus, deleteEventBus, putEvents],
  );
};
