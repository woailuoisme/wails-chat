import type { MessageStorageEntry } from "@assistant-ui/core";

/** thread runtime 的本地存储：线程元数据 + 每个线程的消息（已按 format 编码） */
export interface StoredThread {
  remoteId: string;
  title?: string;
  status: "regular" | "archived";
  createdAt: number;
  lastMessageAt: number;
}

interface StoredState {
  threads: StoredThread[];
  /** key 是 remoteId */
  messages: Record<string, MessageStorageEntry<Record<string, unknown>>[]>;
}

const STORAGE_KEY = "starter-threads-v1";

const EMPTY: StoredState = { threads: [], messages: {} };

function read(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    return {
      threads: parsed.threads ?? [],
      messages: parsed.messages ?? {},
    };
  } catch {
    return { ...EMPTY };
  }
}

function write(state: StoredState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function listThreads(): StoredThread[] {
  return read().threads;
}

export function getThread(remoteId: string): StoredThread | undefined {
  return read().threads.find((thread) => thread.remoteId === remoteId);
}

export function upsertThread(thread: StoredThread): void {
  const state = read();
  const index = state.threads.findIndex((item) => item.remoteId === thread.remoteId);
  if (index === -1) state.threads.unshift(thread);
  else state.threads[index] = { ...state.threads[index], ...thread };
  write(state);
}

export function patchThread(remoteId: string, patch: Partial<StoredThread>): void {
  const state = read();
  const index = state.threads.findIndex((item) => item.remoteId === remoteId);
  if (index === -1) return;
  state.threads[index] = { ...state.threads[index], ...patch };
  write(state);
}

export function removeThread(remoteId: string): void {
  const state = read();
  state.threads = state.threads.filter((thread) => thread.remoteId !== remoteId);
  delete state.messages[remoteId];
  write(state);
}

export function readMessages(remoteId: string): MessageStorageEntry<Record<string, unknown>>[] {
  return read().messages[remoteId] ?? [];
}

export function writeMessages(
  remoteId: string,
  entries: MessageStorageEntry<Record<string, unknown>>[],
): void {
  const state = read();
  state.messages[remoteId] = entries;
  const index = state.threads.findIndex((thread) => thread.remoteId === remoteId);
  if (index !== -1) {
    state.threads[index].lastMessageAt = Date.now();
  }
  write(state);
}

/** 有数据的线程才值得迁移/展示 */
export function hasAnyThread(): boolean {
  return read().threads.length > 0;
}

export function replaceAll(state: StoredState): void {
  write(state);
}

export function clearAllThreads(): void {
  write({ threads: [], messages: {} });
}

export { STORAGE_KEY as THREAD_STORAGE_KEY };
