"use client";

import { useEffect, useRef, useCallback } from 'react';

interface UseAutoRefreshOptions {
    interval?: number; // in milliseconds
    enabled?: boolean;
}

/**
 * Custom hook for auto-refreshing data at specified intervals
 * @param fetchFn - The function to call for fetching data
 * @param options - Configuration options
 */
export function useAutoRefresh(
    fetchFn: () => void | Promise<void>,
    options: UseAutoRefreshOptions = {}
) {
    const { interval = 30000, enabled = true } = options;
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const fetchFnRef = useRef(fetchFn);

    // Keep the fetch function reference updated
    useEffect(() => {
        fetchFnRef.current = fetchFn;
    }, [fetchFn]);

    const startRefresh = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        if (enabled) {
            intervalRef.current = setInterval(() => {
                fetchFnRef.current();
            }, interval);
        }
    }, [interval, enabled]);

    const stopRefresh = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const manualRefresh = useCallback(() => {
        fetchFnRef.current();
    }, []);

    useEffect(() => {
        startRefresh();
        return () => stopRefresh();
    }, [startRefresh, stopRefresh]);

    return { manualRefresh, stopRefresh, startRefresh };
}

export default useAutoRefresh;
