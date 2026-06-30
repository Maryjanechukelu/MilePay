// Central export point — import everything from "@/hooks/queries"
export { queryKeys } from "./queryKeys";

export {
  useProject,
  usePublicProject,
  useProjects,
  useProjectAuditLog,
  useProjectPaymentPolling,
  useCreateProject,
  useAcceptProject,
  useCancelProject,
} from "./useProjects";

export {
  useSubmitMilestone,
  useApproveMilestone,
  useRequestRevision,
  useDisputeMilestone,
  useSubmitCounterEvidence,
} from "./useMilestones";

export {
  useProviderDashboard,
  useClientDashboard,
} from "./useDashboard";

export {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "./useNotifications";

export {
  useAdminDisputes,
  useAdminUnmatchedPayments,
  useAdminTransactions,
  useAdminUsers,
  useResolveDispute,
  useResolveUnmatchedPayment,
  useVerifyUser,
  useSuspendUser,
} from "./useAdmin";

export {
  useCurrentUser,
  useLogin,
  useRegister,
  useForgotPassword,
  useResetPassword,
  useBanks,
  useResolveBankAccount,
  useProviderProfileOnboarding,
  useProviderIdentityOnboarding,
  useConfirmProviderBank,
  useClientProfileOnboarding,
  useConfirmClientOnboarding,
} from "./useAuth";