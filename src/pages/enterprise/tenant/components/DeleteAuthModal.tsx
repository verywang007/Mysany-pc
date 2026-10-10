import { App, Button, ConfigProvider } from 'antd';
import { deleteAuthentication, type AuthRecord } from '@/services/enterprise/tenant';
import { DANGER_THEME, MODAL_WIDTH } from '../constants';
import TenantModal from './TenantModal';
import styles from '../modal.module.css';

interface Props {
  open: boolean;
  record?: AuthRecord;
  onClose: () => void;
  onDeleted: () => void;
}

/** 删除客户编号：与原型一致，没有「至少保留一条」等限制 */
export default function DeleteAuthModal({ open, record, onClose, onDeleted }: Props) {
  const { message } = App.useApp();

  const confirm = async () => {
    if (!record) return;
    await deleteAuthentication(record.id);
    onDeleted();
    message.success('客户认证已删除');
  };

  return (
    <TenantModal
      open={open && !!record}
      title="删除客户编号"
      width={MODAL_WIDTH.delete}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>取消</Button>
          <ConfigProvider theme={DANGER_THEME}>
            <Button type="primary" danger onClick={confirm}>
              删除
            </Button>
          </ConfigProvider>
        </>
      }
    >
      {record && (
        <div className={styles.deleteCopy}>
          删除客户编号 <strong>{record.customerCode}</strong> 后将产生以下影响：
          <ul>
            <li>您将无法使用该客户编号进行设备批量绑定</li>
            <li>已绑定的设备不受影响，仍可正常访问</li>
            <li>删除操作不可撤销</li>
          </ul>
        </div>
      )}
    </TenantModal>
  );
}
