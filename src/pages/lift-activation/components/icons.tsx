/** 开通状态页专用图形，路径取自线上 gioms 的 mysany-*.svg */
import type { ReactNode } from 'react';

const svg = (size: number, children: ReactNode) => (
  <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" aria-hidden="true">
    {children}
  </svg>
);

/** 未申请：人像 + 加号（40×40） */
export const ApplyIcon = () =>
  svg(
    40,
    <>
      <path
        d="M15 17.5C18.5899 17.5 21.5 14.5899 21.5 11C21.5 7.41015 18.5899 4.5 15 4.5C11.4101 4.5 8.5 7.41015 8.5 11C8.5 14.5899 11.4101 17.5 15 17.5Z"
        stroke="var(--lift-account-brand)"
        strokeWidth="2.2"
      />
      <path
        d="M4 34V31C4 28.8783 4.84285 26.8434 6.34315 25.3431C7.84344 23.8429 9.87827 23 12 23H18C20.1217 23 22.1566 23.8429 23.6569 25.3431C25.1571 26.8434 26 28.8783 26 31V34M30 12V22M25 17H35"
        stroke="var(--lift-account-brand)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>,
  );

/** 审核中：虚线圆 + 时钟（36×36） */
export const WaitIcon = () =>
  svg(
    36,
    <>
      <path
        d="M18 32C25.732 32 32 25.732 32 18C32 10.268 25.732 4 18 4C10.268 4 4 10.268 4 18C4 25.732 10.268 32 18 32Z"
        stroke="var(--lift-account-brand)"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeDasharray="5.7 4"
      />
      <path
        d="M18 10V18L23 22"
        stroke="var(--lift-account-brand)"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>,
  );

/** 已开通：实线圆 + 对勾（36×36） */
export const ApprovedIcon = () =>
  svg(
    36,
    <>
      <path
        d="M18 32C25.732 32 32 25.732 32 18C32 10.268 25.732 4 18 4C10.268 4 4 10.268 4 18C4 25.732 10.268 32 18 32Z"
        stroke="var(--lift-account-brand)"
        strokeWidth="2.3"
      />
      <path
        d="M11 18L16 23L25 13"
        stroke="var(--lift-account-brand)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>,
  );

/** 步骤条已完成：白色对勾（16×16，只出现在深色圆内） */
export const StepOkIcon = () =>
  svg(
    16,
    <path
      d="M4 8L7 12L13 3"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />,
  );
