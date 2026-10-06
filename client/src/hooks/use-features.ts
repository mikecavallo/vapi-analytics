import { useQuery } from "@tanstack/react-query";

export interface FeatureFlags {
  openai: boolean;
  facebookAppSecret: boolean;
  demoMode: boolean;
}

/** Optional integrations configured on the server, used to explain disabled features. */
export function useFeatures() {
  const { data } = useQuery<FeatureFlags>({ queryKey: ["/api/features"], staleTime: 5 * 60_000 });
  return data;
}
