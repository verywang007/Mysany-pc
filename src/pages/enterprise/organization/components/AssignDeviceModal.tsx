import type { TableColumnsType } from 'antd';
import {
  unassignedDevices,
  type OrgDevice,
  type OrgNode,
} from '@/services/enterprise/organization';
import CandidateModal from './CandidateModal';

const COLUMNS: TableColumnsType<OrgDevice> = [
  { title: '设备编号', dataIndex: 'code' },
  { title: '设备类型', dataIndex: 'model' },
];

interface Props {
  tree: OrgNode[];
  onCancel: () => void;
  onOk: (deviceIds: string[]) => void;
}

/** 子组织「分配设备」（宽 800）：候选为未分配给任何组织的设备 */
export default function AssignDeviceModal({ tree, onCancel, onOk }: Props) {
  return (
    <CandidateModal<OrgDevice>
      title="分配设备"
      width={800}
      placeholder="搜索设备"
      candidates={unassignedDevices(tree)}
      searchText={(d) => `${d.code} ${d.model}`}
      columns={COLUMNS}
      onCancel={onCancel}
      onOk={onOk}
    />
  );
}
