import { Empty, Pagination, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import styles from '../index.module.css';
export default function AttendanceTable<T extends { id: string }>({
  rows,
  columns,
  summary = false,
  width = 1400,
}: {
  rows: T[];
  columns: ColumnsType<T>;
  summary?: boolean;
  width?: number;
}) {
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const page = Math.min(current, Math.max(1, Math.ceil(rows.length / pageSize)));
  return (
    <>
      <Table<T>
        bordered
        rowKey="id"
        columns={columns}
        dataSource={rows.slice((page - 1) * pageSize, page * pageSize)}
        pagination={false}
        scroll={{ x: width }}
        locale={{ emptyText: <Empty description="无结果" /> }}
      />
      <Pagination
        className={styles.pagination}
        current={page}
        pageSize={pageSize}
        total={rows.length}
        showSizeChanger
        pageSizeOptions={[10, 20, 50, 100]}
        onChange={(p, size) => {
          setCurrent(p);
          setPageSize(size);
        }}
        showTotal={(n, r) =>
          summary
            ? `共 ${n} 条数据`
            : `显示第 ${n ? r[0] : 0} 到 ${n ? r[1] : 0} 条，共 ${n} 条记录`
        }
      />
    </>
  );
}
