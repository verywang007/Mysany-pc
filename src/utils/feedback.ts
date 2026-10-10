import { App } from 'antd';

/** 原型里尚未落地的通用动作（导出、导入等）统一提示，避免各页面各写一套文案 */
export function usePrototypeActions() {
  const { message } = App.useApp();
  return {
    exportData: (name = '数据') => message.success(`${name}导出任务已提交，请稍后在导出记录中下载`),
    notReady: (action = '该操作') => message.info(`${action}在原型中暂未实现`),
  };
}
