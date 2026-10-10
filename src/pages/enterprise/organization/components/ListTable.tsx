import { Checkbox, Table, type TableColumnsType } from 'antd';
import styles from '../index.module.css';

interface Props<T extends { id: string }> {
  /** 当前页数据（分页由页面自行切片） */
  rows: T[];
  columns: TableColumnsType<T>;
  selection: Set<string>;
  onSelectionChange: (next: Set<string>) => void;
}

/**
 * 主列表表格（成员 / 设备共用）。勾选规则与原型一致：
 * 勾选跨页保留；表头复选框在当前页全部已选时勾选，无半选态，勾 / 取消只作用于当前页行。
 * antd 默认的表头全选有半选态，因此自定义表头复选框。
 */
export default function ListTable<T extends { id: string }>({
  rows,
  columns,
  selection,
  onSelectionChange,
}: Props<T>) {
  const allChecked = rows.length > 0 && rows.every((r) => selection.has(r.id));

  const toggle = (ids: string[], checked: boolean) => {
    const next = new Set(selection);
    ids.forEach((id) => (checked ? next.add(id) : next.delete(id)));
    onSelectionChange(next);
  };

  return (
    <div className={styles.tableWrap}>
      <Table<T>
        className={styles.table}
        rowKey="id"
        tableLayout="fixed"
        size="small"
        pagination={false}
        dataSource={rows}
        columns={columns}
        locale={{ emptyText: '暂无数据' }}
        rowSelection={{
          columnWidth: 48,
          preserveSelectedRowKeys: true,
          selectedRowKeys: [...selection],
          columnTitle: (
            <Checkbox
              aria-label="全选当前页"
              checked={allChecked}
              onChange={(e) =>
                toggle(
                  rows.map((r) => r.id),
                  e.target.checked,
                )
              }
            />
          ),
          onSelect: (row, checked) => toggle([row.id], checked),
        }}
      />
    </div>
  );
}
