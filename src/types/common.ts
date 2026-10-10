export interface PageQuery {
  page: number;
  pageSize: number;
}

export interface PageResult<T> {
  list: T[];
  total: number;
}

/** 列表查询函数签名：查询条件 + 分页 → 分页结果 */
export type ListFetcher<T, Q = Record<string, unknown>> = (
  query: Q & PageQuery,
) => Promise<PageResult<T>>;
