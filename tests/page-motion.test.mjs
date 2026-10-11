import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createPageTransition, getPageTransitionHref } from '../src/lib/page-motion.ts';

function harness() {
  const views = [];
  const start = update => {
    let finish;
    const view = {
      ready: Promise.resolve(),
      finished: new Promise(resolve => { finish = resolve; }),
      skips: 0,
      skipTransition() { this.skips += 1; },
      async run() { await update(); finish(); },
    };
    views.push(view);
    return view;
  };
  return { start, views };
}

test('motion only takes over a different same-origin page, preserving search and fragment', () => {
  const current = 'http://localhost:3000/topics';
  assert.equal(getPageTransitionHref('/about?from=topics#profile', current), '/about?from=topics#profile');
  for (const href of ['#topic', '/topics#topic', '/topics?filter=all', 'https://example.org/about', 'javascript:alert(1)', 'mailto:anna@example.org', 'http://localhost:3001/about']) {
    assert.equal(getPageTransitionHref(href, current), null);
  }
});

test('snapshot waits for the route commit and releases active state after finishing', async () => {
  const { start, views } = harness();
  const routes = [], states = [];
  const motion = createPageTransition(start, href => routes.push(href), state => states.push(state));
  motion.begin('/about');
  let complete = false;
  const run = views[0].run().then(() => { complete = true; });
  await Promise.resolve();
  assert.deepEqual(routes, ['/about']);
  assert.equal(complete, false);
  motion.commit();
  await run;
  assert.deepEqual(states, [true, false]);
});

test('a rapid newer click cancels a not-yet-started callback instead of navigating to the stale page', async () => {
  const { start, views } = harness();
  const routes = [], states = [];
  const motion = createPageTransition(start, href => routes.push(href), state => states.push(state));
  motion.begin('/about');
  motion.begin('/notes');
  await views[0].run();
  assert.equal(views[0].skips, 1);
  const second = views[1].run();
  assert.equal(states.at(-1), true);
  motion.commit();
  await second;
  assert.deepEqual(routes, ['/notes']);
  assert.equal(states.at(-1), false);
});

test('slow routes time out without blocking rendering; explicit cleanup also releases a waiting snapshot', async () => {
  const { start, views } = harness();
  const states = [];
  const motion = createPageTransition(start, () => {}, state => states.push(state), 10);
  motion.begin('/about');
  await views[0].run();
  assert.equal(views[0].skips, 1);
  assert.equal(states.at(-1), false);
  motion.begin('/notes');
  const pending = views[1].run();
  motion.cancel();
  await pending;
  assert.equal(views[1].skips, 1);
  assert.equal(states.at(-1), false);
});

test('a synchronous API failure falls back to normal routing', () => {
  const routes = [], states = [];
  const motion = createPageTransition(() => { throw new Error('NotSupportedError'); }, href => routes.push(href), state => states.push(state));
  motion.begin('/about');
  assert.deepEqual(routes, ['/about']);
  assert.deepEqual(states, [true, false]);
});
