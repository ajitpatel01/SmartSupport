/** True when the UI runs against in-memory demo data (no API required). */
export function isDemoMode(): boolean {
  return (
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_DEMO_MODE === "true"
  );
}

export function demoDelay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
