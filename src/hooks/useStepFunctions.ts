import { useState, useCallback, useMemo, useEffect } from "react";
import {
  ListStateMachinesCommand,
  CreateStateMachineCommand,
  DeleteStateMachineCommand,
  type StateMachineListItem,
} from "@aws-sdk/client-sfn";
import { sfnClient } from "../services/awsClients";
import { useToast } from "./useToast";

export const useStepFunctions = () => {
  const toast = useToast();
  const [stateMachines, setStateMachines] = useState<StateMachineListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStateMachines = useCallback(async () => {
    setLoading(true);
    try {
      const response = await sfnClient.send(new ListStateMachinesCommand({}));
      setStateMachines(response.stateMachines || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch state machines");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createStateMachine = useCallback(
    async (name: string, definition: string, roleArn: string) => {
      try {
        await sfnClient.send(
          new CreateStateMachineCommand({
            name,
            definition,
            roleArn,
          }),
        );
        toast.success(`State machine ${name} created`);
        await fetchStateMachines();
      } catch (err: any) {
        toast.error(err.message || "Failed to create state machine");
      }
    },
    [fetchStateMachines, toast],
  );

  const deleteStateMachine = useCallback(
    async (arn: string) => {
      try {
        await sfnClient.send(new DeleteStateMachineCommand({ stateMachineArn: arn }));
        toast.success("State machine deleted");
        await fetchStateMachines();
      } catch (err: any) {
        toast.error(err.message || "Failed to delete state machine");
      }
    },
    [fetchStateMachines, toast],
  );

  useEffect(() => {
    fetchStateMachines();
  }, [fetchStateMachines]);

  return useMemo(
    () => ({
      stateMachines,
      loading,
      fetchStateMachines,
      createStateMachine,
      deleteStateMachine,
      refresh: fetchStateMachines,
    }),
    [stateMachines, loading, fetchStateMachines, createStateMachine, deleteStateMachine],
  );
};
