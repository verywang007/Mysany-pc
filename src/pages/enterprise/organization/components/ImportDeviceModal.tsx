import { useState } from 'react';
import { Button, Table, Upload, type TableColumnsType } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import {
  buildImportPreview,
  deviceImportTemplate,
  type ImportRow,
  type OrgNode,
} from '@/services/enterprise/organization';
import { FALLBACK_IMPORT_FILE, IMPORT_ACCEPT, TEMPLATE_FILE_NAME } from '../constants';
import OrgModal from './OrgModal';
import styles from '../index.module.css';

type Row = ImportRow & { line: number };

const COLUMNS: TableColumnsType<Row> = [
  { title: '行号', dataIndex: 'line', width: '16%' },
  { title: '设备编号', dataIndex: 'code' },
  { title: '所属组织', dataIndex: 'orgName' },
  {
    title: '状态',
    key: 'status',
    width: '20%',
    render: () => <span className={styles.importOk}>成功</span>,
  },
];

const BOM = String.fromCharCode(0xfeff);

/** 下载模板（UTF-8 BOM）：Blob + a[download]，file:// 下也可用 */
function downloadTemplate() {
  const blob = new Blob([BOM + deviceImportTemplate()], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = TEMPLATE_FILE_NAME;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // 修正原型缺陷：原型 click 后立即 revokeObjectURL，部分浏览器会下载失败；这里延迟释放
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

interface Props {
  tree: OrgNode[];
  onCancel: () => void;
  onSave: (rows: ImportRow[]) => void;
}

/**
 * 导入设备（宽 870）。与原型一致：不解析文件内容，选择文件后按当前数据生成演示校验结果（失败恒为 0）；
 * 只能点「选择文件」选择（上传框本身不响应点击和拖放），选择后不能重新选择。
 */
export default function ImportDeviceModal({ tree, onCancel, onSave }: Props) {
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<ImportRow[]>([]);

  const pick = (file: File | undefined) => {
    setFileName(file?.name || FALLBACK_IMPORT_FILE);
    setRows(buildImportPreview(tree));
  };

  return (
    <OrgModal
      title="导入设备"
      width={870}
      onCancel={onCancel}
      footer={
        <>
          <Button onClick={onCancel}>取消</Button>
          {rows.length > 0 && (
            <Button type="primary" onClick={() => onSave(rows)}>
              保存导入
            </Button>
          )}
        </>
      }
    >
      <div className={styles.importTools}>
        <button type="button" className={styles.linkBtn} onClick={downloadTemplate}>
          下载导入模板
        </button>
      </div>
      {rows.length === 0 ? (
        <div className={styles.uploadBox}>
          <UploadOutlined className={styles.uploadIcon} />
          <p>拖放文件到此处或点击选择文件</p>
          <small>请下载标准的 Excel 模板，按照模板字段（设备编号、所属组织）填写后上传文件</small>
          <Upload
            accept={IMPORT_ACCEPT}
            showUploadList={false}
            openFileDialogOnClick
            beforeUpload={(file) => {
              pick(file);
              return false;
            }}
          >
            <Button>选择文件</Button>
          </Upload>
        </div>
      ) : (
        <>
          <div className={styles.importSummary}>
            文件 {fileName} 校验完成：成功 {rows.length} 条，失败 0 条
          </div>
          <div className={styles.modalTableWrap}>
            <Table<Row>
              className={styles.modalTable}
              rowKey="line"
              tableLayout="fixed"
              size="small"
              pagination={false}
              dataSource={rows.map((r, i) => ({ ...r, line: i + 2 }))}
              columns={COLUMNS}
            />
          </div>
        </>
      )}
    </OrgModal>
  );
}
