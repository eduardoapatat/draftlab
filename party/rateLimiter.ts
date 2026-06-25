interface Bucket {
  count: number;
  windowStart: number;
}

export class RateLimiter {
  private buckets = new Map<string, Bucket>();

  constructor(
    private readonly maxPerWindow: number,
    private readonly windowMs: number
  ) {}

  allow(id: string): boolean {
    const now = Date.now();
    const bucket = this.buckets.get(id);

    if (!bucket || now - bucket.windowStart >= this.windowMs) {
      this.buckets.set(id, { count: 1, windowStart: now });
      return true;
    }

    if (bucket.count >= this.maxPerWindow) return false;

    bucket.count += 1;
    return true;
  }

  forget(id: string): void {
    this.buckets.delete(id);
  }
}
