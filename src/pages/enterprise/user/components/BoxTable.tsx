import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Table, type TableProps } from 'antd';
import styles from './table.module.css';

/** 表头行高（48px 行高 + 1px 下边框） */
const HEAD_H = 49;

interface Props<T> {
  columns: TableProps<T>['columns'];
  dataSource: T[];
  rowKey: TableProps<T>['rowKey'];
  /** 表格最小宽度，超出容器时横向滚动 */
  minWidth: number;
  /** 容器高度；不传时撑满父级 flex 剩余高度（主列表） */
  height?: number;
  /** 空状态；不传时不显示任何文案（原型的选择表无空状态） */
  empty?: ReactNode;
  rowSelection?: TableProps<T>['rowSelection'];
  className?: string;
}

/**
 * 带外框的表格：表头吸顶、容器内横向 + 纵向滚动，单元格单行省略。
 * 对应原型 .um-table（主列表、邀请记录、导入预览、设备分配选择表共用）。
 */
export default function BoxTable<T extends object>({
  columns,
  dataSource,
  rowKey,
  minWidth,
  height,
  empty,
  rowSelection,
  className,
}: Props<T>) {
  const box = useRef<HTMLDivElement>(null);
  const [measured, setMeasured] = useState(0);

  useEffect(() => {
    if (height !== undefined || !box.current) return;
    const el = box.current;
    const ro = new ResizeObserver(() => setMeasured(el.clientHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [height]);

  const boxH = height ?? measured;
  return (
    <div
      ref={box}
      className={`${styles.box} ${className ?? ''}`}
      style={height !== undefined ? { height } : undefined}
    >
      <Table<T>
        className={styles.table}
        columns={columns}
        dataSource={dataSource}
        rowKey={rowKey}
        rowSelection={rowSelection}
        pagination={false}
        tableLayout="fixed"
        scroll={{ x: minWidth, y: Math.max(boxH - HEAD_H - 2, 0) }}
        locale={{ emptyText: empty ? <div className={styles.empty}>{empty}</div> : <span /> }}
      />
    </div>
  );
}
