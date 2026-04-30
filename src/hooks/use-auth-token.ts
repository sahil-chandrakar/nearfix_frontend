"use client";

import { useCallback, useSyncExternalStore } from "react";

export const TOKEN_STORAGE_KEY = "nearfix_access_token";
const TOKEN_CHANGED_EVENT = "nearfix-token-changed";

function readStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

function subscribeToToken(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(TOKEN_CHANGED_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(TOKEN_CHANGED_EVENT, onStoreChange);
  };
}

function getTokenServerSnapshot() {
  return null;
}

function getReadySnapshot() {
  return true;
}

function getReadyServerSnapshot() {
  return false;
}

export function useAuthToken() {
  const token = useSyncExternalStore(
    subscribeToToken,
    readStoredToken,
    getTokenServerSnapshot,
  );
  const isReady = useSyncExternalStore(
    subscribeToToken,
    getReadySnapshot,
    getReadyServerSnapshot,
  );

  const setToken = useCallback((nextToken: string) => {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
    window.dispatchEvent(new Event(TOKEN_CHANGED_EVENT));
  }, []);

  const clearToken = useCallback(() => {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.dispatchEvent(new Event(TOKEN_CHANGED_EVENT));
  }, []);

  return { token, setToken, clearToken, isReady };
}
