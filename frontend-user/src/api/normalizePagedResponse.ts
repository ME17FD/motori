import type { PageMetadata, PagedModel } from "../types/common.types";

/**
 * Normalizes Spring `Page<T>` JSON (root-level `totalPages`, `number`, `size`, …)
 * into the app's `PagedModel<T>` shape (`page` metadata + `content`).
 */
export function normalizePagedResponse<T>(raw: unknown): PagedModel<T> {
  if (raw === null || typeof raw !== "object") {
    return {
      content: [],
      page: { size: 0, number: 0, totalElements: 0, totalPages: 0 },
    };
  }

  const r = raw as Record<string, unknown>;
  const content = Array.isArray(r.content) ? (r.content as T[]) : [];

  const nestedPage = r.page as PageMetadata | undefined;

  const totalPages =
    typeof r.totalPages === "number"
      ? r.totalPages
      : typeof nestedPage?.totalPages === "number"
        ? nestedPage.totalPages
        : 0;

  const totalElements =
    typeof r.totalElements === "number"
      ? r.totalElements
      : typeof nestedPage?.totalElements === "number"
        ? nestedPage.totalElements
        : content.length;

  const size =
    typeof r.size === "number" ? r.size : typeof nestedPage?.size === "number" ? nestedPage.size : 20;

  const number =
    typeof r.number === "number"
      ? r.number
      : typeof nestedPage?.number === "number"
        ? nestedPage.number
        : 0;

  return {
    content,
    page: { size, number, totalElements, totalPages },
  };
}
