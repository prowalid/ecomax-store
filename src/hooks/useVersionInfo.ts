import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";

export interface ReleaseEntry {
  version: string;
  channel: string;
  released_at: string | null;
  api_image: string | null;
  web_image: string | null;
  notes?: string | null;
}

export interface VersionInfoResponse {
  current: {
    app: string;
    api_version: string;
    web_version: string;
    git_commit: string | null;
    build_time: string | null;
    release_channel: string;
    api_image: string | null;
    web_image: string | null;
  };
  latest_release: ReleaseEntry | null;
  manifest_source: string | null;
}

export function useVersionInfo() {
  return useQuery({
    queryKey: ["version-info"],
    queryFn: async () => {
      const data = await api.get("/health/version");
      return data as VersionInfoResponse;
    },
    staleTime: 5 * 60 * 1000,
  });
}
