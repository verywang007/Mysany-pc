import {
  CURRENT_ORG_USER_ID,
  findNode,
  findParent,
  findUser,
  ownerUser,
  type ImportRow,
  type OrgFormValues,
  type OrgNode,
} from '@/services/enterprise/organization';
import AddMemberModal from './AddMemberModal';
import AssignDeviceModal from './AssignDeviceModal';
import BatchAssignModal from './BatchAssignModal';
import ImportDeviceModal from './ImportDeviceModal';
import OrgFormModal from './OrgFormModal';
import PickOrgModal from './PickOrgModal';

/** 同一时刻只有一个弹窗（二次确认由 modal.confirm 单独弹出） */
export type ModalState =
  | { type: 'org-form'; mode: 'add' | 'edit'; nodeId: string }
  | { type: 'add-members' }
  | { type: 'assign-devices' }
  | { type: 'pick-org'; deviceIds: string[] }
  | { type: 'batch-assign' }
  | { type: 'import' }
  | null;

interface Props {
  modal: ModalState;
  tree: OrgNode[];
  /** 当前选中组织 */
  node: OrgNode;
  onClose: () => void;
  onSaveOrg: (mode: 'add' | 'edit', id: string, values: OrgFormValues) => void;
  onAddMembers: (userIds: string[]) => void;
  /** 分配设备并给出提示（文案由各入口决定）；多归属模型下可一次分配到多个组织 */
  onAssign: (orgIds: string[], deviceIds: string[], toast: string) => void;
  onImport: (rows: ImportRow[]) => void;
}

/** 按 modal 状态挂载对应弹窗 */
export default function PageModals({ modal, tree, node, onClose, ...on }: Props) {
  if (!modal) return null;
  const orgName = (id: string) => findNode(tree, id)?.name;
  switch (modal.type) {
    case 'org-form': {
      const target = findNode(tree, modal.nodeId);
      if (!target) return null;
      const edit = modal.mode === 'edit';
      const parent = edit ? findParent(tree, target.id) : target;
      return (
        <OrgFormModal
          init={{
            mode: modal.mode,
            name: edit ? target.name : '',
            description: edit && target.description !== '-' ? target.description : '',
            parentName: parent ? parent.name : '根组织',
            owner: edit ? ownerUser(target) : findUser(CURRENT_ORG_USER_ID),
          }}
          onCancel={onClose}
          onSave={(v) => on.onSaveOrg(modal.mode, target.id, v)}
        />
      );
    }
    case 'add-members':
      return <AddMemberModal node={node} onCancel={onClose} onOk={on.onAddMembers} />;
    case 'assign-devices':
      return (
        <AssignDeviceModal
          tree={tree}
          onCancel={onClose}
          onOk={(ids) => on.onAssign([node.id], ids, '设备分配成功')}
        />
      );
    case 'pick-org':
      return (
        <PickOrgModal
          tree={tree}
          onCancel={onClose}
          // 修正原型缺陷：原型此路径只改内存、未写 localStorage，刷新后丢失；这里与其他分配路径一样保存
          // 多选后设备同时挂到所选的每个组织（多归属，不清除已有归属）
          onOk={(orgIds) =>
            on.onAssign(
              orgIds,
              modal.deviceIds,
              `设备已分配到“${orgIds.map((id) => orgName(id) ?? id).join('、')}”`,
            )
          }
        />
      );
    case 'batch-assign':
      return (
        <BatchAssignModal
          tree={tree}
          onCancel={onClose}
          onOk={(orgId, ids) =>
            on.onAssign([orgId], ids, `已为「${orgName(orgId)}」分配 ${ids.length} 台设备`)
          }
        />
      );
    case 'import':
      return <ImportDeviceModal tree={tree} onCancel={onClose} onSave={on.onImport} />;
  }
}
