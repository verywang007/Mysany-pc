import { useLocation } from 'react-router-dom';
import Icon from '@/components/Icon';
import { resolveRoute } from '@/router/resolve';
import styles from './index.module.css';

/** 未实现菜单的占位页，文案沿用原型工作台.html 的 #v-ph */
export default function Building() {
  const { pathname } = useLocation();
  const { title } = resolveRoute(pathname);
  return (
    <div className={styles.placeholder}>
      <Icon name="box" size={52} strokeWidth={1.4} className={styles.icon} />
      <h3>{title || '模块'}</h3>
      <p>本模块为本地占位页。左侧菜单、工作台与个人中心的交互均已完整实现。</p>
    </div>
  );
}
