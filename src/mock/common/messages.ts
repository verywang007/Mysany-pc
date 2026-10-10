import type { Message } from '@/services/common/messages';

/** 顶栏消息（角标 10），取自原型 data.js 的 messages */
export const MESSAGES: Message[] = [
  { id: 'm1', title: '空滤阻塞(P072)', desc: 'SY0758CC01278 · 挖掘机', time: '09-28 13:12' },
  {
    id: 'm2',
    title: 'HCU-电源电压过低(E001)',
    desc: 'SY0758CC01278 · 挖掘机',
    time: '09-27 09:51',
  },
  {
    id: 'm3',
    title: '超时保养提醒 超期 781h',
    desc: 'SW956E9CFB678 · 电动装载机',
    time: '09-27 18:52',
  },
  {
    id: 'm4',
    title: '超时保养提醒 超期 738h',
    desc: 'SW956E9CFB868 · 电动装载机',
    time: '09-27 18:52',
  },
  { id: 'm5', title: '冷却水温过高(P068)', desc: 'SY0758CC01278 · 挖掘机', time: '09-26 16:55' },
  {
    id: 'm6',
    title: '超时保养提醒 超期 761h',
    desc: 'SW956E9CFB678 · 电动装载机',
    time: '09-26 18:56',
  },
  { id: 'm7', title: '设备离线提醒', desc: 'SW956E9CFB868 · 电动装载机', time: '09-25 08:10' },
  { id: 'm8', title: '保养计划已生成', desc: 'SW956E9CFB678 · 电动装载机', time: '09-24 17:30' },
  { id: 'm9', title: '设备入网成功', desc: 'SY0758CC01278 · 挖掘机', time: '09-23 11:02' },
  { id: 'm10', title: '账号登录提醒', desc: '新设备登录', time: '09-22 09:28' },
];
