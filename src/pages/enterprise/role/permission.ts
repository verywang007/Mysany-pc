import type { PermissionNode } from '@/services/enterprise/role';

/** 权限树的纯函数（原型 allPermissionIds / descendants / findPerm / filterPerm） */

export function allPermissionIds(nodes: PermissionNode[]): string[] {
  return nodes.flatMap((n) => [n.id, ...allPermissionIds(n.children ?? [])]);
}

export function descendantIds(node: PermissionNode): string[] {
  return allPermissionIds(node.children ?? []);
}

export function findPermission(id: string, nodes: PermissionNode[]): PermissionNode | undefined {
  for (const n of nodes) {
    if (n.id === id) return n;
    const f = findPermission(id, n.children ?? []);
    if (f) return f;
  }
  return undefined;
}

/** 搜索过滤后的节点：node 为原节点（勾选状态按原节点的全部后代计算），children 为保留的子节点 */
export interface VisiblePermission {
  node: PermissionNode;
  children: VisiblePermission[];
}

/**
 * 名称不区分大小写包含关键字、或有后代命中则保留；保留节点只保留命中的子节点。
 * 与原型一致：命中的父节点若子节点都不命中，则显示为叶子。
 */
export function filterPermission(node: PermissionNode, q: string): VisiblePermission | null {
  const children = (node.children ?? [])
    .map((c) => filterPermission(c, q))
    .filter((c): c is VisiblePermission => c !== null);
  return !q || node.name.toLowerCase().includes(q.toLowerCase()) || children.length
    ? { node, children }
    : null;
}

/** 名称高亮：只高亮第一处，返回 [前, 命中, 后]；未命中时命中段为空 */
export function splitHighlight(text: string, q: string): [string, string, string] {
  if (!q) return [text, '', ''];
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return [text, '', ''];
  return [text.slice(0, i), text.slice(i, i + q.length), text.slice(i + q.length)];
}
