import { TopicArticle } from '@/components/content/TopicArticle';
import { getPageMetadata } from '@/lib/page-content';

export function generateMetadata() { return getPageMetadata('relationships'); }
export default function RelationshipsPage() { return <TopicArticle id="relationships" />; }
