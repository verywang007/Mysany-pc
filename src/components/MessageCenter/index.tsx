import { useEffect, useMemo, useState } from 'react';
import { Button, Checkbox, DatePicker, Empty, Modal } from 'antd';
import type { Dayjs } from 'dayjs';
import Icon from '@/components/Icon';
import {
  formatMessageTime,
  MESSAGE_TYPES,
  type Message,
  type MessageType,
} from '@/services/common/messages';
import styles from './index.module.css';

/** 左侧分类：全部消息 + 各消息类型 */
export type MessageTab = 'all' | MessageType;

interface Props {
  open: boolean;
  /** 打开时定位的分类 */
  tab: MessageTab;
  messages: Message[];
  onRead: (ids: string[]) => void;
  /** 点击评论消息：跳转到知识库对应评论 */
  onOpenComment: (m: Message) => void;
  onClose: () => void;
}

type Range = [Dayjs | null, Dayjs | null] | null;

/**
 * 消息中心（顶栏消息下拉 →「查看更多」或点击分类）。
 * - 左侧为分类及未读数；右侧按日期区间、只看未读筛选；
 * - 点击消息标为已读；评论消息同时跳转到知识库对应评论；「全部已读」作用于当前分类。
 */
export default function MessageCenter({
  open,
  tab: initialTab,
  messages,
  onRead,
  onOpenComment,
  onClose,
}: Props) {
  const [tab, setTab] = useState<MessageTab>(initialTab);
  const [range, setRange] = useState<Range>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);

  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  const unread = (type: MessageTab) =>
    messages.filter((m) => !m.read && (type === 'all' || m.type === type)).length;

  const inTab = useMemo(
    () => messages.filter((m) => tab === 'all' || m.type === tab),
    [messages, tab],
  );

  const list = useMemo(() => {
    const [from, to] = range ?? [null, null];
    return inTab.filter((m) => {
      if (unreadOnly && m.read) return false;
      if (from && m.time.slice(0, 10) < from.format('YYYY-MM-DD')) return false;
      if (to && m.time.slice(0, 10) > to.format('YYYY-MM-DD')) return false;
      return true;
    });
  }, [inTab, range, unreadOnly]);

  const tabs: { key: MessageTab; label: string; icon?: string }[] = [
    { key: 'all', label: '全部消息' },
    ...MESSAGE_TYPES,
  ];

  return (
    <Modal
      open={open}
      width={900}
      centered
      title="消息中心"
      footer={null}
      className={styles.modal}
      onCancel={onClose}
    >
      <div className={styles.body}>
        <nav className={styles.side}>
          {tabs.map((t) => {
            const n = unread(t.key);
            return (
              <div
                key={t.key}
                className={t.key === tab ? `${styles.tab} ${styles.tabOn}` : styles.tab}
                onClick={() => setTab(t.key)}
              >
                {t.icon && (
                  <span className={styles.tabIcon}>
                    <Icon name={t.icon} size={18} />
                  </span>
                )}
                <span className={styles.tabLabel}>{t.label}</span>
                {n > 0 && <em className={styles.count}>{n > 99 ? '99+' : n}</em>}
              </div>
            );
          })}
        </nav>

        <section className={styles.main}>
          <div className={styles.toolbar}>
            <DatePicker.RangePicker
              value={range}
              onChange={(v) => setRange(v)}
              placeholder={['开始日期', '结束日期']}
              allowEmpty={[true, true]}
              className={styles.range}
            />
            <Button
              onClick={() => {
                setRange(null);
                setUnreadOnly(false);
              }}
            >
              重 置
            </Button>
            <span className={styles.spacer} />
            <Checkbox checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)}>
              只看未读
            </Checkbox>
            <Button
              type="primary"
              disabled={unread(tab) === 0}
              onClick={() => onRead(inTab.filter((m) => !m.read).map((m) => m.id))}
            >
              全部已读
            </Button>
          </div>

          <div className={styles.list}>
            {list.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无消息" />
            ) : (
              list.map((m) => (
                <div
                  key={m.id}
                  className={m.read && !m.comment ? `${styles.row} ${styles.rowRead}` : styles.row}
                  onClick={() => {
                    if (!m.read) onRead([m.id]);
                    if (m.comment) onOpenComment(m);
                  }}
                >
                  <div className={styles.rowHead}>
                    {!m.read && <i className={styles.dot} />}
                    <b className={m.read ? `${styles.title} ${styles.titleRead}` : styles.title}>
                      {m.title}
                    </b>
                    <span className={styles.time}>{formatMessageTime(m.time)}</span>
                  </div>
                  <div className={styles.content}>{m.content}</div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </Modal>
  );
}
