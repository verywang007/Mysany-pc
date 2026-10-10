import { Button, Upload } from 'antd';
import { UPLOAD_ACCEPT } from '../constants';
import modalStyles from './modal.module.css';
import panelStyles from './panels.module.css';

const styles = { ...modalStyles, ...panelStyles };

interface Props {
  /** 上传框小字 */
  hint: string;
  onFile: (file: File) => void;
}

/**
 * 导入上传框：只取文件名，不解析内容、不校验大小（原型如此）。
 * 修正原型缺陷：原型文案写「拖放文件到此处」但未实现拖放，这里用 Upload.Dragger 支持拖放，点击整个上传框也可选择文件。
 */
export default function UploadBox({ hint, onFile }: Props) {
  return (
    <Upload.Dragger
      className={styles.upload}
      accept={UPLOAD_ACCEPT}
      multiple={false}
      showUploadList={false}
      beforeUpload={(file) => {
        onFile(file);
        return false;
      }}
    >
      <svg
        className={styles.uploadIcon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M12 16V4m0 0L7 9m5-5 5 5" />
        <path d="M4 15v5h16v-5" />
      </svg>
      <p>拖放文件到此处或点击选择文件</p>
      <small>{hint}</small>
      <Button>选择文件</Button>
    </Upload.Dragger>
  );
}
