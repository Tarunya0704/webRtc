export function formatMeetingCode(code: string): string {
  return `${code.slice(0, 3)} ${code.slice(3, 7)} ${code.slice(7, 11)}`;
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDuration(minutes: number | null): string {
  if (!minutes) return "";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`;
}

/** Accepts a raw 11-digit meeting code (with or without spaces) or a pasted invite link. */
export function extractMeetingCode(input: string): string | null {
  const trimmed = input.trim();
  const linkMatch = trimmed.match(/\/meeting\/(\d{11})/);
  if (linkMatch) return linkMatch[1];

  const digitsOnly = trimmed.replace(/\s+/g, "");
  if (/^\d{11}$/.test(digitsOnly)) return digitsOnly;

  return null;
}
