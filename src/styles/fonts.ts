import localFont from 'next/font/local';

// Separate families let the browser select Cyrillic and Latin glyphs.
const displayCyrillic = localFont({
  src: '../../public/fonts/cormorant-garamond-cyrillic.woff2',
  weight: '400 500', display: 'swap', variable: '--font-display-cyrillic',
  adjustFontFallback: false,
});
const displayLatin = localFont({
  src: '../../public/fonts/cormorant-garamond-latin.woff2',
  weight: '400 500', display: 'swap', variable: '--font-display-latin',
  adjustFontFallback: false,
});
const italicCyrillic = localFont({
  src: '../../public/fonts/cormorant-garamond-italic-cyrillic.woff2',
  weight: '400 500', style: 'italic', display: 'swap', variable: '--font-italic-cyrillic',
  adjustFontFallback: false,
});
const italicLatin = localFont({
  src: '../../public/fonts/cormorant-garamond-italic-latin.woff2',
  weight: '400 500', style: 'italic', display: 'swap', variable: '--font-italic-latin',
  adjustFontFallback: false,
});
const uiCyrillic = localFont({
  src: '../../public/fonts/manrope-cyrillic.woff2',
  weight: '400 600', display: 'swap', variable: '--font-ui-cyrillic',
  adjustFontFallback: false,
});
const uiLatin = localFont({
  src: '../../public/fonts/manrope-latin.woff2',
  weight: '400 600', display: 'swap', variable: '--font-ui-latin',
  adjustFontFallback: false,
});

export const fontVariables = [displayCyrillic.variable, displayLatin.variable, italicCyrillic.variable, italicLatin.variable, uiCyrillic.variable, uiLatin.variable].join(' ');
