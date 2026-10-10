import { MESSAGES } from '@/mock/common/messages';
import { delay } from '@/mock/utils';

export interface Message {
  id: string;
  title: string;
  desc: string;
  /** 展示用时间，MM-DD HH:mm */
  time: string;
}

/** 顶栏通知列表 */
export async function listMessages(): Promise<Message[]> {
  await delay(0);
  return MESSAGES;
}
