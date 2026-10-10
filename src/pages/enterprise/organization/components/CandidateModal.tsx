import { useState } from 'react';
import { Button, Table, type TableColumnsType } from 'antd';
import { MODAL_PAGE_SIZES } from '../constants';
import OrgModal from './OrgModal';
import { slicePage } from '../pager';
import { Pager, SearchBox, type PagerState } from './parts';
import styles from '../index.module.css';

interface Props<T extends { id: string }> {
  title: string;
  width: number;
  placeholder: string;
  /** 全部候选 */
  candidates: T[];
  /** 搜索匹配用的文本（小写子串匹配） */
  searchText: (row: T) => string;
  columns: TableColumnsType<T>;
  onCancel: () => void;
  onOk: (ids: string[]) => void;
}

/**
 * 「添加组织成员」「分配设备（子组织）」共用的候选弹窗：
 * 点「搜索」或 Enter 才生效（trim、页码回 1）；勾选跨搜索、跨分页保留；无表头全选；
 * 分页仅 10 / 20 条每页，切换回第 1 页；无勾选时「确定」禁用。
 */
export default function CandidateModal<T extends { id: string }>(props: Props<T>) {
  const { candidates, searchText } = props;
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [pager, setPager] = useState<PagerState>({ page: 1, pageSize: 10 });
  const [selection, setSelection] = useState<Set<string>>(() => new Set());

  const q = search.toLowerCase();
  const list = candidates.filter((r) => !q || searchText(r).toLowerCase().includes(q));

  const submitSearch = () => {
    setSearch(input.trim());
    setPager((p) => ({ ...p, page: 1 }));
  };

  return (
    <OrgModal
      title={props.title}
      width={props.width}
      onCancel={props.onCancel}
      footer={
        <>
          <Button onClick={props.onCancel}>取消</Button>
          <Button
            type="primary"
            disabled={!selection.size}
            onClick={() => props.onOk([...selection])}
          >
            确定
          </Button>
        </>
      }
    >
      <SearchBox
        placeholder={props.placeholder}
        value={input}
        onChange={setInput}
        onSearch={submitSearch}
      />
      <div className={styles.modalTableWrap}>
        <Table<T>
          className={styles.modalTable}
          rowKey="id"
          tableLayout="fixed"
          size="small"
          pagination={false}
          dataSource={slicePage(list, pager)}
          columns={props.columns}
          locale={{ emptyText: <div className={styles.noResult}>无结果</div> }}
          rowSelection={{
            columnWidth: 48,
            hideSelectAll: true,
            preserveSelectedRowKeys: true,
            selectedRowKeys: [...selection],
            onSelect: (row, checked) => {
              const next = new Set(selection);
              if (checked) next.add(row.id);
              else next.delete(row.id);
              setSelection(next);
            },
          }}
        />
      </div>
      <Pager
        className={styles.modalPages}
        {...pager}
        total={list.length}
        sizes={MODAL_PAGE_SIZES}
        onChange={setPager}
      />
    </OrgModal>
  );
}
