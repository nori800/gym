"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

type LastSessionData = {
  lastWeight: number | null;
  lastReps: number | null;
  lastSets: number | null;
  lastDate: string | null;
  loading: boolean;
};

type BlockMovement = {
  movementId: string;
  nameJa?: string;
  sets?: number;
  reps?: number;
  weight?: number;
  perSetWeight?: number[];
  perSetReps?: number[];
};

type BlockJson = {
  movements?: BlockMovement[];
};

const cache = new Map<string, Omit<LastSessionData, "loading">>();

export function useLastSession(
  movementId: string,
  userId: string | undefined,
): LastSessionData {
  const [data, setData] = useState<LastSessionData>({
    lastWeight: null,
    lastReps: null,
    lastSets: null,
    lastDate: null,
    loading: true,
  });

  const fetchedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userId || !movementId) {
      setData((prev) => ({ ...prev, loading: false }));
      return;
    }

    const cacheKey = `${userId}:${movementId}`;

    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey)!;
      setData({ ...cached, loading: false });
      return;
    }

    if (fetchedRef.current === cacheKey) return;
    fetchedRef.current = cacheKey;

    const supabase = createClient();

    supabase
      .from("workouts")
      .select("workout_date, blocks_json")
      .eq("user_id", userId)
      .order("workout_date", { ascending: false })
      .limit(50)
      .then(({ data: workouts, error }) => {
        if (error || !workouts) {
          setData((prev) => ({ ...prev, loading: false }));
          return;
        }

        for (const workout of workouts) {
          const blocks = workout.blocks_json as BlockJson[] | null;
          if (!Array.isArray(blocks)) continue;

          for (const block of blocks) {
            if (!Array.isArray(block.movements)) continue;

            const match = block.movements.find(
              (m) => m.movementId === movementId,
            );
            if (!match) continue;

            const maxWeight =
              Array.isArray(match.perSetWeight) && match.perSetWeight.length > 0
                ? Math.max(...match.perSetWeight)
                : (match.weight ?? null);

            const result: Omit<LastSessionData, "loading"> = {
              lastWeight: maxWeight,
              lastReps: match.reps ?? null,
              lastSets: match.sets ?? null,
              lastDate: workout.workout_date ?? null,
            };

            cache.set(cacheKey, result);
            setData({ ...result, loading: false });
            return;
          }
        }

        const empty: Omit<LastSessionData, "loading"> = {
          lastWeight: null,
          lastReps: null,
          lastSets: null,
          lastDate: null,
        };
        cache.set(cacheKey, empty);
        setData({ ...empty, loading: false });
      });
  }, [movementId, userId]);

  return data;
}
