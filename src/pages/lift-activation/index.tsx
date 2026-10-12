import { Fragment, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { App } from 'antd';
import { pageTitle } from '@/config/app';
import { HOME_PATH } from '@/router/resolve';
import {
  enterSystem,
  getActivation,
  submitActivation,
  type ActivationStage,
  type LiftActivation as ActivationInfo,
} from '@/services/lift-planning/activation';
import { ApplyIcon, ApprovedIcon, StepOkIcon, WaitIcon } from './components/icons';
import { ACTIVATION_STEPS, ACTIVATION_TEXT as T } from './constants';
import styles from './index.module.css';

const cx = (...names: (string | false | undefined)[]) => names.filter(Boolean).join(' ');

/** 三种形态的头部图形、标题与说明 */
const STAGE_HEAD: Record<ActivationStage, { icon: ReactNode; title: string; content: string }> = {
  apply: { icon: <ApplyIcon />, title: T.applyTitle, content: T.applyContent },
  pending: { icon: <WaitIcon />, title: T.pendingTitle, content: T.pendingContent },
  approved: { icon: <ApprovedIcon />, title: T.approvedTitle, content: T.approvedContent },
};

/**
 * 吊装规划 · 发电机组智慧运营系统开通状态页。
 * 对应线上 gioms「第三方账号开通 / 审核状态」页（未申请 / 审核中 / 已开通三种形态），
 * 结构与色值取自线上组件 .my-sany-auth-login，文案取自其 zh_CN 语言包。
 * 线上该页在主站之外独立打开，这里同样注册在 BasicLayout 之外（见 main.tsx）。
 */
export default function LiftActivation() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [info, setInfo] = useState<ActivationInfo>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = pageTitle('吊装规划');
    getActivation().then(setInfo);
  }, []);

  if (!info) return null;

  const { stage, account, name } = info;
  /** 已提交申请（审核中 / 已开通） */
  const applied = stage !== 'apply';
  /** 审核通过 */
  const approved = stage === 'approved';

  // 步骤条：第 1 步恒有内容，第 2、3 步按状态推进；未申请时三步都显示序号
  const steps = [
    { boxActive: stage === 'apply', circleActive: true },
    { boxActive: stage === 'pending', circleActive: applied },
    { boxActive: approved, circleActive: approved },
  ];
  const lineActive = (i: number) => (i === 1 ? applied : approved);
  const labelActive = (i: number) => i === 0 || (i === 1 ? applied : approved);

  const back = () => navigate(HOME_PATH);

  const submit = async () => {
    if (submitting) return;
    if (!account.trim()) {
      message.warning(T.missingLoginName);
      return;
    }
    setSubmitting(true);
    try {
      await submitActivation();
      message.success(T.submitSuccess);
      setInfo((prev) => (prev ? { ...prev, stage: 'pending' } : prev));
    } catch {
      message.error(T.submitFailed);
    } finally {
      setSubmitting(false);
    }
  };

  const enter = async () => {
    await enterSystem();
    navigate(HOME_PATH);
  };

  return (
    <div className={styles.page}>
      <div className={styles.box}>
        <div className={styles.iconBox}>{STAGE_HEAD[stage].icon}</div>
        <div className={styles.title}>{STAGE_HEAD[stage].title}</div>
        <div className={styles.content}>{STAGE_HEAD[stage].content}</div>

        <div className={styles.cardList}>
          <div className={styles.item}>
            <div className={styles.label}>{applied ? T.applyInfo : T.registerWithTip}</div>
          </div>
          <div className={styles.item}>
            <div className={styles.label}>{T.account}</div>
            <div className={styles.value}>{account || '-'}</div>
          </div>
          <div className={styles.item}>
            <div className={styles.label}>{T.name}</div>
            <div className={styles.value}>{name || '-'}</div>
          </div>
          {applied && (
            <div className={styles.item}>
              <div className={styles.label}>{T.currentStatus}</div>
              <div className={styles.value}>
                <div className={cx(styles.statusDot, approved && styles.statusDotActive)} />
                <div className={cx(styles.statusText, approved && styles.statusTextActive)}>
                  {approved ? T.approved : T.pendingReview}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.progress}>
          <div className={styles.circleRow}>
            {steps.map((s, i) => (
              <Fragment key={i}>
                {i > 0 && <div className={cx(styles.line, lineActive(i) && styles.lineActive)} />}
                <div className={cx(styles.circleBox, s.boxActive && styles.circleBoxActive)}>
                  <div className={cx(styles.stepCircle, s.circleActive && styles.stepCircleActive)}>
                    {s.circleActive && applied ? (
                      <StepOkIcon />
                    ) : (
                      <div className={styles.stepNum}>{i + 1}</div>
                    )}
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
          <div className={styles.stepTextRow}>
            {ACTIVATION_STEPS.map((label, i) => (
              <div
                key={label}
                className={cx(styles.stepLabel, labelActive(i) && styles.stepLabelActive)}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.btns}>
          {stage !== 'pending' && (
            <button type="button" className={styles.returnBtn} onClick={back}>
              {T.backToSanvist}
            </button>
          )}
          {stage === 'apply' && (
            <button
              type="button"
              className={styles.submitBtn}
              disabled={submitting}
              onClick={submit}
            >
              {T.submitApply}
            </button>
          )}
          {stage === 'pending' && (
            <button type="button" className={styles.submitBtn} onClick={back}>
              {T.backToSanvist}
            </button>
          )}
          {stage === 'approved' && (
            <button type="button" className={styles.submitBtn} onClick={enter}>
              {T.enterSystem}
            </button>
          )}
        </div>

        <div className={styles.tooltip}>{approved ? T.enterSystemTip : T.reviewTip}</div>
      </div>
    </div>
  );
}
