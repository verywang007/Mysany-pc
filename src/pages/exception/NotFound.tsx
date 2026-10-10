import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { HOME_PATH } from '@/router/resolve';
import styles from './index.module.css';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className={styles.placeholder}>
      <h3>页面不存在</h3>
      <p>链接可能已失效，请从左侧菜单重新进入。</p>
      <Button type="primary" className={styles.action} onClick={() => navigate(HOME_PATH)}>
        返回工作台
      </Button>
    </div>
  );
}
