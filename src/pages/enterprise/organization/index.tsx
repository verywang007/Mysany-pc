import { useEffect, useState } from 'react';
import { App } from 'antd';
import {
  addMembers,
  assignDevices,
  createOrganization,
  deleteBlockReason,
  deleteOrganization,
  deviceOwner,
  deviceRows,
  findDevice,
  findNode,
  findParent,
  findUser,
  getOrganizations,
  importDevices,
  memberRows,
  removeMembers,
  unassignDevices,
  updateOrganization,
  type ImportRow,
  type OrgFormValues,
  type OrgNode,
} from '@/services/enterprise/organization';
import { deviceColumns, memberColumns } from './columns';
import ListTable from './components/ListTable';
import OrgInfo from './components/OrgInfo';
import OrgTree from './components/OrgTree';
import PageModals, { type ModalState } from './components/PageModals';
import { Pager, type PagerState } from './components/parts';
import Toolbar from './components/Toolbar';
import { useDangerConfirm } from './components/useDangerConfirm';
import { PAGE_SIZES, TOAST_SECONDS, type OrgTab } from './constants';
import styles from './index.module.css';
import { clampPage, slicePage } from './pager';

const FIRST_PAGE: PagerState = { page: 1, pageSize: 10 };

/**
 * 企业服务 › 组织管理：左侧组织树 + 右侧组织信息卡 + 成员 / 设备分配两个页签。
 * 规格见 docs/page-specs/企业服务-组织管理.md。视图状态（选中、展开、页签、勾选、页码）均不持久化。
 */
export default function Organization() {
  const { message } = App.useApp();
  const confirm = useDangerConfirm();
  const ok = (text: string) => message.success(text, TOAST_SECONDS);
  const err = (text: string) => message.error(text, TOAST_SECONDS);

  const [tree, setTree] = useState<OrgNode[]>([]);
  const [selectedId, setSelectedId] = useState('root');
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(['root']));
  const [treeSearch, setTreeSearch] = useState('');
  const [tab, setTab] = useState<OrgTab>('members');
  const [memberSel, setMemberSel] = useState<Set<string>>(() => new Set());
  const [deviceSel, setDeviceSel] = useState<Set<string>>(() => new Set());
  const [memberPager, setMemberPager] = useState<PagerState>(FIRST_PAGE);
  const [devicePager, setDevicePager] = useState<PagerState>(FIRST_PAGE);
  const [modal, setModal] = useState<ModalState>(null);

  useEffect(() => {
    getOrganizations().then(setTree);
  }, []);

  const node = findNode(tree, selectedId) ?? tree[0];
  if (!node) return <div className={styles.page} />;

  const members = memberRows(node);
  const devices = deviceRows(tree, node);
  const mPager = clampPage(members.length, memberPager);
  const dPager = clampPage(devices.length, devicePager);
  const close = () => setModal(null);

  /** 选中组织：页签回到「组织成员」，清空两类勾选，两类页码回 1（重复点击已选中节点同样执行） */
  const selectOrganization = (id: string, nextTab: OrgTab = 'members') => {
    setSelectedId(id);
    setTab(nextTab);
    setMemberSel(new Set());
    setDeviceSel(new Set());
    setMemberPager((p) => ({ ...p, page: 1 }));
    setDevicePager((p) => ({ ...p, page: 1 }));
  };

  /* ---------- 组织增删改 ---------- */
  const saveOrgForm = async (mode: 'add' | 'edit', id: string, values: OrgFormValues) => {
    if (mode === 'edit') {
      const { tree: next } = await updateOrganization(id, values);
      setTree(next);
      ok('组织信息已保存');
    } else {
      const { tree: next, result: childId } = await createOrganization(id, values);
      setTree(next);
      setExpanded((s) => new Set(s).add(id));
      // 修正原型缺陷：原型创建后只改选中和页签，未清空勾选、未重置页码；这里按选中组织的规则一并重置
      selectOrganization(childId);
      ok('组织创建成功');
    }
    close();
  };

  const requestDelete = (target: OrgNode) => {
    const reason = deleteBlockReason(target);
    if (reason) {
      err(reason);
      return;
    }
    confirm({
      title: '确认删除',
      content: `确认删除组织“${target.name}”吗？删除后不可恢复。`,
      okText: '删除',
      onOk: async () => {
        const { tree: next, result: parentId } = await deleteOrganization(target.id);
        if (!parentId) return;
        setTree(next);
        // 与原型一致：无论被删的是否当前选中，选中都改为其父节点（页签不变）
        setSelectedId(parentId);
        // 修正原型缺陷：原型删除后未清空勾选、未重置页码
        setMemberSel(new Set());
        setDeviceSel(new Set());
        setMemberPager((p) => ({ ...p, page: 1 }));
        setDevicePager((p) => ({ ...p, page: 1 }));
        ok('删除成功');
      },
    });
  };

  /* ---------- 成员 ---------- */
  const confirmRemoveMembers = (ids: string[], batch = false) => {
    const isBatch = batch || ids.length > 1;
    confirm({
      title: isBatch ? '批量移除' : '移除',
      content: isBatch
        ? `确认移除选中的 ${ids.length} 名组织成员吗？`
        : `确认移除组织成员“${findUser(ids[0])?.name}”吗？`,
      okText: isBatch ? '批量移除' : '移除',
      onOk: async () => {
        const { tree: next } = await removeMembers(node.id, ids);
        setTree(next);
        setMemberSel(new Set());
        ok('成员已移除');
      },
    });
  };

  /* ---------- 设备 ---------- */
  const confirmRemoveDevices = (ids: string[], batch = false) => {
    // 根组织为全局视图：只处理已有所属组织的设备，从设备实际所属组织移除
    const targets = ids.filter((id) => !!deviceOwner(tree, id));
    if (!targets.length) {
      err('所选设备暂未分配组织');
      return;
    }
    const isBatch = batch || targets.length > 1;
    confirm({
      title: isBatch ? '批量取消分配' : '取消分配',
      content: isBatch
        ? `确认取消所选 ${targets.length} 台设备的分配吗？`
        : `确认取消设备“${findDevice(targets[0])?.code ?? ''}”的分配吗？`,
      okText: isBatch ? '批量取消分配' : '取消分配',
      onOk: async () => {
        const { tree: next } = await unassignDevices(targets);
        setTree(next);
        setDeviceSel(new Set());
        ok('已取消设备分配');
      },
    });
  };

  const assignAndClose = async (orgId: string, ids: string[], text: string) => {
    const { tree: next } = await assignDevices(orgId, ids);
    setTree(next);
    close();
    ok(text);
  };

  const onAddMembers = async (ids: string[]) => {
    const { tree: next } = await addMembers(node.id, ids);
    setTree(next);
    close();
    ok('成员添加成功');
  };

  const onImport = async (rows: ImportRow[]) => {
    const { tree: next, result: done } = await importDevices(rows);
    setTree(next);
    close();
    ok(`设备导入成功，共处理 ${done} 台设备`);
  };

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        <OrgTree
          tree={tree}
          selectedId={selectedId}
          expanded={expanded}
          search={treeSearch}
          onSearchChange={setTreeSearch}
          onToggle={(id) =>
            setExpanded((s) => {
              const next = new Set(s);
              if (next.has(id)) next.delete(id);
              else next.add(id);
              return next;
            })
          }
          onSelect={(id) => selectOrganization(id)}
          onAdd={(n) => setModal({ type: 'org-form', mode: 'add', nodeId: n.id })}
          onEdit={(n) => setModal({ type: 'org-form', mode: 'edit', nodeId: n.id })}
          onDelete={requestDelete}
        />
        <section className={styles.content} aria-label="组织详情">
          <OrgInfo node={node} parent={findParent(tree, node.id)} />
          <div className={styles.workspace}>
            <Toolbar
              tab={tab}
              memberCount={memberSel.size}
              deviceCount={deviceSel.size}
              onTabChange={(t) => {
                // 切换页签：清空两类勾选，不重置页码
                setTab(t);
                setMemberSel(new Set());
                setDeviceSel(new Set());
              }}
              onBatchRemoveMembers={() => confirmRemoveMembers([...memberSel], true)}
              onAddMember={() => setModal({ type: 'add-members' })}
              onBatchUnassign={() => confirmRemoveDevices([...deviceSel], true)}
              onAssignDevice={() =>
                setModal({ type: node.root ? 'batch-assign' : 'assign-devices' })
              }
              onImport={() => setModal({ type: 'import' })}
            />
            {tab === 'members' ? (
              <ListTable
                rows={slicePage(members, mPager)}
                columns={memberColumns(node, (u) => confirmRemoveMembers([u.id]))}
                selection={memberSel}
                onSelectionChange={setMemberSel}
              />
            ) : (
              <ListTable
                rows={slicePage(devices, dPager)}
                columns={deviceColumns(
                  (d) => confirmRemoveDevices([d.id]),
                  (d) => setModal({ type: 'pick-org', deviceIds: [d.id] }),
                )}
                selection={deviceSel}
                onSelectionChange={setDeviceSel}
              />
            )}
            <Pager
              className={styles.pagination}
              {...(tab === 'members' ? mPager : dPager)}
              total={tab === 'members' ? members.length : devices.length}
              sizes={PAGE_SIZES}
              onChange={tab === 'members' ? setMemberPager : setDevicePager}
            />
          </div>
        </section>
      </div>
      <PageModals
        modal={modal}
        tree={tree}
        node={node}
        onClose={close}
        onSaveOrg={saveOrgForm}
        onAddMembers={onAddMembers}
        onAssign={assignAndClose}
        onImport={onImport}
      />
    </div>
  );
}
