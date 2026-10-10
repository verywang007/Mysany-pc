import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { HOME_PATH } from '@/router/resolve';

// TODO(第 3 步)：临时占位，迁移登录页时整体替换
export default function Login() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: 80, textAlign: 'center' }}>
      <p>登录页待迁移（第 3 步）</p>
      <Button type="primary" onClick={() => navigate(HOME_PATH)}>
        进入工作台
      </Button>
    </div>
  );
}
