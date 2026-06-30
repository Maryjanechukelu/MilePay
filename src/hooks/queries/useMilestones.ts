"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { milestoneApi, uploadApi } from "@/lib/api";
import { queryKeys } from "./queryKeys";

/**
 * All milestone mutations invalidate the parent project's detail query
 * (and dashboards, since stats like pendingAmount/totalEarned change too)
 * so the UI reflects the new state immediately without a manual refetch.
 */
function invalidateProjectAndDashboards(
  queryClient: ReturnType<typeof useQueryClient>,
  projectId: string
) {
  queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.provider });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.client });
}

/**
 * Provider submits a milestone deliverable. Files (if any) are uploaded
 * first via uploadApi, then their resulting URLs are sent in the JSON
 * body — the backend expects deliveryFiles: string[], not raw files.
 */
export function useSubmitMilestone(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      milestoneId,
      deliveryNote,
      files,
    }: {
      milestoneId: string;
      deliveryNote: string;
      files?: File[];
    }) => {
      const deliveryFiles = files?.length ? await uploadApi.uploadFiles(files) : undefined;
      return milestoneApi.submit(projectId, milestoneId, { deliveryNote, deliveryFiles });
    },
    onSuccess: () => {
      invalidateProjectAndDashboards(queryClient, projectId);
      toast.success("Milestone submitted! Your client has been notified.");
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Could not submit milestone");
    },
  });
}

/** Client approves a milestone — triggers the Nomba transfer on the backend. */
export function useApproveMilestone(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (milestoneId: string) =>
      milestoneApi.approve(projectId, milestoneId),
    onSuccess: () => {
      invalidateProjectAndDashboards(queryClient, projectId);
      toast.success("Approved! Payment is being released to the provider.");
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Could not approve milestone");
    },
  });
}

/** Client requests a revision on a submitted milestone. */
export function useRequestRevision(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      milestoneId,
      notes,
    }: {
      milestoneId: string;
      notes: string;
    }) => milestoneApi.requestRevision(projectId, milestoneId, notes),
    onSuccess: () => {
      invalidateProjectAndDashboards(queryClient, projectId);
      toast.success("Revision requested. Provider has been notified.");
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Could not request revision");
    },
  });
}

/**
 * Raise a dispute on a milestone. Evidence files (if any) are uploaded
 * first via uploadApi, then their URLs are sent as evidenceFiles: string[].
 */
export function useDisputeMilestone(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      milestoneId,
      reason,
      description,
      files,
    }: {
      milestoneId: string;
      reason: string;
      description: string;
      files?: File[];
    }) => {
      const evidenceFiles = files?.length ? await uploadApi.uploadFiles(files) : undefined;
      return milestoneApi.dispute(projectId, milestoneId, { reason, description, evidenceFiles });
    },
    onSuccess: () => {
      invalidateProjectAndDashboards(queryClient, projectId);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.disputes });
      toast.success("Dispute raised. Funds are frozen. We'll review within 48 hours.");
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Could not raise dispute");
    },
  });
}

/**
 * Provider submits counter-evidence on an open dispute. Evidence files
 * (if any) are uploaded first via uploadApi, then sent as URLs.
 */
export function useSubmitCounterEvidence(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      milestoneId,
      description,
      files,
    }: {
      milestoneId: string;
      description: string;
      files?: File[];
    }) => {
      const evidenceFiles = files?.length ? await uploadApi.uploadFiles(files) : undefined;
      return milestoneApi.counterEvidence(projectId, milestoneId, { description, evidenceFiles });
    },
    onSuccess: () => {
      invalidateProjectAndDashboards(queryClient, projectId);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.disputes });
      toast.success("Your response has been submitted to the dispute.");
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Could not submit response");
    },
  });
}