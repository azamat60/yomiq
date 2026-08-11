type Pattern = 'tap' | 'select' | 'success' | 'warning';

const PATTERNS: Record<Pattern, number | number[]> = {
  tap: 8,
  select: 12,
  success: [12, 40, 18],
  warning: [24, 60, 24],
};

export function haptic(pattern: Pattern = 'tap'): void {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
  navigator.vibrate(PATTERNS[pattern]);
}
