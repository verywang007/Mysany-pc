import type { PagerState } from './components/parts';

/** 按页切片 */
export const slicePage = <T>(rows: T[], { page, pageSize }: PagerState) =>
  rows.slice((page - 1) * pageSize, page * pageSize);

/**
 * 修正原型缺陷：删除 / 移除后原型页码不回收，会停在空页；这里把页码限制在有效范围内。
 */
export const clampPage = (total: number, { page, pageSize }: PagerState): PagerState => ({
  page: Math.min(page, Math.max(1, Math.ceil(total / pageSize))),
  pageSize,
});
