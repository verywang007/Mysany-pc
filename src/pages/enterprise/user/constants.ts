import type { XlsxSheet } from '@/utils/xlsx';
import type { DeviceScope, InviteStatus } from '@/services/enterprise/user';

/** 设备范围类型名称；查询区「设备类型」下拉的选项顺序同此 */
export const SCOPE_NAMES: Record<DeviceScope, string> = {
  '0': '全部设备',
  '1': '组织+项目',
  '2': '个人设备',
};

export const scopeName = (code: string) => SCOPE_NAMES[code as DeviceScope] ?? '';

/** 新增 / 编辑用户的区号 */
export const PHONE_PREFIXES = ['+86', '+49', '+62', '+65', '+66'];

/** 邀请用户的区号（原型只有 3 个） */
export const INVITE_PREFIXES = ['+86', '+49', '+62'];

export const PAGE_SIZES = [10, 20, 50];

export const INVITE_STATUS_TEXT: Record<InviteStatus, string> = {
  pending: '待验证',
  accepted: '已接受',
  rejected: '已拒绝',
  cancelled: '已取消',
};

export const INVITE_TIME_OPTIONS = ['全部时间', '今天', '最近7天', '最近30天'];

/** 姓名特殊字符黑名单：` ~ ! $ % ^ * | \ = ? ; : ' " < > { } [ ] / */
export const NAME_FORBIDDEN = /[`~!$%^*|\\=?;:'"<>{}[\]/]/;

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 密码强度：6–32 位，且小写字母 / 大写字母 / 数字 / 其他字符 4 类中至少 3 类 */
export function strongPassword(v: string): boolean {
  if (v.length < 6 || v.length > 32) return false;
  const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(v)).length;
  return kinds >= 3;
}

export const PASSWORD_RULE_TEXT = '密码需为6-32位，并包含至少3类字符';
export const PASSWORD_MISMATCH_TEXT = '两次输入的密码不一致';

/** 用户导入模板（原型如此：无 BOM、无示例行）；第 5 列为「用户编号」 */
export const USER_TEMPLATE = {
  fileName: '用户导入模板.csv',
  content: '姓名,国家区号,手机号,邮箱,用户编号,角色\n',
};

/** 设备分配导入模板（.xlsx，两个 sheet，均附示例行） */
export const ASSIGN_TEMPLATE: { fileName: string; sheets: XlsxSheet[] } = {
  fileName: '设备分配导入模板.xlsx',
  sheets: [
    {
      name: '设备分配',
      widths: [16, 16, 22, 14, 20],
      rows: [
        ['用户姓名', '用户编号', '所属组织', '型号', '设备编号'],
        ['xhh', 'U0001', '2603181012测试客户', '搅拌车', 'HPGJ1041000683'],
        ['xhh', 'U0001', '2603181012测试客户', '全路面起重机', 'AC0130CD0002'],
      ],
    },
    {
      name: '用户信息',
      widths: [16, 16],
      rows: [
        ['用户姓名', '用户编号'],
        ['xhh', 'U0001'],
      ],
    },
  ],
};

export const UPLOAD_ACCEPT = '.xlsx,.xls,.csv';

/** 原型弹窗宽度：默认 600；user-form 560、small 440、wide 920、records 1060 */
export const MODAL_WIDTH = { normal: 600, form: 560, small: 440, wide: 920, records: 1060 };
