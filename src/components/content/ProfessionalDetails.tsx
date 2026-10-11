import type { EducationItem, Specialist } from '@/content/types';
import { getProfessionalRows } from '@/content/presentation';
import styles from '@/components/layout/interior.module.css';

export function ProfessionalDetails({ specialist, education }: { specialist: Specialist; education: EducationItem[] }) {
  const rows = getProfessionalRows(specialist);
  const confirmedEducation = education.filter(item => item.confirmed);
  if (!rows.length && !confirmedEducation.length) return null;
  return <section className={styles.topicSection} aria-labelledby="professional-heading">
    <h2 id="professional-heading">Практика и обучение</h2>
    {rows.length > 0 && <dl className={styles.facts}>{rows.map(row => <div className={styles.fact} key={row.id}>
      <dt>{row.label}</dt><dd>{row.value}</dd>
    </div>)}</dl>}
    {confirmedEducation.length > 0 && <ul className={styles.education}>{confirmedEducation.map(item => <li key={item.id}>
      <h3>{item.title}</h3>{item.organization && <p>{item.organization}</p>}{item.year && <p>{item.year}</p>}{item.note && <p>{item.note}</p>}
    </li>)}</ul>}
  </section>;
}
