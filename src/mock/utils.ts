import dayjs, { type Dayjs } from 'dayjs';
import type { PageQuery, PageResult } from '@/types/common';

/** 模拟网络延迟 */
export const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

export function paginate<T>(rows: T[], { page, pageSize }: PageQuery): PageResult<T> {
  const start = (page - 1) * pageSize;
  return { list: rows.slice(start, start + pageSize), total: rows.length };
}

/** 文本模糊匹配：条件为空视为命中；忽略大小写和首尾空格 */
export const fuzzy = (value: unknown, keyword: unknown) => {
  const kw = String(keyword ?? '')
    .trim()
    .toLowerCase();
  if (!kw) return true;
  return String(value ?? '')
    .toLowerCase()
    .includes(kw);
};

/** 精确匹配：条件为空视为命中 */
export const exact = (value: unknown, cond: unknown) =>
  cond === undefined || cond === null || cond === '' || value === cond;

/**
 * 日期区间匹配（含两端）：条件为 RangePicker 的 [Dayjs, Dayjs]。
 * unit 为 'day' 时按自然日比较。
 */
export const inRange = (
  value: string | undefined,
  range: unknown,
  unit: 'day' | 'second' = 'day',
) => {
  const r = range as [Dayjs | null, Dayjs | null] | undefined | null;
  if (!r || (!r[0] && !r[1])) return true;
  if (!value) return false;
  const v = dayjs(value);
  if (r[0] && v.isBefore(r[0], unit)) return false;
  if (r[1] && v.isAfter(r[1], unit)) return false;
  return true;
};

/**
 * 用较小的真实样本扩展出更大的列表，便于演示分页；
 * 第 n 份副本会经过 mutate 处理（例如改编号）。
 */
export function expand<T>(
  seed: T[],
  total: number,
  mutate: (row: T, n: number, i: number) => T,
): T[] {
  const out: T[] = [];
  for (let i = 0; out.length < total; i++) {
    const n = Math.floor(i / seed.length);
    const row = seed[i % seed.length];
    out.push(n === 0 ? row : mutate(row, n, i));
  }
  return out;
}
