/**
 * Merges optional defaults with `params` and drops `undefined`, `null`, and empty strings
 * so axios query strings stay clean for Spring-style APIs.
 *
 * @param params - Caller-provided query fields
 * @param defaults - Baseline values merged under `params` (e.g. pagination defaults)
 */
export const buildCleanParams = <T extends object>(
  params: T,
  defaults?: Partial<T>
): Partial<Record<string, unknown>> =>
  Object.fromEntries(
    Object.entries({ ...defaults, ...params }).filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
  );