import type {
  Article,
  ArticleListResponse,
  ArticleQueryParams,
} from "../types/article";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
const ARTICLES_ENDPOINT = `${BASE_URL}/api/articles`;

const buildQueryString = (params: ArticleQueryParams): string => {
  const query = new URLSearchParams();
  (Object.entries(params) as Array<[string, string | number | undefined]>)
    .forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        query.set(key, String(value));
      }
    });
  return query.toString();
};

export const fetchArticles = async (
  params: ArticleQueryParams
): Promise<ArticleListResponse> => {
  const response = await fetch(`${ARTICLES_ENDPOINT}?${buildQueryString(params)}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch articles: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<ArticleListResponse>;
};

export const fetchArticleById = async (id: string): Promise<Article> => {
  const response = await fetch(`${ARTICLES_ENDPOINT}/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch article ${id}: ${response.status}`);
  }
  return response.json() as Promise<Article>;
};

export const fetchArticlesByCategory = async (
  category: string
): Promise<Article[]> => {
  const response = await fetch(
    `${ARTICLES_ENDPOINT}?category=${encodeURIComponent(category)}&pageSize=100`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch category ${category}: ${response.status}`);
  }
  const result = await (response.json() as Promise<ArticleListResponse>);
  return result.data;
};