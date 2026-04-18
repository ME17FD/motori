// Reusable across ALL services — strips undefined/null/empty values
// so axios never sends empty query keys to the server
// Accepts any object shape — no index signature required on the caller's type
export const buildCleanParams = <T extends object>(
  params: T,
  defaults?: Partial<T>
): Partial<Record<string, unknown>> =>
  Object.fromEntries(
    Object.entries({ ...defaults, ...params }).filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
  );