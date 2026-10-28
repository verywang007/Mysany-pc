import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Empty, Input, Pagination, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import {
  listKnowledge,
  type CommentTarget,
  type Knowledge,
  type KnowledgeFilters,
  type KnowledgeType,
} from '@/services/training/knowledge';
import type { PageResult } from '@/types/common';
import CategoryNav from './components/CategoryNav';
import DetailDrawer from './components/DetailDrawer';
import KnowledgeCard from './components/KnowledgeCard';
import { KNOWLEDGE_TYPE_OPTIONS, PAGE_SIZE_OPTIONS } from './constants';
import styles from './index.module.css';

/**
 * 培训中心 → 知识库。结构参照测试环境：顶部筛选 + 左侧分类 + 卡片列表，点击卡片打开详情抽屉。
 * 消息中心的评论消息跳转到 ?kid=知识&cid=评论&rid=回复，进入后打开详情并定位到该条评论 / 回复。
 */
export default function KnowledgePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [name, setName] = useState('');
  const [type, setType] = useState<KnowledgeType>();
  const [filters, setFilters] = useState<KnowledgeFilters>({ name: '' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [data, setData] = useState<PageResult<Knowledge>>({ list: [], total: 0 });
  const [detail, setDetail] = useState<{ id: string; target?: CommentTarget }>();

  useEffect(() => {
    listKnowledge({ ...filters, page, pageSize }).then(setData);
  }, [filters, page, pageSize]);

  // 读取跳转参数后立即清掉，再次点击同一条消息也能重新定位
  useEffect(() => {
    const kid = searchParams.get('kid');
    if (!kid) return;
    const cid = searchParams.get('cid');
    setDetail({
      id: kid,
      target: cid
        ? { knowledgeId: kid, commentId: cid, replyId: searchParams.get('rid') ?? undefined }
        : undefined,
    });
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  const closeDetail = useCallback(() => setDetail(undefined), []);

  const apply = (patch: Partial<KnowledgeFilters>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  };

  const reset = () => {
    setName('');
    setType(undefined);
    apply({ name: '', type: undefined });
  };

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <Input
          allowClear
          value={name}
          prefix={<SearchOutlined />}
          placeholder="知识名称"
          className={styles.field}
          onChange={(e) => setName(e.target.value)}
          onPressEnter={() => apply({ name, type })}
        />
        <Select
          allowClear
          value={type}
          placeholder="知识类型"
          options={KNOWLEDGE_TYPE_OPTIONS}
          className={styles.field}
          onChange={setType}
        />
        <span className={styles.spacer} />
        <Button onClick={() => apply({ name, type })}>查 询</Button>
        <Button onClick={reset}>重 置</Button>
      </div>

      <div className={styles.body}>
        <CategoryNav value={filters.categoryId} onChange={(categoryId) => apply({ categoryId })} />

        <section className={styles.content}>
          {data.list.length ? (
            <div className={styles.grid}>
              {data.list.map((k) => (
                <KnowledgeCard key={k.id} data={k} onClick={() => setDetail({ id: k.id })} />
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无数据" />
            </div>
          )}
          <div className={styles.pager}>
            <Pagination
              current={page}
              pageSize={pageSize}
              total={data.total}
              showSizeChanger
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              showTotal={(total) => `共 ${total} 条`}
              onChange={(p, size) => {
                setPage(size === pageSize ? p : 1);
                setPageSize(size);
              }}
            />
          </div>
        </section>
      </div>

      <DetailDrawer knowledgeId={detail?.id} target={detail?.target} onClose={closeDetail} />
    </div>
  );
}
