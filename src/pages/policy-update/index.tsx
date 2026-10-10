import PolicyUpdateModal from '@/components/PolicyUpdateModal';
import Workbench from '@/pages/workbench';

/**
 * 协议变更演示页（原型 协议变更.html）：背景为工作台，进入即弹出「更新提示」。
 * 演示页每次进入都会弹出，不读取本地已同意记录；真实项目应按「线上版本 ≠ 本地已同意版本」决定是否弹出。
 */
export default function PolicyUpdate() {
  return (
    <>
      <Workbench />
      <PolicyUpdateModal />
    </>
  );
}
