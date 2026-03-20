"use client";

import { useState, useEffect, useRef } from "react";
import { getViewPreferences, saveViewPreference } from "@/app/actions/user-profile";

/**
 * Persists a user's grid/list view preference per page key.
 * - Loads from localStorage instantly (no flash).
 * - Syncs from DB on mount so the same preference follows the user across devices.
 * - Saves to both localStorage and DB on every change.
 */
export function useViewPreference<T extends string>(
    key: string,
    defaultValue: T
): [T, (value: T) => void] {
    // Always start with defaultValue so server and client render identically (no hydration mismatch).
    // localStorage and DB values are applied after mount in a useEffect.
    const [viewMode, setViewMode] = useState<T>(defaultValue);

    const synced = useRef(false);

    // On mount: apply localStorage first, then sync from DB
    useEffect(() => {
        if (synced.current) return;
        synced.current = true;

        // Apply localStorage immediately (no server-side flash)
        const stored = localStorage.getItem(key) as T | null;
        if (stored) setViewMode(stored);

        // Then pull from DB and override if DB has a value
        getViewPreferences().then((prefs) => {
            const dbValue = prefs[key] as T | undefined;
            if (dbValue) {
                setViewMode(dbValue);
                localStorage.setItem(key, dbValue);
            }
        });
    }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

    const setAndPersist = (value: T) => {
        setViewMode(value);
        localStorage.setItem(key, value);
        saveViewPreference(key, value);
    };

    return [viewMode, setAndPersist];
}
