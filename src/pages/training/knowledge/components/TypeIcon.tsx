import {
  CustomerServiceFilled,
  FileTextFilled,
  PictureFilled,
  PlaySquareFilled,
  ReadFilled,
} from '@ant-design/icons';
import type { KnowledgeType } from '@/services/training/knowledge';

const ICONS = {
  doc: FileTextFilled,
  image: PictureFilled,
  video: PlaySquareFilled,
  audio: CustomerServiceFilled,
  course: ReadFilled,
} satisfies Record<KnowledgeType, unknown>;

interface Props {
  type: KnowledgeType;
  size?: number;
  /** 默认取类型色 --knowledge-<type> */
  color?: string;
}

/** 知识类型图标 */
export default function TypeIcon({ type, size = 16, color = `var(--knowledge-${type})` }: Props) {
  const Comp = ICONS[type];
  return <Comp style={{ color, fontSize: size }} />;
}
