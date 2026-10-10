import { useState } from 'react';
import { App, Button, Input, Transfer, type TransferProps } from 'antd';
import {
  getDevices,
  savePersonalDevices,
  type Device,
  type User,
} from '@/services/enterprise/user';
import { MODAL_WIDTH } from '../constants';
import UmModal from './UmModal';
import modalStyles from './modal.module.css';
import panelStyles from './panels.module.css';

const styles = { ...modalStyles, ...panelStyles };

interface Props {
  user: User;
  onClose: () => void;
}

type Item = Device & { key: string };

/**
 * 个人设备权限设置：顶部搜索同时过滤左右两栏；可分配设备列出全部设备，不按组织过滤（原型如此）。
 * 确定后 personalDevices = 草稿，assignedDevices 只并入不移除（见 services）。
 */
export default function PersonalDevicesModal({ user, onClose }: Props) {
  const { message } = App.useApp();
  // 草稿按加入顺序保存（与原型 Set 一致），展示时按设备表顺序
  const [draft, setDraft] = useState<string[]>(user.personalDevices);
  const [search, setSearch] = useState('');

  const kw = search.toLowerCase();
  const all: Item[] = getDevices().map((d) => ({ ...d, key: d.id }));
  const shown = all.filter((d) => !kw || `${d.name} ${d.type}`.toLowerCase().includes(kw));
  const inDraft = new Set(draft);
  const targetKeys = all.filter((d) => inDraft.has(d.id)).map((d) => d.id);
  const leftCount = shown.filter((d) => !inDraft.has(d.id)).length;
  const rightCount = shown.filter((d) => inDraft.has(d.id)).length;

  const onChange: TransferProps<Item>['onChange'] = (_keys, direction, moveKeys) => {
    const moving = moveKeys.map(String);
    if (direction === 'right') {
      setDraft((d) => d.concat(moving.filter((k) => !d.includes(k))));
    } else {
      setDraft((d) => d.filter((k) => !moving.includes(k)));
    }
  };

  const save = async () => {
    await savePersonalDevices(user.id, draft);
    onClose();
    message.success('个人设备权限已保存');
  };

  return (
    <UmModal
      title={`${user.name}-个人设备权限设置`}
      width={MODAL_WIDTH.wide}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" onClick={save}>
            确定
          </Button>
        </>
      }
    >
      <Input
        autoFocus
        className={styles.personalSearch}
        placeholder="搜索设备名称或编号"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Transfer<Item>
        className={styles.transfer}
        dataSource={shown}
        targetKeys={targetKeys}
        onChange={onChange}
        render={(d) => `${d.name} · ${d.type}`}
        showSelectAll={false}
        selectAllLabels={[`可分配设备 (${leftCount})`, `已分配设备 (${rightCount})`]}
        operations={['›', '‹']}
        locale={{ notFoundContent: '无结果' }}
      />
    </UmModal>
  );
}
