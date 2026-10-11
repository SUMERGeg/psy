import type { Asset } from './types';

// Candidates A01–A07 from the project registry, not public image placeholders.
export const assets: Asset[] = ['A01', 'A02', 'A03', 'A04', 'A05', 'A06', 'A07'].map((id) => ({
  id,
  path: id === 'A01' ? '/images/portrait/anna-photo.webp' : null,
  width: id === 'A01' ? 800 : null,
  height: id === 'A01' ? 1200 : null,
  alt: id === 'A01' ? 'Анна Филиппова улыбается, в светлой полосатой рубашке и белых брюках.' : '',
  sizes: id === 'A01' ? '(min-width: 1024px) 374px, (min-width: 768px) 280px, 240px' : '',
  focalPoint: { x: 50, y: id === 'A01' ? 25 : 50 },
  source: id === 'A01' ? 'docs/design/portrait-photo/README.md; user-provided photo, AI-assisted background removal (2026-10-09)' : 'docs/project/psychologist-assets.md#2',
  demoSelected: id === 'A01',
  publicationApproved: false,
}));
