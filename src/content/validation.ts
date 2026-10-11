import type { ContentBlock, ContentStatus, Fact, SiteContent, SiteMode, VisibleSiteContent } from './types';

const requiredPages = ['home', 'about', 'topics', 'sessions', 'faq'] as const;
const routes = { home: '/', about: '/about', topics: '/topics', sessions: '/sessions', faq: '/faq', relationships: '/topics/relationships', 'self-esteem': '/topics/self-esteem', notes: '/notes' };
const placeholder = /\b(?:TBD|TODO|lorem)\b|ПОДТВЕРДИТЬ|\[[^\]]+\]/iu;

function isVisible(status: ContentStatus, mode: SiteMode): boolean {
  return status === 'APPROVED' || (mode === 'preview' && status === 'DEMO');
}

function getFactValue<T>(fact: Fact<T>, mode: SiteMode): T | null {
  return fact.confirmed ? fact.value : mode === 'preview' ? fact.demo?.value ?? null : null;
}

function isSafeHttpsUrl(value: string, originOnly = false): boolean {
  try {
    const url = new URL(value);
    return !/\s/u.test(value) && url.protocol === 'https:' && !!url.hostname && !url.username && !url.password
      && (!originOnly || (url.pathname === '/' && !url.search && !url.hash));
  } catch {
    return false;
  }
}

export function getVisibleBlocks(blocks: ContentBlock[], mode: SiteMode): ContentBlock[] {
  return blocks.filter((block) => isVisible(block.status, mode));
}

export function validatePublication(content: SiteContent, mode: SiteMode, siteUrl: string | null): string[] {
  const errors: string[] = [];
  const fail = (field: string, reason: string) => { errors.push(`${field}: ${reason}`); };
  const text = (field: string, value: string, required = true) => {
    if (required && !value.trim()) fail(field, 'text is missing');
    if (placeholder.test(value)) fail(field, 'placeholder must not be published');
  };
  const source = (field: string, value: string) => { text(`${field}.source`, value); };
  if (content.conversation && isVisible(content.conversation.status, mode)) {
    const conversation = content.conversation;
    source('conversation', conversation.source);
    for (const key of ['title', 'introduction', 'privacy', 'attribution', 'closing'] as const) text(`conversation.${key}`, conversation[key]);
    if (!conversation.directions.length || !conversation.thoughts.length) fail('conversation', 'directions and thoughts are required');
    for (const [group, items] of Object.entries({ directions: conversation.directions, thoughts: conversation.thoughts })) {
      const ids = new Set<string>();
      for (const item of items) {
        if (!/^[a-z][a-z0-9-]*$/u.test(item.id) || ids.has(item.id)) fail(`conversation.${group}`, 'safe unique ids are required');
        ids.add(item.id);
        for (const [key, value] of Object.entries(item)) text(`conversation.${group}.${item.id}.${key}`, value);
      }
    }
  }
  const facts = new Map<string, Fact<unknown>>();
  for (const [group, entries] of Object.entries({ specialist: content.specialist, consultations: content.consultations, contacts: content.contacts })) {
    for (const [key, fact] of Object.entries(entries)) {
      const field = `${group}.${key}`;
      facts.set(field, fact);
      const selected = fact.confirmed ? fact : mode === 'preview' ? fact.demo : undefined;
      if (selected) {
        if (selected.value === null || selected.value === undefined) fail(field, 'visible fact has no value');
        source(field, selected.source);
        if (typeof selected.value === 'string') text(field, selected.value);
      }
    }
  }
  const requireFact = (field: string) => {
    const fact = facts.get(field);
    if (!fact || getFactValue(fact, mode) === null) fail(field, 'confirmed fact is required');
  };
  for (const key of ['bookingUrl', 'instagramUrl'] as const) {
    const fact = content.contacts[key];
    if (fact.value !== null && !isSafeHttpsUrl(fact.value)) fail(`contacts.${key}`, 'safe HTTPS URL without credentials is required');
    if (!fact.confirmed && mode === 'preview' && fact.demo && !isSafeHttpsUrl(fact.demo.value)) fail(`contacts.${key}.demo`, 'safe HTTPS URL without credentials is required');
  }
  if (content.contacts.email.value !== null && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(content.contacts.email.value)) {
    fail('contacts.email', 'valid email address is required');
  }
  const email = content.contacts.email;
  if (!email.confirmed && mode === 'preview' && email.demo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email.demo.value)) fail('contacts.email.demo', 'valid email address is required');
  const duration = content.consultations.durationMinutes;
  const durationValue = getFactValue(duration, mode);
  if ((duration.confirmed || (mode === 'preview' && duration.demo)) && (!Number.isFinite(durationValue) || (durationValue ?? 0) <= 0)) fail('consultations.durationMinutes', 'positive duration is required');
  const price = content.consultations.price;
  const priceValue = getFactValue(price, mode);
  if ((price.confirmed || (mode === 'preview' && price.demo)) && (!priceValue || !Number.isFinite(priceValue.amount) || priceValue.amount < 0 || !/^[A-Z]{3}$/u.test(priceValue.currency))) {
    fail('consultations.price', 'nonnegative amount and three-letter currency are required');
  }
  if (mode === 'production') {
    if (!siteUrl || !isSafeHttpsUrl(siteUrl, true)) fail('SITE_URL', 'valid HTTPS public origin is required');
    for (const field of ['specialist.name', 'specialist.role', 'contacts.bookingUrl', 'consultations.format', 'consultations.durationMinutes', 'consultations.price']) requireFact(field);
    for (const id of requiredPages) {
      if (!content.pages.some((page) => page.id === id && page.enabled)) fail(`pages.${id}`, 'enabled production page is required');
    }
  }
  const pageIds = new Set<string>();
  for (const page of content.pages) {
    const field = `pages.${page.id}`;
    if (pageIds.has(page.id)) fail(field, 'duplicate page');
    pageIds.add(page.id);
    if (page.path !== routes[page.id]) fail(`${field}.path`, 'unexpected route');
    if (!page.enabled) continue;
    if (mode === 'production' && page.metadata.status !== 'APPROVED') fail(`${field}.metadata`, 'approved metadata is required');
    if (isVisible(page.metadata.status, mode)) {
      text(`${field}.metadata.title`, page.metadata.title);
      text(`${field}.metadata.description`, page.metadata.description);
      source(`${field}.metadata`, page.metadata.source);
    }
    if (mode === 'production') {
      if (!getVisibleBlocks(page.blocks, mode).length) fail(field, 'approved content is required');
      for (const block of page.blocks) {
        if (block.required && block.status !== 'APPROVED') fail(`${field}.${block.id}`, 'required block must be approved');
      }
    }
    const blockIds = new Set<string>();
    for (const block of getVisibleBlocks(page.blocks, mode)) {
      const blockField = `${field}.${block.id}`;
      if (blockIds.has(block.id)) fail(blockField, 'duplicate block');
      blockIds.add(block.id);
      text(`${blockField}.title`, block.title);
      block.body.forEach((line, index) => text(`${blockField}.body.${index}`, line));
      source(blockField, block.source);
      for (const key of block.factKeys) requireFact(key);
    }
  }
  for (const topic of content.topics.filter((item) => isVisible(item.status, mode))) {
    const field = `topics.${topic.slug}`;
    if (!topic.confirmed) fail(field, 'topic is not confirmed');
    text(`${field}.title`, topic.title);
    text(`${field}.description`, topic.description, false);
    source(field, topic.source);
  }
  const faqIds = new Set<string>();
  for (const item of content.faq.filter((item) => isVisible(item.status, mode))) {
    const field = `faq.${item.id}`;
    if (!/^[a-z][a-z0-9-]*$/u.test(item.id)) fail(field, 'stable FAQ id is required');
    if (faqIds.has(item.id)) fail(field, 'duplicate FAQ id');
    faqIds.add(item.id);
    if (!item.confirmed) fail(field, 'answer is not confirmed');
    text(`${field}.question`, item.question);
    text(`${field}.answer`, item.answer);
    source(field, item.source);
  }
  for (const item of content.education.filter((item) => isVisible(item.status, mode))) {
    const field = `education.${item.id}`;
    if (!item.confirmed) fail(field, 'education is not confirmed');
    text(`${field}.title`, item.title);
    for (const key of ['organization', 'year', 'note'] as const) {
      if (item[key] !== undefined) text(`${field}.${key}`, item[key]);
    }
    source(field, item.source);
  }
  if (mode === 'production') {
    if (!content.topics.some((item) => isVisible(item.status, mode) && item.confirmed)) fail('topics', 'approved topics are required');
    if (!content.faq.some((item) => isVisible(item.status, mode) && item.confirmed)) fail('faq', 'approved answers are required');
  }
  for (const id of content.usedAssetIds) {
    const field = `assets.${id}`;
    const asset = content.assets.find((asset) => asset.id === id);
    if (!asset) { fail(field, 'asset is missing from registry'); continue; }
    if (!asset.path || !/^\/images\/(?:[a-z0-9_-]+\/)*[a-z0-9_-]+\.(?:avif|webp|jpe?g|png)$/iu.test(asset.path)) fail(`${field}.path`, 'local image path under /images/ is required');
    if (!Number.isInteger(asset.width) || !Number.isInteger(asset.height) || (asset.width ?? 0) <= 0 || (asset.height ?? 0) <= 0) fail(field, 'positive image dimensions are required');
    if (mode === 'preview' && !asset.demoSelected && !asset.publicationApproved) fail(`${field}.demoSelected`, 'image has not been selected for demonstration');
    if (mode === 'production' && !asset.publicationApproved) fail(`${field}.publicationApproved`, 'permission for publication is required');
    text(`${field}.alt`, asset.alt);
    text(`${field}.sizes`, asset.sizes);
    source(field, asset.source);
    if (![asset.focalPoint.x, asset.focalPoint.y].every((value) => Number.isFinite(value) && value >= 0 && value <= 100)) fail(`${field}.focalPoint`, 'coordinates must be between 0 and 100');
  }
  return errors;
}

function visibleFacts<T extends { [K in keyof T]: Fact<unknown> }>(facts: T, mode: SiteMode): { [K in keyof T]: T[K]['value'] } {
  const entries = Object.entries(facts) as [string, Fact<unknown>][];
  return Object.fromEntries(entries.map(([key, fact]) => [key, getFactValue(fact, mode)])) as { [K in keyof T]: T[K]['value'] };
}

// Page components consume this projection; raw drafts remain server-side data.
export function getVisibleSiteContent(content: SiteContent, mode: SiteMode, siteUrl: string | null): VisibleSiteContent {
  const errors = validatePublication(content, mode, siteUrl);
  if (errors.length) throw new Error(`Content publication blocked:\n${errors.join('\n')}`);
  return {
    conversation: content.conversation && isVisible(content.conversation.status, mode) ? content.conversation : null,
    specialist: visibleFacts(content.specialist, mode),
    consultations: visibleFacts(content.consultations, mode),
    contacts: visibleFacts(content.contacts, mode),
    pages: content.pages.filter((page) => page.enabled && isVisible(page.metadata.status, mode))
      .map((page) => ({ ...page, blocks: getVisibleBlocks(page.blocks, mode) }))
      .filter((page) => page.blocks.length > 0),
    topics: content.topics.filter((item) => isVisible(item.status, mode) && item.confirmed).sort((a, b) => a.order - b.order),
    faq: content.faq.filter((item) => isVisible(item.status, mode) && item.confirmed),
    education: content.education.filter((item) => isVisible(item.status, mode) && item.confirmed),
    assets: content.assets.filter((asset) => content.usedAssetIds.includes(asset.id)),
  };
}
