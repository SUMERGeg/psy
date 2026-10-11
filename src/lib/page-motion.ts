type MotionView = { ready: Promise<unknown>; finished: Promise<unknown>; skipTransition: () => void };
type StartTransition = (update: () => Promise<void> | void) => MotionView;

export function getPageTransitionHref(href: string, currentHref: string): string | null {
  try {
    const current = new URL(currentHref);
    const next = new URL(href, current);
    if (next.origin !== current.origin || !['http:', 'https:'].includes(next.protocol) || next.pathname === current.pathname) return null;
    return `${next.pathname}${next.search}${next.hash}`;
  } catch { return null; }
}

// The DOM snapshot waits for a committed route, never for an arbitrary delay.
// A stalled route or a newer click must not leave rendering suspended.
export function createPageTransition(start: StartTransition, navigate: (href: string) => void, setActive: (active: boolean) => void, timeout = 2000) {
  type Pending = { view: MotionView | null; resolve: () => void; timer: ReturnType<typeof setTimeout> | null; cancelled: boolean };
  let pending: Pending | null = null;
  const finish = (record: Pending) => {
    if (record.timer) clearTimeout(record.timer);
    if (pending !== record) return;
    pending = null;
    setActive(false);
  };
  const cancel = () => {
    if (!pending) return;
    const record = pending;
    record.cancelled = true;
    record.view?.skipTransition();
    record.resolve();
    finish(record);
  };
  return {
    begin(href: string) {
      cancel();
      const record: Pending = { view: null, resolve: () => {}, timer: null, cancelled: false };
      pending = record;
      setActive(true);
      try {
        record.view = start(() => {
          if (record.cancelled) return;
          return new Promise<void>((resolve) => {
            record.resolve = resolve;
            record.timer = setTimeout(() => { if (pending === record) cancel(); }, timeout);
            navigate(href);
          });
        });
        // A skipped/unsupported snapshot is normal; navigation still completes.
        void record.view.ready.catch(() => {});
        void record.view.finished.then(() => finish(record), () => finish(record));
      } catch {
        cancel();
        navigate(href);
      }
    },
    commit() {
      if (!pending) return;
      if (pending.timer) clearTimeout(pending.timer);
      pending.resolve();
    },
    cancel,
  };
}
