import { App, Button } from 'antd';
import { deleteUser, type User } from '@/services/enterprise/user';
import { formatPhone } from '../utils';
import { MODAL_WIDTH } from '../constants';
import UmModal from './UmModal';
import styles from './modal.module.css';

interface Props {
  user: User;
  onClose: () => void;
  onDeleted: () => void;
}

/** 删除用户确认：联系方式优先显示手机号，否则邮箱，都无显示 - */
export default function DeleteUserModal({ user, onClose, onDeleted }: Props) {
  const { message } = App.useApp();
  const contact = formatPhone(user.prefix, user.phone) || user.email || '-';

  const confirm = async () => {
    await deleteUser(user.id);
    onClose();
    onDeleted();
    message.success(`用户“${user.name}”已删除`);
  };

  return (
    <UmModal
      title="删除用户"
      width={MODAL_WIDTH.small}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" danger className={styles.danger} onClick={confirm}>
            删除
          </Button>
        </>
      }
    >
      <div className={styles.deleteWarning}>
        <strong>确认删除用户“{user.name}”吗？</strong>
        <div>{contact}</div>
        <p>删除后，该用户将无法继续访问当前租户，且此操作不可撤销。</p>
      </div>
    </UmModal>
  );
}
