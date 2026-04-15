import { useState, useCallback, useMemo } from "react";
import {
  ListIdentitiesCommand,
  VerifyEmailIdentityCommand,
  DeleteIdentityCommand,
  SendEmailCommand,
} from "@aws-sdk/client-ses";
import { sesClient } from "../services/awsClients";
import { useToast } from "./useToast";

export interface SentEmail {
  id: string;
  timestamp: string;
  source: string;
  destination: {
    toAddresses: string[];
    ccAddresses: string[];
    bccAddresses: string[];
  };
  subject: string;
  body: {
    text?: string;
    html?: string;
  };
}

export const useSES = () => {
  const [identities, setIdentities] = useState<string[]>([]);
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetchIdentities = useCallback(async () => {
    setLoading(true);
    try {
      const response = await sesClient.send(new ListIdentitiesCommand({}));
      setIdentities(response.Identities || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch identities");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchSentEmails = useCallback(async () => {
    try {
      // Use relative URL to leverage proxy and avoid CORS
      const response = await fetch("/_ministack/ses");
      if (response.ok) {
        const data = await response.json();
        setSentEmails(data.emails || []);
      }
    } catch (err) {
      console.error("Failed to fetch sent emails from ministack endpoint", err);
    }
  }, []);

  const verifyIdentity = useCallback(
    async (email: string) => {
      try {
        await sesClient.send(new VerifyEmailIdentityCommand({ EmailAddress: email }));
        toast.success("Identity verification requested");
        await fetchIdentities();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to verify identity");
      }
    },
    [fetchIdentities, toast],
  );

  const deleteIdentity = useCallback(
    async (identity: string) => {
      try {
        await sesClient.send(new DeleteIdentityCommand({ Identity: identity }));
        toast.success("Identity deleted");
        await fetchIdentities();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete identity");
      }
    },
    [fetchIdentities, toast],
  );

  const sendEmail = useCallback(
    async (source: string, to: string[], subject: string, body: string) => {
      try {
        await sesClient.send(
          new SendEmailCommand({
            Source: source,
            Destination: { ToAddresses: to },
            Message: {
              Subject: { Data: subject },
              Body: { Text: { Data: body } },
            },
          }),
        );
        toast.success("Email sent successfully");
        await fetchSentEmails();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to send email");
      }
    },
    [fetchSentEmails, toast],
  );

  return useMemo(
    () => ({
      identities,
      sentEmails,
      loading,
      fetchIdentities,
      fetchSentEmails,
      verifyIdentity,
      deleteIdentity,
      sendEmail,
    }),
    [identities, sentEmails, loading, fetchIdentities, fetchSentEmails, verifyIdentity, deleteIdentity, sendEmail],
  );
};
