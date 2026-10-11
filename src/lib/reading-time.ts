// A reading estimate, not a promised duration. Count words rather than characters
// so punctuation and line breaks don't inflate the label.
export function getReadingTimeLabel(text: readonly string[]): string {
  const words = text.join(' ').match(/[\p{L}\p{N}]+(?:[-’'][\p{L}\p{N}]+)*/gu)?.length ?? 0;
  const minutes = Math.max(1, Math.ceil(words / 180));
  return `Около ${minutes} мин чтения`;
}
