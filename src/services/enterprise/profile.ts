import { INVITES } from '@/mock/enterprise/profile';
import { delay } from '@/mock/utils';

export interface InviteRow {
  id: string;
}

/** 通知邀请：页签数字取 all / done / todo，与 rows 条数无关（与原型一致） */
export interface InviteSummary {
  all: number;
  done: number;
  todo: number;
  rows: InviteRow[];
}

export async function getInvites(): Promise<InviteSummary> {
  await delay(0);
  return INVITES;
}

/** 修改密码：原型不提交服务器，只做本地校验 */
export async function changePassword(): Promise<void> {
  await delay(0);
}
