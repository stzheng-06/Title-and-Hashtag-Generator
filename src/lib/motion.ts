/** Linear interpolation */
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t

/** Fast deceleration — precise, mechanical feel */
export const easeOutQuart = (t: number): number => 1 - (1 - t) ** 4

/** Extreme deceleration — "snaps into place" for larger movements */
export const easeOutExpo = (t: number): number =>
  t === 1 ? 1 : 1 - 2 ** (-10 * t)
