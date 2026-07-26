/**
 * Transient per-tab join state, keyed by meeting code, so the meeting room page
 * can recognize "I already have a participant record for this meeting" (created
 * via New Meeting or the /join page) without putting participant_id/display name
 * in the URL — the URL is what people share, and it must stay just the code.
 */

interface JoinedState {
  participantId: number;
  displayName: string;
}

function joinedKey(code: string) {
  return `zc_joined_${code}`;
}

function pendingNameKey(code: string) {
  return `zc_pending_name_${code}`;
}

export function setJoinedState(code: string, state: JoinedState): void {
  window.sessionStorage.setItem(joinedKey(code), JSON.stringify(state));
}

export function getJoinedState(code: string): JoinedState | null {
  const raw = window.sessionStorage.getItem(joinedKey(code));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as JoinedState;
  } catch {
    return null;
  }
}

export function clearJoinedState(code: string): void {
  window.sessionStorage.removeItem(joinedKey(code));
}

export function setPendingDisplayName(code: string, displayName: string): void {
  window.sessionStorage.setItem(pendingNameKey(code), displayName);
}

export function consumePendingDisplayName(code: string): string | null {
  const name = window.sessionStorage.getItem(pendingNameKey(code));
  if (name) window.sessionStorage.removeItem(pendingNameKey(code));
  return name;
}
