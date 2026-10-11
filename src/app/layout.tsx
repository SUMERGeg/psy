import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getSiteConfig } from '@/lib/site-config';
import { siteContent } from '@/content/site';
import { getVisibleSiteContent } from '@/content/validation';
import { fontVariables } from '@/styles/fonts';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageMotion } from '@/components/layout/PageMotion';
import styles from '@/components/layout/layout.module.css';
import './globals.css';

const site = getSiteConfig();
const content = getVisibleSiteContent(siteContent, site.mode, site.siteUrl);
const home = content.pages.find((page) => page.id === 'home');

export const metadata: Metadata = {
  title: home?.metadata.title,
  description: home?.metadata.description,
  robots: { index: site.mode === 'production', follow: site.mode === 'production' },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className={fontVariables}>
      <body className={styles.site}>
        <a className="skip-link" href="#main-content">Перейти к содержимому</a>
        <Header content={content} />
        <PageMotion />
        <div className={styles.content}>{children}</div>
        <Footer content={content} />
      </body>
    </html>
  );
}
