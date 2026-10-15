/**
 * 下载文本文件（导入模板）：Blob + a[download]，file:// 下同样可用。
 * 内容开头的 U+FEFF 会按 UTF-8 编码写成 BOM。
 */
export function downloadText(fileName: string, content: string, type = 'text/csv;charset=utf-8') {
  downloadBlob(fileName, new Blob([content], { type }));
}

/** 下载任意 Blob（如 xlsx 模板） */
export function downloadBlob(fileName: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // 延迟释放，避免个别浏览器在下载开始前 URL 已失效
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** 手机号展示：有区号时「区号 空格 手机号」 */
export const formatPhone = (prefix: string, phone: string) =>
  phone ? (prefix ? `${prefix} ${phone}` : phone) : '';
