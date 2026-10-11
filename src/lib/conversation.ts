import type { ConversationContent } from '../content/types';

export function toggleThought(selected: string[], id: string): string[] {
  if (selected.includes(id)) return selected.filter((item) => item !== id);
  return selected.length < 3 ? [...selected, id] : selected;
}

export function createConversationMessage(content: ConversationContent, directionId: string | null, selected: string[]): string {
  const direction = content.directions.find((item) => item.id === directionId);
  if (!direction) return '';
  const thoughts = [...new Set(selected)]
    .map((id) => content.thoughts.find((item) => item.id === id))
    .filter((item) => item !== undefined).slice(0, 3);
  if (!thoughts.length) return '';
  // Group parallel phrases by their shared grammatical start, not by an
  // inferred psychological connection. Keep group and phrase selection order.
  const groups = new Map<string, string[]>();
  for (const thought of thoughts) {
    const fragments = groups.get(thought.prefix) ?? [];
    fragments.push(thought.fragment);
    groups.set(thought.prefix, fragments);
  }
  const sentences = [...groups].map(([prefix, fragments]) => {
    // Close an embedded clause before the final conjunction (e.g.
    // «понять, чего я хочу, и сказать “нет”»).
    const conjunction = fragments.at(-2)?.includes(',') ? ', и ' : ' и ';
    const list = fragments.length === 1 ? fragments[0]
      : `${fragments.slice(0, -1).join(', ')}${conjunction}${fragments.at(-1)}`;
    return `${prefix} ${list}.`;
  });
  return [`${direction.opening} ${sentences.join(' ')}`, content.closing].join('\n\n');
}
