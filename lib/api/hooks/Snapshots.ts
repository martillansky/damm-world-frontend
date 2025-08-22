import { getEnvVars } from "@/lib/utils/env";
import { useQuery } from "@tanstack/react-query";
import { ChartRangeTypes, SnapshotData } from "../types/Snapshots.types";

export function useSnapshots({
  offset,
  limit,
  chainId,
  ranges,
}: {
  offset: number;
  limit: number;
  chainId: number;
  ranges: ChartRangeTypes;
}) {
  return useQuery<SnapshotData[]>({
    queryKey: ["snapshots", { offset, limit, chainId, ranges }],
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams({
        offset: String(offset),
        limit: String(limit),
        chain_id: String(chainId),
        ranges,
      });
      const res = await fetch(
        `${getEnvVars().API_GATEWAY}/lagoon/snapshots/test?${params}`,
        { signal }
      ); // server applies same filters in count+data
      if (!res.ok) throw new Error("Network error");
      return (await res.json()).snapshots;
    },
    // Poll intervals by range
    refetchInterval: () => {
      if (ranges === "24h" || ranges === "7d") return 10_000;
      if (
        ranges === "all" ||
        ranges === "1y" ||
        ranges === "6m" ||
        ranges === "1m"
      )
        return 60_000;
      return false;
    },
    refetchIntervalInBackground: false, // don’t refetch when tab hidden
    refetchOnWindowFocus: false, // optional: avoid jumpy charts
    staleTime: 5_000, // tiny cache window to dedupe bursts
    gcTime: 5 * 60_000, // keep data around for quick tab switches
  });
}
