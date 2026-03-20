/**
 * Category Service
 * API client for category CRUD operations and queries.
 * Endpoints hit the /api/categories gateway endpoint.
 */

import axiosInstance from '../api/axiosInstance';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../types/category';
import type { PageResponse, PageableParams } from '../types/api';

const BASE = '/api/categories';

/**
 * GET /api/categories - Fetch paginated categories list.
 */
export async function fetchCategories(params: PageableParams = {}): Promise<PageResponse<Category>> {
  const { data } = await axiosInstance.get<PageResponse<Category>>(BASE, { params });
  return data;
}

export async function fetchAllCategories(): Promise<Category[]> {
  const { data } = await axiosInstance.get<Category[]>(`${BASE}/all`);
  return data;
}

export async function fetchCategory(id: number): Promise<Category> {
  const { data } = await axiosInstance.get<Category>(`${BASE}/${id}`);
  return data;
}

export async function createCategory(payload: CreateCategoryRequest): Promise<Category> {
  const { data } = await axiosInstance.post<Category>(BASE, payload);
  return data;
}

export async function updateCategory(id: number, payload: UpdateCategoryRequest): Promise<Category> {
  const { data } = await axiosInstance.put<Category>(`${BASE}/${id}`, payload);
  return data;
}

export async function deleteCategory(id: number): Promise<void> {
  await axiosInstance.delete(`${BASE}/${id}`);
}