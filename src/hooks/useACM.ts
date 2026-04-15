import { useState, useCallback, useMemo, useEffect } from "react";
import {
  ListCertificatesCommand,
  RequestCertificateCommand,
  DeleteCertificateCommand,
  type CertificateSummary,
} from "@aws-sdk/client-acm";
import { acmClient } from "../services/awsClients";
import { useToast } from "./useToast";

export const useACM = () => {
  const toast = useToast();
  const [certificates, setCertificates] = useState<CertificateSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCertificates = useCallback(async () => {
    setLoading(true);
    try {
      const response = await acmClient.send(new ListCertificatesCommand({}));
      setCertificates(response.CertificateSummaryList || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch certificates");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const requestCertificate = useCallback(
    async (domainName: string) => {
      try {
        await acmClient.send(new RequestCertificateCommand({ DomainName: domainName }));
        toast.success(`Certificate request for ${domainName} submitted`);
        await fetchCertificates();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to request certificate");
      }
    },
    [fetchCertificates, toast],
  );

  const deleteCertificate = useCallback(
    async (arn: string) => {
      try {
        await acmClient.send(new DeleteCertificateCommand({ CertificateArn: arn }));
        toast.success("Certificate deleted");
        await fetchCertificates();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete certificate");
      }
    },
    [fetchCertificates, toast],
  );

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  return useMemo(
    () => ({
      certificates,
      loading,
      fetchCertificates,
      requestCertificate,
      deleteCertificate,
      refresh: fetchCertificates,
    }),
    [certificates, loading, fetchCertificates, requestCertificate, deleteCertificate],
  );
};
