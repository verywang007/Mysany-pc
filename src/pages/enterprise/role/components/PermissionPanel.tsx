import { useMemo, type ReactNode } from 'react';
import { Button, Input, Tree, type TreeDataNode } from 'antd';
import { getPermissionTree } from '@/services/enterprise/role';
import { PERMISSION_WARNING, ROOT_KEY } from '../constants';
import {
  allPermissionIds,
  descendantIds,
  filterPermission,
  findPermission,
  splitHighlight,
  type VisiblePermission,
} from '../permission';
import styles from '../index.module.css';
import d from './RoleDetail.module.css';

const TREE = getPermissionTree();
const ALL_IDS = allPermissionIds(TREE);

interface Props {
  draft: Set<string>;
  onDraftChange: (next: Set<string>) => void;
  expanded: Set<string>;
  onExpandedChange: (next: Set<string>) => void;
  /** 原始（未 trim）搜索词：非空时全部展开、用于高亮；过滤用 trim 后的词 */
  search: string;
  onSearchChange: (v: string) => void;
}

/**
 * 功能权限页签。勾选规则以原型为准，用 checkStrictly 自行控制：
 * - 勾选 / 取消节点：自身 + 全部后代统一加入 / 移除，不向上联动父节点；
 * - 节点全选 = 自身与全部后代都在草稿中，半选 = 未全选但至少一个在草稿中；
 * - 根「应用功能」仅在全部 60 个都选中时勾选，没有半选态，其展开箭头是装饰性的。
 */
export default function PermissionPanel(p: Props) {
  const { draft, expanded, search } = p;

  const { treeData, checked, halfChecked } = useMemo(() => {
    const q = search.trim();
    const visible = TREE.map((n) => filterPermission(n, q)).filter(
      (n): n is VisiblePermission => n !== null,
    );
    const checkedKeys: string[] = [];
    const halfKeys: string[] = [];
    const label = (text: string): ReactNode => {
      const [a, m, b] = splitHighlight(text, search);
      return m ? (
        <>
          {a}
          <mark>{m}</mark>
          {b}
        </>
      ) : (
        text
      );
    };
    const toNode = (v: VisiblePermission): TreeDataNode => {
      const ids = [v.node.id, ...descendantIds(v.node)];
      const all = ids.every((id) => draft.has(id));
      if (all) checkedKeys.push(v.node.id);
      else if (ids.some((id) => draft.has(id))) halfKeys.push(v.node.id);
      return {
        key: v.node.id,
        title: <span className={d.permName}>{label(v.node.name)}</span>,
        children: v.children.map(toNode),
        isLeaf: v.children.length === 0,
      };
    };
    const children = visible.map(toNode);
    if (draft.size === ALL_IDS.length) checkedKeys.push(ROOT_KEY);
    const root: TreeDataNode = {
      key: ROOT_KEY,
      title: <strong>应用功能 ({TREE.length})</strong>,
      children,
    };
    return { treeData: [root], checked: checkedKeys, halfChecked: halfKeys };
  }, [draft, search]);

  // 搜索词（未 trim）非空时全部展开；根节点始终展开
  const expandedKeys = search ? [ROOT_KEY, ...ALL_IDS] : [ROOT_KEY, ...expanded];

  const toggleCheck = (key: string, on: boolean) => {
    if (key === ROOT_KEY) {
      p.onDraftChange(on ? new Set(ALL_IDS) : new Set());
      return;
    }
    const node = findPermission(key, TREE);
    if (!node) return;
    const next = new Set(draft);
    [key, ...descendantIds(node)].forEach((id) => (on ? next.add(id) : next.delete(id)));
    p.onDraftChange(next);
  };

  const toggleExpand = (key: string) => {
    // 根节点的箭头是装饰性的；搜索时仍记录展开状态，但界面保持全部展开（与原型一致）
    if (key === ROOT_KEY) return;
    const next = new Set(expanded);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    p.onExpandedChange(next);
  };

  return (
    <>
      <div className={d.permWarning}>{PERMISSION_WARNING}</div>
      <div className={d.tools}>
        <Input
          className={styles.input}
          placeholder="搜索权限"
          value={search}
          onChange={(e) => p.onSearchChange(e.target.value)}
        />
        <Button className={styles.btn} onClick={() => p.onExpandedChange(new Set(ALL_IDS))}>
          展开全部
        </Button>
        <Button className={styles.btn} onClick={() => p.onExpandedChange(new Set())}>
          折叠全部
        </Button>
        <Button
          className={styles.btn}
          onClick={() =>
            p.onDraftChange(draft.size === ALL_IDS.length ? new Set() : new Set(ALL_IDS))
          }
        >
          全选/全不选
        </Button>
      </div>
      <div className={d.permTree}>
        <Tree
          checkable
          checkStrictly
          // 点名称不勾选（原型中名称不是 label）：可选但选中项恒为空
          selectedKeys={[]}
          blockNode
          virtual={false}
          motion={false}
          treeData={treeData}
          checkedKeys={{ checked, halfChecked }}
          expandedKeys={expandedKeys}
          switcherIcon={({ expanded: open }) => (
            <span className={open ? `${d.permToggle} ${d.open}` : d.permToggle}>›</span>
          )}
          onCheck={(_, info) => toggleCheck(String(info.node.key), info.checked)}
          onExpand={(_, info) => toggleExpand(String(info.node.key))}
        />
      </div>
    </>
  );
}
