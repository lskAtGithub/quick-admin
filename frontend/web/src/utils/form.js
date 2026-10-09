export function calculateResponsiveSpan(itemSpan, defaultSpan, breakpoint) {
  const BREAKPOINT_CONFIG = {
    xs: { threshold: 12, fallback: 24 },
    sm: { threshold: 12, fallback: 12 },
    md: { threshold: 8, fallback: 8 },
    lg: null,
    xl: null,
  };

  const finalSpan = itemSpan ?? defaultSpan;
  const config = BREAKPOINT_CONFIG[breakpoint];
  if (!config) return finalSpan;
  return finalSpan >= config.threshold ? finalSpan : config.fallback;
}
