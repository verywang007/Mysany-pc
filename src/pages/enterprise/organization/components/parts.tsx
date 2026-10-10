import { Button, Input, Pagination } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import styles from '../index.module.css';

/** 角色标签组 */
export function RoleTags({ roles }: { roles: string[] }) {
  return (
    <span className={styles.roleTags}>
      {roles.map((r) => (
        <span key={r} className={styles.roleTag}>
          {r}
        </span>
      ))}
    </span>
  );
}

/** 姓名 + 竖线 + 手机号（信息卡、表单只读块共用） */
export function OwnerInline({ name, phone }: { name: string; phone: string }) {
  return (
    <>
      <span className={styles.ownerName}>{name}</span>
      <span className={styles.ownerDivider} aria-hidden="true" />
      <span>{phone}</span>
    </>
  );
}

/** 「根组织」灰底标签 */
export const RootTag = () => <span className={styles.rootTag}>根组织</span>;

interface SearchBoxProps {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  /** 点「搜索」或按 Enter 时提交 */
  onSearch: () => void;
}

/** 弹窗搜索区（宽 380px）：放大镜 + 输入框 + 「搜索」按钮，点按钮或 Enter 才生效 */
export function SearchBox({ placeholder, value, onChange, onSearch }: SearchBoxProps) {
  return (
    <div className={styles.modalSearch}>
      <Input
        autoFocus
        prefix={<SearchOutlined />}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPressEnter={(e) => {
          e.preventDefault();
          onSearch();
        }}
      />
      <Button type="primary" onClick={onSearch}>
        搜索
      </Button>
    </div>
  );
}

export interface PagerState {
  page: number;
  pageSize: number;
}

interface PagerProps extends PagerState {
  total: number;
  sizes: number[];
  className?: string;
  onChange: (next: PagerState) => void;
}

/**
 * 分页：「N 条记录」‹ 页码 › 每页条数。改每页条数回到第 1 页（与原型一致）。
 * 数据量下页数不超过 7 页，antd 不会出现省略号，与原型「全部页码」一致。
 * 原型无数据时仍显示高亮的第 1 页，antd 在 total 为 0 时不高亮，因此传给 antd 的总数至少为 1。
 */
export function Pager({ page, pageSize, total, sizes, className, onChange }: PagerProps) {
  return (
    <Pagination
      className={className}
      current={page}
      pageSize={pageSize}
      total={Math.max(total, 1)}
      showSizeChanger
      showLessItems={false}
      pageSizeOptions={sizes}
      showTotal={() => `${total} 条记录`}
      itemRender={(_, type, el) => {
        if (type === 'prev') return <button type="button">‹</button>;
        if (type === 'next') return <button type="button">›</button>;
        return el;
      }}
      onChange={(p, size) =>
        onChange(size !== pageSize ? { page: 1, pageSize: size } : { page: p, pageSize })
      }
    />
  );
}
