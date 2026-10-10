import { Button, Dropdown, Input, Select } from 'antd';
import { getOrganizations, getRoles, type UserQuery } from '@/services/enterprise/user';
import { SCOPE_NAMES } from '../constants';
import styles from '../index.module.css';

export type ToolbarAction = 'add' | 'invite' | 'import' | 'assign' | 'importAssign' | 'records';

interface Props {
  filters: UserQuery;
  onFilter: (patch: Partial<UserQuery>) => void;
  onAction: (action: ToolbarAction) => void;
}

/** 下拉的「空值」作为第一个选项（与原型原生 select 一致，选中后显示该文案） */
const withEmpty = (empty: string, list: { value: string; label: string }[]) => [
  { value: '', label: empty },
  ...list,
];
const toOptions = (list: string[]) => list.map((v) => ({ value: v, label: v }));

const SCOPE_OPTIONS = withEmpty(
  '设备类型',
  Object.entries(SCOPE_NAMES).map(([value, label]) => ({ value, label })),
);

/**
 * 查询区 + 工具栏：无「查询 / 重置」按钮，条件实时生效（页面侧把页码重置为 1）。
 * 注意「设备类型」的空选项文案是「设备类型」，「全部设备」是具体值（原型如此）。
 */
export default function Toolbar({ filters, onFilter, onAction }: Props) {
  return (
    <div className={styles.filter}>
      <div className={styles.filterLeft}>
        <Input
          className={styles.query}
          placeholder="搜索姓名、手机号、邮箱"
          value={filters.query}
          onChange={(e) => onFilter({ query: e.target.value })}
        />
        <Select
          className={styles.select}
          value={filters.org}
          options={withEmpty('选择组织', toOptions(getOrganizations()))}
          onChange={(org) => onFilter({ org })}
        />
        <Select
          className={styles.select}
          value={filters.role}
          options={withEmpty('全部角色', toOptions(getRoles()))}
          onChange={(role) => onFilter({ role })}
        />
        <Select
          className={styles.select}
          value={filters.scope}
          options={SCOPE_OPTIONS}
          onChange={(scope) => onFilter({ scope: scope as UserQuery['scope'] })}
        />
      </div>
      <div className={styles.filterActions}>
        <Dropdown.Button
          type="primary"
          className={styles.split}
          icon={<span className={styles.splitArrow}>⌄</span>}
          placement="bottomRight"
          overlayClassName={styles.actionMenu}
          menu={{
            items: [{ key: 'invite', label: '邀请用户' }],
            onClick: () => onAction('invite'),
          }}
          trigger={['click']}
          onClick={() => onAction('add')}
        >
          新增用户
        </Dropdown.Button>
        <Button onClick={() => onAction('import')}>导入用户</Button>
        <Button onClick={() => onAction('assign')}>设备分配</Button>
        <Button onClick={() => onAction('importAssign')}>导入分配</Button>
        <Button onClick={() => onAction('records')}>邀请记录</Button>
      </div>
    </div>
  );
}
