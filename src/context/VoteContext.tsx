import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  type ReactNode,
} from "react";
import { NTTU_VOTE_CONFIG } from "../data/voteConfig";

export interface VotingResultItem {
  submissionId: string;
  title: string;
  votes: number;
  rank: number;
}

export interface VoteContextType {
  votes: number;
  formattedVotes: string;
  rank: number | null;
  isLoading: boolean;
  isLive: boolean;
  isPulsing: boolean;
  lastUpdated: Date | null;
  error: string | null;
  refetch: () => Promise<void>;
}

const VoteContext = createContext<VoteContextType | null>(null);

const STORAGE_CACHE_KEY = "eaagri_live_vote_stats";
const PROXY_URL = "/api/voting-results";
const DIRECT_URL = NTTU_VOTE_CONFIG.apiResultsUrl;
const REFRESH_INTERVAL_MS = 10000; // 10s fallback polling (instant 0ms updates come via WebSocket)
const CACHE_TTL_MS = 60000;

const DEFAULT_VOTES = 1110;
const DEFAULT_RANK = 1;

export function VoteProvider({ children }: { children: ReactNode }) {
  // Read cache from sessionStorage if not expired
  const [cached] = useState<{ votes: number; rank: number | null } | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = sessionStorage.getItem(STORAGE_CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (
          typeof parsed.votes === "number" &&
          typeof parsed.updatedAt === "number" &&
          Date.now() - parsed.updatedAt < CACHE_TTL_MS
        ) {
          return { votes: parsed.votes, rank: parsed.rank ?? 1 };
        }
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [votes, setVotes] = useState<number>(cached?.votes ?? DEFAULT_VOTES);
  const [rank, setRank] = useState<number | null>(cached?.rank ?? DEFAULT_RANK);
  const [isLoading] = useState<boolean>(false);
  const [isLive, setIsLive] = useState<boolean>(Boolean(cached));
  const [isPulsing, setIsPulsing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isFetchingRef = useRef(false);
  const currentVotesRef = useRef(votes);
  currentVotesRef.current = votes;

  const pulseTimerRef = useRef<any>(null);
  const triggerPulse = useCallback(() => {
    if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
    setIsPulsing(true);
    pulseTimerRef.current = setTimeout(() => setIsPulsing(false), 1500);
  }, []);

  // 1. Instant WebSocket HMR listener (0ms latency without page reload)
  useEffect(() => {
    // @ts-ignore
    if (import.meta.hot) {
      const handleHotVote = (payload: any) => {
        if (payload && typeof payload.votes === "number") {
          // Only update state if votes actually changed
          if (payload.votes !== currentVotesRef.current) {
            currentVotesRef.current = payload.votes;
            setVotes(payload.votes);
            setRank(payload.rank ?? 1);
            setIsLive(true);
            setLastUpdated(new Date());
            triggerPulse();
          }
        }
      };
      // @ts-ignore
      import.meta.hot.on("eaagri:vote-updated", handleHotVote);
      return () => {
        // @ts-ignore
        import.meta.hot?.off("eaagri:vote-updated", handleHotVote);
      };
    }
  }, [triggerPulse]);

  // 2. BroadcastChannel for instant cross-tab synchronization
  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;
    const bc = new BroadcastChannel("eaagri_live_vote_channel");
    bc.onmessage = (event) => {
      if (event.data && typeof event.data.votes === "number") {
        if (event.data.votes !== currentVotesRef.current) {
          currentVotesRef.current = event.data.votes;
          setVotes(event.data.votes);
          setRank(event.data.rank ?? 1);
          setIsLive(true);
          triggerPulse();
        }
      }
    };
    return () => {
      bc.close();
    };
  }, [triggerPulse]);

  const fetchVotes = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    let data: VotingResultItem[] | null = null;
    let fetchError: Error | null = null;
    const cacheBuster = `t=${Date.now()}`;

    // Strategy 1: Attempt proxy (/api/voting-results) with cache-busting & no-store
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${PROXY_URL}?${cacheBuster}`, {
        cache: "no-store",
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-cache",
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json)) {
          data = json;
        }
      }
    } catch (err) {
      fetchError = err as Error;
    }

    // Strategy 2: Fallback to direct URL if proxy is unavailable
    if (!data) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(`${DIRECT_URL}?${cacheBuster}`, {
          cache: "no-store",
          headers: {
            Accept: "application/json",
            "Cache-Control": "no-cache",
          },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json)) {
            data = json;
          }
        }
      } catch (err) {
        if (!fetchError) fetchError = err as Error;
      }
    }

    try {
      if (data && Array.isArray(data)) {
        const eaAgriItem = data.find(
          (item) =>
            item.submissionId === NTTU_VOTE_CONFIG.submissionId ||
            item.title?.toLowerCase().includes("eaagri")
        );

        if (eaAgriItem && typeof eaAgriItem.votes === "number") {
          const newVotes = eaAgriItem.votes;
          const newRank = eaAgriItem.rank ?? 1;

          // ONLY update state if number actually changed!
          if (newVotes !== currentVotesRef.current) {
            currentVotesRef.current = newVotes;
            setVotes(newVotes);
            setRank(newRank);
            setIsLive(true);
            setLastUpdated(new Date());
            setError(null);
            triggerPulse();

            // Sync with other open browser tabs
            if (typeof window !== "undefined" && "BroadcastChannel" in window) {
              const bc = new BroadcastChannel("eaagri_live_vote_channel");
              bc.postMessage({ votes: newVotes, rank: newRank });
              bc.close();
            }

            try {
              sessionStorage.setItem(
                STORAGE_CACHE_KEY,
                JSON.stringify({
                  votes: newVotes,
                  rank: newRank,
                  updatedAt: Date.now(),
                })
              );
            } catch {
              // ignore storage error
            }
          }
        }
      } else if (fetchError) {
        setError(fetchError.message);
      }
    } finally {
      isFetchingRef.current = false;
    }
  }, [triggerPulse]);

  // Poll on mount and periodically every 10s
  useEffect(() => {
    fetchVotes();

    const intervalId = setInterval(fetchVotes, REFRESH_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchVotes();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
    };
  }, [fetchVotes]);

  const formattedVotes = `${votes.toLocaleString("vi-VN")}+`;

  const contextValue = useMemo(
    () => ({
      votes,
      formattedVotes,
      rank,
      isLoading,
      isLive,
      isPulsing,
      lastUpdated,
      error,
      refetch: fetchVotes,
    }),
    [votes, formattedVotes, rank, isLoading, isLive, isPulsing, lastUpdated, error, fetchVotes]
  );

  return (
    <VoteContext.Provider value={contextValue}>
      {children}
    </VoteContext.Provider>
  );
}

export function useVoteStats(): VoteContextType {
  const context = useContext(VoteContext);
  if (!context) {
    // Fallback if rendered outside VoteProvider
    return {
      votes: DEFAULT_VOTES,
      formattedVotes: NTTU_VOTE_CONFIG.currentVotes,
      rank: 1,
      isLoading: false,
      isLive: false,
      isPulsing: false,
      lastUpdated: null,
      error: null,
      refetch: async () => {},
    };
  }
  return context;
}
