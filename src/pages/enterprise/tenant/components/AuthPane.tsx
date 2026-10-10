import { useEffect, useState } from 'react';
import { Button, ConfigProvider, Pagination, Table, type TableColumnsType } from 'antd';
import { listAuthentications, type AuthRecord } from '@/services/enterprise/tenant';
import type { PageResult } from '@/types/common';
import { PAGE_SIZE_OPTIONS } from '../constants';
import styles from '../auth.module.css';
import base from '../index.module.css';

interface Props {
  page: number;
  pageSize: number;
  /** 新增 / 删除后递增，触发重新取数 */
  version: number;
  onPageChange: (page: number, pageSize: number) => void;
  onAdd: () => void;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

/** 分页每页条数下拉高 30（原型 .tn-page-size） */
const PAGER_THEME = { components: { Select: { controlHeight: 30 } } };

/** 页签二：客户认证概览 + 客户编码列表 */
export default function AuthPane({
  page,
  pageSize,
  version,
  onPageChange,
  onAdd,
  onView,
  onDelete,
}: Props) {
  const [result, setResult] = useState<PageResult<AuthRecord>>({ list: [], total: 0 });

  useEffect(() => {
    let alive = true;
    listAuthentications({ page, pageSize }).then((r) => alive && setResult(r));
    return () => {
      alive = false;
    };
  }, [page, pageSize, version]);

  const columns: TableColumnsType<AuthRecord> = [
    { title: '客户名称', dataIndex: 'customerName', width: '25%', ellipsis: true },
    {
      title: '客户编码',
      dataIndex: 'customerCode',
      width: '15%',
      ellipsis: { showTitle: false },
    },
    {
      title: '客户类别',
      dataIndex: 'customerCategory',
      width: '13%',
      ellipsis: { showTitle: false },
      render: (v: string) => <span className={styles.tag}>{v}</span>,
    },
    { title: '国家/地区', dataIndex: 'country', width: '16%', ellipsis: { showTitle: false } },
    {
      title: '认证时间',
      dataIndex: 'creationDate',
      width: '18%',
      ellipsis: { showTitle: false },
    },
    {
      title: '操作',
      key: 'action',
      width: 130,
      align: 'center',
      render: (_, r) => (
        <>
          {/* 与原型一致：删除为蓝色普通链接 */}
          <button type="button" className={base.link} onClick={() => onView(r.id)}>
            查看
          </button>
          <button type="button" className={base.link} onClick={() => onDelete(r.id)}>
            删除
          </button>
        </>
      ),
    },
  ];

  return (
    <>
      <section className={styles.authOverview}>
        <div className={styles.authCountCard}>
          <div className={styles.authTitle}>客户认证概览</div>
          <div className={styles.authCircle}>
            <div className={styles.authNumber}>{result.total}</div>
            <div className={styles.authCountLabel}>已认证客户数</div>
          </div>
        </div>
        <div className={styles.helpCard}>
          {/* 与原型一致：标题与第一个说明块小标题相同 */}
          <div className={styles.helpTitle}>
            <span className={styles.helpIcon}>!</span>什么是客户认证？
          </div>
          <div className={styles.helpBlock}>
            <strong>什么是客户认证？</strong>
            <div>客户认证用于关联您在三一体系中的客户编码和设备资产。</div>
          </div>
          <div className={styles.helpBlock}>
            <strong>为什么需要客户认证？</strong>
            <ul>
              <li>快速批量绑定：认证后可以批量绑定该客户编号下的所有设备</li>
              <li>自动匹配设备：系统自动识别该客户编号下未绑定的设备</li>
              <li>简化操作流程：无需逐台输入设备编号</li>
            </ul>
          </div>
          <div className={styles.helpBlock}>
            <strong>支持多个客户编号吗？</strong>
            <div>支持。如果您使用多个企业主体向三一采购设备，可以添加多个客户编号进行认证。</div>
          </div>
          <div className={styles.helpBlock}>
            <strong>认证需要多久？</strong>
            <div>认证是即时的。客户编号有效时，提交后立即完成认证，无需等待审核。</div>
          </div>
        </div>
      </section>

      <section className={styles.authList}>
        <div className={styles.authListHead}>
          <h2>客户编码列表</h2>
          <Button type="primary" onClick={onAdd}>
            添加客户认证
          </Button>
        </div>
        <div className={styles.tableWrap}>
          <Table<AuthRecord>
            rowKey="id"
            size="small"
            columns={columns}
            dataSource={result.list}
            pagination={false}
            scroll={{ x: 900, y: 250 }}
            locale={{ emptyText: '无结果' }}
          />
        </div>
        <div className={styles.pagination}>
          <ConfigProvider theme={PAGER_THEME}>
            <Pagination
              current={page}
              pageSize={pageSize}
              // 与原型一致：0 条时仍显示选中的第 1 页
              total={Math.max(result.total, 1)}
              showTotal={() => `${result.total} 条记录`}
              showSizeChanger
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              showLessItems={false}
              itemRender={(_, type, el) => {
                if (type === 'prev') return <button type="button">‹</button>;
                if (type === 'next') return <button type="button">›</button>;
                return el;
              }}
              onChange={(p, size) => onPageChange(size === pageSize ? p : 1, size)}
            />
          </ConfigProvider>
        </div>
      </section>
    </>
  );
}
