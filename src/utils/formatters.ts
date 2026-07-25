/**
 * Format numbers compactly (e.g. 14200 -> "14.2K", 1850000 -> "1.85M")
 */
export function formatCompactNumber(num: number): string {
  if (isNaN(num) || num === undefined) return "0";
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1) + "M";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(num % 1_000 === 0 ? 0 : 1) + "K";
  }
  return num.toString();
}

/**
 * Format full number with commas (e.g. 14200 -> "14,200")
 */
export function formatFullNumber(num: number): string {
  if (isNaN(num) || num === undefined) return "0";
  return new Intl.NumberFormat("en-US").format(num);
}

/**
 * Format ISO timestamp into Twitter style date string (e.g. "8:32 PM · Jul 22, 2024")
 */
export function formatTweetDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "10:42 AM · Jul 24, 2024";

    const timeString = d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const dateString = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return `${timeString} · ${dateString}`;
  } catch {
    return "10:42 AM · Jul 24, 2024";
  }
}

/**
 * Get proxy image URL if external
 */
export function getProxiedImageUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("data:") || url.startsWith("blob:") || url.startsWith("/")) {
    return url;
  }
  return `/api/proxy-image?url=${encodeURIComponent(url)}`;
}
