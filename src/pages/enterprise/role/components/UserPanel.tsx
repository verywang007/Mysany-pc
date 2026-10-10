import { useEffect, useMemo, useState } from 'react';
import { Input, Select, Table } from 'antd';
import {
  listRoleUsers,
  type Role,
  type RoleUser,
  type RoleUserFilters,
} from '@/services/enterprise/role';
import { getUserColumns } from '../columns';
import { USER_DUTY_OPTIONS, USER_ORG_OPTIONS } from '../constants';
import styles from '../index.module.css';
import d from './RoleDetail.module.css';

interface Props {
  role: Role;
  filters: RoleUserFilters;
  onFiltersChange: (f: RoleUserFilters) => void;
  onRemove: (u: RoleUser) => void;
}

const toOptions = (list: string[]) => list.map((v) => ({ value: v, label: v }));

/**
 * 用户分配页签：实时筛选（AND），只能移除，没有添加用户入口（与原型一致）。
 * 底部分页与原型一致为静态展示（记录数 + 固定页码 1 + 只有「10 条/页」），不实际分页。
 */
export default function UserPanel({ role, filters, onFiltersChange, onRemove }: Props) {
  const [users, setUsers] = useState<RoleUser[]>([]);

  useEffect(() => {
    let alive = true;
    void listRoleUsers(role.id, filters).then((list) => alive && setUsers(list));
    return () => {
      alive = false;
    };
  }, [role, filters]);

  const columns = useMemo(() => getUserColumns(onRemove), [onRemove]);
  const set = (patch: Partial<RoleUserFilters>) => onFiltersChange({ ...filters, ...patch });

  return (
    <>
      <div className={d.tools}>
        <Input
          className={styles.input}
          placeholder="请输入用户姓名"
          value={filters.query}
          onChange={(e) => set({ query: e.target.value })}
        />
        <Select
          className={styles.select}
          placeholder="选择组织"
          allowClear
          value={filters.org || undefined}
          options={toOptions(USER_ORG_OPTIONS)}
          onChange={(v?: string) => set({ org: v ?? '' })}
        />
        <Select
          className={styles.select}
          placeholder="请选择业务职责"
          allowClear
          value={filters.duty || undefined}
          options={toOptions(USER_DUTY_OPTIONS)}
          onChange={(v?: string) => set({ duty: v ?? '' })}
        />
      </div>
      <div className={`${styles.tableWrap} ${styles.userTableWrap}`}>
        <Table<RoleUser>
          className={styles.table}
          rowKey="id"
          tableLayout="fixed"
          columns={columns}
          dataSource={users}
          pagination={false}
          scroll={{ x: 900, y: 'max(210px, calc(100vh - 515px))' }}
          locale={{ emptyText: <div className={styles.empty}>无结果</div> }}
        />
      </div>
      <div className={styles.pagination}>
        <span>{users.length} 条记录</span>
        <button type="button" className={`${styles.pageBtn} ${styles.pageActive}`}>
          1
        </button>
        <Select
          className={styles.sizeSelect}
          value={10}
          options={[{ value: 10, label: '10 条/页' }]}
        />
      </div>
    </>
  );
}
