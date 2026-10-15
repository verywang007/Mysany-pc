/** 工作区页签 */
export type OrgTab = 'members' | 'devices';

export const ORG_TABS: { label: string; value: OrgTab }[] = [
  { label: '组织成员', value: 'members' },
  { label: '设备分配', value: 'devices' },
];

/** 主列表每页条数 */
export const PAGE_SIZES = [10, 20, 50];
/** 弹窗内分页每页条数（与原型一致仅两档） */
export const MODAL_PAGE_SIZES = [10, 20];

export const NAME_MAX = 64;
export const DESC_MAX = 200;

/** 组织名称禁止字符：` ~ ! $ % ^ * | \ = ? ; : ' " < > { } [ ] / */
export const NAME_FORBIDDEN = /[`~!$%^*|\\=?;:'"<>{}[\]/]/;

/**
 * 组织名称校验（保存时按顺序，命中一条即停）。
 * 返回错误文案与是否给输入框加红框（与原型一致只有空值加红框）。
 */
export function validateOrgName(name: string): { msg: string; bad: boolean } | null {
  if (!name) return { msg: '请输入组织名称', bad: true };
  if (name.length > NAME_MAX) return { msg: '组织名称不能超过 64 个字符', bad: false };
  if (NAME_FORBIDDEN.test(name)) return { msg: '组织名称不能包含特殊字符', bad: false };
  return null;
}

/** 设备导入模板文件名 */
export const TEMPLATE_FILE_NAME = '设备导入模板.xlsx';
/** 未取到文件名时的回退 */
export const FALLBACK_IMPORT_FILE = '设备导入模板.xlsx';
export const IMPORT_ACCEPT = '.xlsx,.xls,.csv';

/** 轻提示停留时间（秒），原型 2600ms */
export const TOAST_SECONDS = 2.6;
