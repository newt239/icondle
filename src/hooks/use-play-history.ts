import { useSyncExternalStore } from "react";

import {
  PLAY_HISTORY_CHANGE_EVENT,
  readPlayHistory,
  type PlayHistoryEntry,
} from "#/lib/quiz-history";

const EMPTY_HISTORY: PlayHistoryEntry[] = [];

let cachedSerialized = "";
let cachedEntries: PlayHistoryEntry[] = EMPTY_HISTORY;

const getSnapshot = (): PlayHistoryEntry[] => {
  const next = readPlayHistory();
  const serialized = JSON.stringify(next);
  if (serialized !== cachedSerialized) {
    cachedSerialized = serialized;
    cachedEntries = next;
  }
  return cachedEntries;
};

const getServerSnapshot = (): PlayHistoryEntry[] => EMPTY_HISTORY;

const subscribe = (onStoreChange: () => void): (() => void) => {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(PLAY_HISTORY_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(PLAY_HISTORY_CHANGE_EVENT, onStoreChange);
  };
};

export const usePlayHistory = (): PlayHistoryEntry[] =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
