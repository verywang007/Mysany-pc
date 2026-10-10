import { useMemo, useState, type ReactNode } from 'react';
import { Input, Tree, type TreeDataNode } from 'antd';
import { MoreOutlined, PlusOutlined, RightOutlined, SearchOutlined } from '@ant-design/icons';
import type { OrgNode } from '@/services/enterprise/organization';
import NodeMenu, { type NodeMenuState } from './NodeMenu';
import styles from '../index.module.css';

interface TreeItem extends TreeDataNode {
  key: string;
  org: OrgNode;
  children: TreeItem[];
}

/** 只包第一个命中位置（不区分大小写） */
function highlight(text: string, query: string): ReactNode {
  if (!query) return text;
  const at = text.toLowerCase().indexOf(query.toLowerCase());
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <mark>{text.slice(at, at + query.length)}</mark>
      {text.slice(at + query.length)}
    </>
  );
}

/** 保留：搜索为空 / 自身命中 / 有命中的后代；保留的节点只带命中或含命中的子节点 */
function filterTree(nodes: OrgNode[], query: string): TreeItem[] {
  return nodes.flatMap((n) => {
    const children = filterTree(n.children, query);
    const hit = !query || n.name.toLowerCase().includes(query.toLowerCase()) || children.length;
    return hit ? [{ key: n.id, org: n, children, isLeaf: children.length === 0 }] : [];
  });
}

const allKeys = (items: TreeItem[]): string[] =>
  items.flatMap((i) => [i.key, ...allKeys(i.children)]);

interface Props {
  tree: OrgNode[];
  selectedId: string;
  expanded: Set<string>;
  search: string;
  onSearchChange: (v: string) => void;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  /** 创建子组织（父 = node） */
  onAdd: (node: OrgNode) => void;
  onEdit: (node: OrgNode) => void;
  onDelete: (node: OrgNode) => void;
}

/**
 * 左侧组织树：即时搜索过滤与高亮；根节点「+」创建子组织，非根节点「⋮」弹出节点菜单。
 * 搜索词非空时所有节点强制展开，此时点展开按钮只改展开状态（与原型一致）。
 */
export default function OrgTree(props: Props) {
  const { tree, selectedId, expanded, search, onSearchChange, onToggle, onSelect } = props;
  const [menu, setMenu] = useState<NodeMenuState | null>(null);
  const query = search.trim();
  const items = useMemo(() => filterTree(tree, query), [tree, query]);
  const expandedKeys = query ? allKeys(items) : [...expanded];

  const openMenu = (el: HTMLElement, node: OrgNode) => {
    const r = el.getBoundingClientRect();
    setMenu({ node, anchorRight: r.right, anchorTop: r.top });
  };

  const renderTitle = (item: TreeItem) => {
    const n = item.org;
    return (
      <span className={styles.nodeTitle}>
        <span className={styles.nodeName} title={n.name}>
          {highlight(n.name, query)}
        </span>
        {n.root ? (
          <button
            type="button"
            className={styles.nodeAction}
            title="创建组织"
            aria-label="创建子组织"
            onClick={(e) => {
              e.stopPropagation();
              props.onAdd(n);
            }}
          >
            <PlusOutlined />
          </button>
        ) : (
          <button
            type="button"
            className={styles.nodeAction}
            title="更多操作"
            aria-label="更多操作"
            aria-expanded={menu?.node.id === n.id}
            data-node-menu-trigger
            onClick={(e) => {
              e.stopPropagation();
              openMenu(e.currentTarget, n);
            }}
          >
            <MoreOutlined />
          </button>
        )}
      </span>
    );
  };

  return (
    <aside className={styles.treePanel} aria-label="组织架构">
      <div className={styles.treeHead}>
        <h1>组织架构</h1>
        <Input
          id="org-search"
          className={styles.treeSearch}
          type="search"
          autoComplete="off"
          prefix={<SearchOutlined />}
          placeholder="搜索组织"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className={styles.tree}>
        {items.length ? (
          <Tree<TreeItem>
            blockNode
            motion={{}}
            treeData={items}
            expandedKeys={expandedKeys}
            selectedKeys={[selectedId]}
            switcherIcon={<RightOutlined />}
            titleRender={renderTitle}
            onExpand={(_, info) => onToggle(String(info.node.key))}
            // 重复点击已选中节点也执行选中（重置页签、勾选、页码），antd 此时会给出空 selectedKeys
            onSelect={(_, info) => onSelect(String(info.node.key))}
          />
        ) : (
          <div className={styles.treeEmpty}>
            未找到匹配的组织
            <br />
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                document.getElementById('org-search')?.focus();
              }}
            >
              清除搜索
            </button>
          </div>
        )}
      </div>
      {menu && (
        <NodeMenu
          state={menu}
          onClose={() => setMenu(null)}
          onEdit={props.onEdit}
          onAdd={props.onAdd}
          onDelete={props.onDelete}
        />
      )}
    </aside>
  );
}
