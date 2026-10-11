import { TopicArticle } from '@/components/content/TopicArticle';
import { getPageMetadata } from '@/lib/page-content';

export function generateMetadata() { return getPageMetadata('self-esteem'); }
export default function SelfEsteemPage() { return <TopicArticle id="self-esteem" />; }
