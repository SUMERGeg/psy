export type ContentStatus = 'DRAFT' | 'DEMO' | 'APPROVED';
export type SiteMode = 'preview' | 'production';
export type PageId = 'home' | 'about' | 'topics' | 'sessions' | 'faq' | 'relationships' | 'self-esteem' | 'notes';
export type PagePath = '/' | '/about' | '/topics' | '/sessions' | '/faq' | '/topics/relationships' | '/topics/self-esteem' | '/notes';

// Confirmation concerns the fact; status concerns permission to use the wording.
export type Fact<T> = {
  value: T | null;
  confirmed: boolean;
  source: string;
  demo?: { value: T; source: string };
};
export type ContentBlock = {
  id: string;
  status: ContentStatus;
  required: boolean;
  title: string;
  body: string[];
  source: string;
  factKeys: string[];
};
export type PageContent = {
  id: PageId;
  path: PagePath;
  enabled: boolean;
  metadata: {
    status: ContentStatus;
    title: string;
    description: string;
    source: string;
  };
  blocks: ContentBlock[];
};
export type Contacts = {
  bookingUrl: Fact<string>;
  instagramUrl: Fact<string>;
  email: Fact<string>;
};
export type Topic = {
  slug: string;
  title: string;
  description: string;
  order: number;
  status: ContentStatus;
  confirmed: boolean;
  source: string;
};
export type FAQItem = {
  id: string;
  question: string;
  answer: string;
  group: 'before' | 'process' | 'organization' | 'boundaries';
  status: ContentStatus;
  confirmed: boolean;
  source: string;
};
export type EducationItem = {
  id: string;
  title: string;
  organization?: string;
  year?: string;
  note?: string;
  status: ContentStatus;
  confirmed: boolean;
  source: string;
};
export type Asset = {
  id: string;
  path: string | null;
  width: number | null;
  height: number | null;
  alt: string;
  sizes: string;
  focalPoint: { x: number; y: number };
  source: string;
  demoSelected: boolean;
  publicationApproved: boolean;
};
export type Specialist = {
  name: Fact<string>;
  role: Fact<string>;
  practiceExperience: Fact<string>;
  supervision: Fact<string>;
  method: Fact<string>;
  audience: Fact<string>;
  boundaries: Fact<string>;
  city: Fact<string>;
};
export type ConsultationFacts = {
  format: Fact<string>;
  durationMinutes: Fact<number>;
  price: Fact<{ amount: number; currency: string }>;
  frequency: Fact<string>;
  cancellationPolicy: Fact<string>;
};
export type ConversationContent = {
  status: ContentStatus;
  source: string;
  title: string;
  introduction: string;
  privacy: string;
  attribution: string;
  closing: string;
  directions: { id: string; title: string; hint: string; opening: string }[];
  thoughts: { id: string; title: string; prefix: string; fragment: string }[];
};
export type SiteContent = {
  conversation?: ConversationContent;
  specialist: Specialist;
  consultations: ConsultationFacts;
  contacts: Contacts;
  pages: PageContent[];
  topics: Topic[];
  faq: FAQItem[];
  education: EducationItem[];
  assets: Asset[];
  usedAssetIds: string[];
};
export type VisibleSiteContent = {
  conversation: ConversationContent | null;
  specialist: { [K in keyof Specialist]: Specialist[K]['value'] };
  consultations: { [K in keyof ConsultationFacts]: ConsultationFacts[K]['value'] };
  contacts: { [K in keyof Contacts]: string | null };
  pages: PageContent[];
  topics: Topic[];
  faq: FAQItem[];
  education: EducationItem[];
  assets: Asset[];
};
