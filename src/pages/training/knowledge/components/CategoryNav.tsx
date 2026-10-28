import { Dropdown } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { countKnowledge, getKnowledgeCategories } from '@/services/training/knowledge';
import styles from '../index.module.css';

interface Props {
  /** 选中的分类 id，undefined 为全部知识 */
  value?: string;
  onChange: (id?: string) => void;
}

/** 左侧分类：一级分类可直接点选，有下级的悬停时向右弹出下级（同测试环境） */
export default function CategoryNav({ value, onChange }: Props) {
  const categories = getKnowledgeCategories();
  const cls = (on: boolean) => (on ? `${styles.cat} ${styles.catOn}` : styles.cat);

  return (
    <nav className={styles.side}>
      <div className={cls(!value)} onClick={() => onChange(undefined)}>
        全部知识({countKnowledge()})
      </div>
      {categories.map((c) => {
        const childOn = c.children?.some((x) => x.id === value) ?? false;
        const row = (
          <div className={cls(value === c.id || childOn)} onClick={() => onChange(c.id)}>
            <span className={styles.catName}>
              {c.name}({countKnowledge(c.id)})
            </span>
            {c.children && <RightOutlined className={styles.catArrow} />}
          </div>
        );
        if (!c.children) return <div key={c.id}>{row}</div>;
        return (
          <Dropdown
            key={c.id}
            placement="bottomLeft"
            align={{ points: ['tl', 'tr'], offset: [8, 0] }}
            menu={{
              items: c.children.map((x) => ({
                key: x.id,
                label: `${x.name}(${countKnowledge(x.id)})`,
              })),
              selectable: true,
              selectedKeys: value ? [value] : [],
              onClick: ({ key }) => onChange(key),
            }}
          >
            {row}
          </Dropdown>
        );
      })}
    </nav>
  );
}
