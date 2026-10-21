import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { App, Button, Checkbox, Modal } from 'antd';
import DocModal from '@/components/DocModal';
import Icon from '@/components/Icon';
import { LOGIN_PATH } from '@/router/resolve';
import {
  getPolicyDoc,
  getPolicyVersion,
  rememberAgreedVersion,
  type PolicyDocKey,
} from '@/services/common/agreements';
import styles from './index.module.css';

const MUST_CHOOSE = '请先阅读并选择同意或拒绝';

/**
 * 协议变更「更新提示」弹窗：隐私协议 / 用户服务协议变更后要求重新同意。
 * 规格见 docs/page-specs/协议变更.md。
 * - 不可关闭：没有 ×，点遮罩、按 Esc 只提示；
 * - 两项各自勾选，都勾上「同意」才变实心；没勾就点会抖动并提示缺哪一项；
 * - 拒绝 → 二次确认 → 退出态（可重新查看协议或返回登录页）；
 * - 同意后记录已同意版本（演示页每次进入都会弹出，不读取该记录）。
 */
export default function PolicyUpdateModal() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const policy = getPolicyVersion();

  const [open, setOpen] = useState(true);
  // 每次重新打开都生成全新弹窗，勾选重置
  const [round, setRound] = useState(0);
  const [agreed, setAgreed] = useState({ service: false, privacy: false });
  const [doc, setDoc] = useState<PolicyDocKey | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [exited, setExited] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const after = useRef<'agree' | 'exit' | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const both = agreed.service && agreed.privacy;

  // 正文还没读到底时，底部显示渐隐提示（不强制读到底）
  const syncFade = useCallback(() => {
    const el = bodyRef.current;
    if (el) setHasMore(el.scrollTop + el.clientHeight < el.scrollHeight - 2);
  }, []);
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(syncFade, 0);
    window.addEventListener('resize', syncFade);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('resize', syncFade);
    };
  }, [open, round, syncFade]);

  const agree = () => {
    if (!both) {
      setShaking(false);
      // 下一帧重新加上，连续点击可重复抖动
      requestAnimationFrame(() => setShaking(true));
      const missing = [!agreed.service && '用户服务协议', !agreed.privacy && '隐私协议'].filter(
        Boolean,
      );
      message.info(`请先阅读并同意${missing.join('和')}`);
      return;
    }
    rememberAgreedVersion(policy.version);
    after.current = 'agree';
    setOpen(false);
  };

  const reopen = () => {
    setExited(false);
    setAgreed({ service: false, privacy: false });
    setRound((r) => r + 1);
    setOpen(true);
  };

  const docLink = (key: PolicyDocKey, text: string, className: string) => (
    <span
      className={className}
      onClick={(e) => {
        // 点协议名只打开阅读弹窗，不切换勾选
        e.preventDefault();
        e.stopPropagation();
        setDoc(key);
      }}
    >
      {text}
    </span>
  );

  const agreeRow = (key: 'service' | 'privacy', name: string) => (
    <Checkbox
      className={styles.row}
      checked={agreed[key]}
      onChange={(e) => setAgreed((a) => ({ ...a, [key]: e.target.checked }))}
    >
      同意{docLink(key, name, styles.u)}
    </Checkbox>
  );

  return (
    <>
      <Modal
        key={round}
        open={open}
        width={640}
        centered
        closable={false}
        footer={null}
        title={null}
        // 点遮罩、按 Esc 都只提示，不关闭
        onCancel={() => message.info(MUST_CHOOSE)}
        keyboard={!doc && !confirmOpen}
        className={styles.modal}
        rootClassName={styles.root}
        afterClose={() => {
          if (after.current === 'agree') message.success('已同意更新后的协议，可继续使用 MySANY');
          if (after.current === 'exit') setExited(true);
          after.current = null;
        }}
      >
        <div className={hasMore ? `${styles.dialog} ${styles.hasMore}` : styles.dialog}>
          <div className={styles.head}>
            <h3>更新提示</h3>
            <div className={styles.sub}>{policy.date} 生效</div>
          </div>

          <div className={styles.body} ref={bodyRef} onScroll={syncFade}>
            <p>
              尊敬的用户，感谢您使用 MySANY
              平台。为了更好地保障您的用户权益，我们对《用户服务协议》与《隐私政策》进行了优化更新。本次更新主要涉及以下内容：
            </p>
            <ol>
              <li>
                更新了《隐私政策》与{docLink('share', '《个人信息共享清单》', styles.link)}
                中，第三方 SDK 的名称、收集范围及其隐私政策地址；
              </li>
              <li>明确了设备定位信息、工况数据的收集目的、使用范围与存储期限；</li>
              <li>新增了撤回授权、注销账号与个人信息副本获取的操作指引；</li>
              <li>调整了《用户服务协议》中关于账号安全与服务变更通知的条款表述。</li>
            </ol>
            <p>
              建议您仔细阅读并充分理解上述更新内容。如果您勾选同意或继续使用 MySANY
              平台，即表示您知情并接受更新后的协议内容。若您对更新后的《用户服务协议》与《隐私政策》有异议，建议您暂停下一步操作。
            </p>
            <p>
              如果您有任何疑问或需要任何帮助，欢迎随时联系我们（400-887-8318），我们将竭诚为您解答。
            </p>
          </div>
          <div className={styles.fade} aria-hidden="true" />

          {/* 顺序：用户服务协议在上（与登录页相反，沿用原型） */}
          <div
            className={shaking ? `${styles.agree} ${styles.shake}` : styles.agree}
            onAnimationEnd={() => setShaking(false)}
          >
            {agreeRow('service', '用户服务协议')}
            {agreeRow('privacy', '隐私协议')}
          </div>

          <div className={styles.foot}>
            <button type="button" className={styles.btn} onClick={() => setConfirmOpen(true)}>
              拒绝
            </button>
            {/* 未全部勾选时只是看起来置灰，仍可点击以触发抖动提示 */}
            <button
              type="button"
              className={`${styles.btn} ${styles.btnPrimary} ${both ? '' : styles.isDisabled}`}
              aria-disabled={!both}
              onClick={agree}
            >
              同意
            </button>
          </div>
        </div>
      </Modal>

      <DocModal
        doc={doc ? (getPolicyDoc(doc) ?? null) : null}
        backText="返回"
        onBack={() => setDoc(null)}
        zIndex={1100}
      />

      <Modal
        open={confirmOpen}
        width={400}
        centered
        closable={false}
        zIndex={1100}
        title="确认拒绝？"
        className={styles.confirm}
        onCancel={() => setConfirmOpen(false)}
        footer={
          <>
            <Button onClick={() => setConfirmOpen(false)}>再看看</Button>
            <Button
              type="primary"
              onClick={() => {
                setConfirmOpen(false);
                after.current = 'exit';
                setOpen(false);
              }}
            >
              仍然拒绝
            </Button>
          </>
        }
      >
        拒绝后我们将无法继续为你提供 MySANY
        的服务，本次会话将退出。你可以随时重新登录并同意更新后的协议。
      </Modal>

      {exited &&
        createPortal(
          <div className={styles.exit}>
            <div className={styles.exitIcon}>
              <Icon name="logout" size={30} />
            </div>
            <h3>已退出 MySANY</h3>
            <p>你未同意更新后的《用户服务协议》与《隐私协议》，暂时无法使用平台的相关服务。</p>
            <div className={styles.exitRow}>
              <button type="button" className={styles.btn} onClick={() => navigate(LOGIN_PATH)}>
                返回登录页
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={reopen}
              >
                重新查看协议
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
