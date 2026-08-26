const DEFAULT_WINDOW_MS = 30_000;
const DEFAULT_MAX_REQUESTS = 20;

const hitsByKey = new Map<string, number[]>();

/**
 * Best-effort, single-instance sliding-window limiter. Not distributed — a
 * client can dodge it across cold starts or by hitting a different warm
 * instance. Under Fluid Compute's instance reuse it still meaningfully bounds
 * a scripted loop hammering one server action; for a hard guarantee across
 * instances, put this behind Vercel Firewall or an Upstash-backed limiter.
 */
export function isRateLimited(
  key: string,
  { windowMs = DEFAULT_WINDOW_MS, max = DEFAULT_MAX_REQUESTS } = {}
): boolean {
  const now = Date.now();
  const recentHits = (hitsByKey.get(key) ?? []).filter(
    (timestamp) => now - timestamp < windowMs
  );

  recentHits.push(now);
  hitsByKey.set(key, recentHits);

  return recentHits.length > max;
}
