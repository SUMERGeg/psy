export function getInstagramHandle(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !['instagram.com', 'www.instagram.com'].includes(url.hostname) || url.username || url.password) return null;
    const match = /^\/([a-z0-9._]+)\/?$/iu.exec(url.pathname);
    return match ? `@${match[1]}` : null;
  } catch { return null; }
}

export function getTopicId(slug: string) { return `topic-${slug}`; }
export async function tryCopyHandle(handle: string, clipboard: { writeText: (value: string) => Promise<void> } | undefined): Promise<boolean> {
  try {
    if (!clipboard?.writeText) return false;
    await clipboard.writeText(handle);
    return true;
  } catch { return false; }
}
export function getTopicHref(slug: string) { return `/topics#${encodeURIComponent(getTopicId(slug))}`; }

export function getReadingProgress(position: number, start: number, end: number) {
  if (end <= start) return position < start ? 0 : 100;
  return Math.max(0, Math.min(100, (position - start) / (end - start) * 100));
}

export function getLightOffset(clientX: number, clientY: number, rect: { left: number; top: number; width: number; height: number }) {
  if (rect.width <= 0 || rect.height <= 0) return { x: 0, y: 0 };
  const clamp = (value: number) => Math.max(-1, Math.min(1, value));
  return { x: clamp((clientX - rect.left) / rect.width * 2 - 1) * 18, y: clamp((clientY - rect.top) / rect.height * 2 - 1) * 12 };
}
