import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { projectApi } from "@/lib/api";

export function useProviderProjects(params: {
  state?: string;
  page: number;
  limit: number;
}) {
  return useQuery({
    queryKey: ["projects", "provider", params],
    queryFn: () =>
      projectApi.list({
        role: "provider",
        state: params.state,
        page: params.page,
        limit: params.limit,
      }),
    placeholderData: keepPreviousData,
  });
}