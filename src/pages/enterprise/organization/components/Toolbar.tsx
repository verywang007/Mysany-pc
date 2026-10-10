import { Button, Radio } from 'antd';
import { ORG_TABS, type OrgTab } from '../constants';
import styles from '../index.module.css';

interface Props {
  tab: OrgTab;
  memberCount: number;
  deviceCount: number;
  onTabChange: (tab: OrgTab) => void;
  onBatchRemoveMembers: () => void;
  onAddMember: () => void;
  onBatchUnassign: () => void;
  onAssignDevice: () => void;
  onImport: () => void;
}

/** 工作区工具栏：左侧页签「组织成员 | 设备分配」，右侧操作按钮；批量按钮无勾选时禁用，有勾选时带总数 */
export default function Toolbar(props: Props) {
  const { tab, memberCount, deviceCount } = props;
  return (
    <div className={styles.toolbar}>
      <Radio.Group
        className={styles.tabs}
        optionType="button"
        options={ORG_TABS}
        value={tab}
        onChange={(e) => props.onTabChange(e.target.value as OrgTab)}
      />
      <div className={styles.toolbarActions}>
        {tab === 'members' ? (
          <>
            <Button
              type="primary"
              danger
              disabled={!memberCount}
              onClick={props.onBatchRemoveMembers}
            >
              批量移除{memberCount ? `(${memberCount})` : ''}
            </Button>
            <Button type="primary" onClick={props.onAddMember}>
              添加成员
            </Button>
          </>
        ) : (
          <>
            <Button type="primary" danger disabled={!deviceCount} onClick={props.onBatchUnassign}>
              批量取消分配{deviceCount ? `(${deviceCount})` : ''}
            </Button>
            <Button type="primary" onClick={props.onAssignDevice}>
              分配设备
            </Button>
            <Button onClick={props.onImport}>导入</Button>
          </>
        )}
      </div>
    </div>
  );
}
