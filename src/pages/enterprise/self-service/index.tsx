import styles from './index.module.css';

/** 自助服务：原型中仅为一个主题色色块（工作台.html #v-selfservice） */
export default function SelfService() {
  return (
    <div className={styles.page}>
      <div className={styles.block} />
    </div>
  );
}
