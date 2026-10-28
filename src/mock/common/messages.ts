import { KNOWLEDGE, KNOWLEDGE_COMMENTS } from '@/mock/training/knowledge';
import { daysAgo as at } from '@/mock/utils';
import type { Message } from '@/services/common/messages';

const overdue = (vin: string) =>
  `您的车辆「${vin}」已超过保养日期，请尽快安排保养，如果需要使用远程支持，立即预约；`;
const upcoming = (vin: string) =>
  `您的车辆「${vin}」即将到保养日期，请尽快安排保养，如果需要使用远程支持，立即预约；`;

let seq = 0;
const msg = (
  type: Message['type'],
  title: string,
  content: string,
  time: string,
  read = false,
): Message => ({ id: `m${++seq}`, type, title, content, time, read });

/**
 * 评论消息：由知识库评论数据生成，标题、内容、时间与知识库里的评论一致。
 * 带 replyId 为「回复」（别人回复了我），否则为「新评论」（我贡献的知识有新评论）。
 */
const comment = (knowledgeId: string, commentId: string, replyId?: string, read = false) => {
  const k = KNOWLEDGE.find((x) => x.id === knowledgeId)!;
  const c = KNOWLEDGE_COMMENTS.find((x) => x.id === commentId)!;
  const src = replyId ? c.replies.find((r) => r.id === replyId)! : c;
  return {
    ...msg('comment', '', src.content, src.time.slice(0, 16), read),
    comment: {
      kind: replyId ? 'reply' : 'new',
      nickname: src.nickname,
      kb: k.name,
      knowledgeId,
      commentId,
      replyId,
    },
  } satisfies Message;
};

/** 顶栏消息 / 消息中心样本数据 */
export const MESSAGES: Message[] = [
  // 服务系统消息
  msg(
    'system',
    'Overdue maintenance reminder.',
    '您有 3 台设备已超过保养日期，请尽快安排保养。',
    at(6, '10:01'),
  ),
  msg(
    'system',
    '服务工单已完成',
    '工单「GD20261018001」已完成，欢迎对本次服务进行评价。',
    at(9, '15:20'),
  ),
  msg(
    'system',
    '设备入网成功',
    '设备「SY0758CC01278」已成功入网，可在设备管理中查看。',
    at(12, '11:02'),
  ),
  msg(
    'system',
    '账号登录提醒',
    '您的账号在新设备上登录，如非本人操作，请及时修改密码。',
    at(15, '09:28'),
    true,
  ),

  // 保养消息
  msg('maintain', '超时保养提醒', overdue('SY013SCC26598'), at(0, '10:01')),
  msg('maintain', '超时保养提醒', overdue('SY013SCC20658'), at(0, '10:01')),
  msg('maintain', '临近保养提醒', upcoming('SY013SCC01638'), at(0, '10:01')),
  msg('maintain', '超时保养提醒', overdue('SY013SCC51268'), at(0, '10:01')),
  msg('maintain', '超时保养提醒', overdue('23SY210C001377'), at(1, '17:13')),
  msg('maintain', '超时保养提醒', overdue('SY013SCC26598'), at(2, '10:01')),
  msg('maintain', '超时保养提醒', overdue('SY013SCC20658'), at(2, '10:01')),
  msg('maintain', '临近保养提醒', upcoming('SY013SCC01638'), at(2, '10:01')),
  msg('maintain', '临近保养提醒', upcoming('SW956E9CFB678'), at(4, '18:52')),
  msg('maintain', '超时保养提醒', overdue('SW956E9CFB868'), at(5, '18:52'), true),

  // 评论消息
  comment('k1', 'k1-c1', 'k1-c1-r3'),
  comment('k2', 'k2-c1'),
  comment('k3', 'k3-c1', 'k3-c1-r2'),
  comment('k1', 'k1-c2', undefined, true),
  comment('k1', 'k1-c1', undefined, true),
];
