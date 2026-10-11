import styles from './media.module.css';

// Static light and shadow, separate from the portrait; no image or motion layer.
export function WindowLight() {
  return <svg className={styles.windowLight} aria-hidden="true" focusable="false" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice">
    <defs>
      <filter id="window-soft"><feGaussianBlur stdDeviation="5" /></filter>
      <filter id="foliage-soft"><feGaussianBlur stdDeviation="11" /></filter>
      <linearGradient id="light-fade" x1="0" x2="1"><stop stopColor="white" stopOpacity="0" /><stop offset="0.42" stopColor="white" stopOpacity="0.4" /><stop offset="1" stopColor="white" /></linearGradient>
      <mask id="window-mask"><rect width="1200" height="700" fill="url(#light-fade)" /></mask>
    </defs>
    <g mask="url(#window-mask)">
      <g fill="#685d50" opacity="0.14" filter="url(#window-soft)" transform="translate(640 -180) skewY(-28)">
        <rect x="0" y="0" width="22" height="1100" /><rect x="320" y="0" width="18" height="1100" /><rect x="620" y="0" width="18" height="1100" />
        <rect x="0" y="240" width="900" height="18" /><rect x="0" y="550" width="900" height="18" />
      </g>
      <g fill="#5d5548" opacity="0.22" filter="url(#foliage-soft)" transform="translate(1100 115) rotate(24)">
        <path d="M35 -150C-20 10 70 160 10 430L27 435C77 205 5 60 50-150Z" />
        <ellipse cx="-35" cy="20" rx="22" ry="64" transform="rotate(-40 -35 20)" /><ellipse cx="84" cy="52" rx="25" ry="71" transform="rotate(48 84 52)" />
        <ellipse cx="-25" cy="132" rx="25" ry="74" transform="rotate(-48 -25 132)" /><ellipse cx="96" cy="178" rx="22" ry="69" transform="rotate(46 96 178)" />
        <ellipse cx="-12" cy="259" rx="21" ry="64" transform="rotate(-44 -12 259)" /><ellipse cx="76" cy="320" rx="24" ry="74" transform="rotate(43 76 320)" />
      </g>
    </g>
  </svg>;
}
