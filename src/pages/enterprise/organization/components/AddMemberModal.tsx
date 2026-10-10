import type { TableColumnsType } from 'antd';
import { listOrgUsers, type OrgNode, type OrgUser } from '@/services/enterprise/organization';
import CandidateModal from './CandidateModal';
import { RoleTags } from './parts';

const COLUMNS: TableColumnsType<OrgUser> = [
  { title: '用户姓名', dataIndex: 'name' },
  { title: '手机号码', dataIndex: 'phone' },
  { title: '邮箱', dataIndex: 'email' },
  { title: '角色', dataIndex: 'roles', render: (roles: string[]) => <RoleTags roles={roles} /> },
];

interface Props {
  node: OrgNode;
  onCancel: () => void;
  onOk: (userIds: string[]) => void;
}

/** 添加组织成员（宽 870）：候选为不在本组织成员里的全部用户（含 u0、负责人等） */
export default function AddMemberModal({ node, onCancel, onOk }: Props) {
  const used = new Set(node.members.map((m) => m.userId));
  return (
    <CandidateModal<OrgUser>
      title="添加组织成员"
      width={870}
      placeholder="搜索用户"
      candidates={listOrgUsers().filter((u) => !used.has(u.id))}
      searchText={(u) => [u.name, u.phone, u.email].join(' ')}
      columns={COLUMNS}
      onCancel={onCancel}
      onOk={onOk}
    />
  );
}
