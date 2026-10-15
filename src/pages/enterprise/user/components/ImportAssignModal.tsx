import { useState } from 'react';
import { App, Button, type TableProps } from 'antd';
import {
  previewAssignImport,
  saveAssignImport,
  type AssignImportRow,
} from '@/services/enterprise/user';
import { ASSIGN_TEMPLATE, MODAL_WIDTH } from '../constants';
import { buildXlsx } from '@/utils/xlsx';
import { downloadBlob } from '../utils';
import BoxTable from './BoxTable';
import { StatusTag } from './Tags';
import UmModal from './UmModal';
import UploadBox from './UploadBox';
import modalStyles from './modal.module.css';
import panelStyles from './panels.module.css';

const styles = { ...modalStyles, ...panelStyles };

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

type Row = AssignImportRow & { line: number };

const columns: TableProps<Row>['columns'] = [
  { title: '行号', dataIndex: 'line' },
  { title: '用户姓名', dataIndex: 'user' },
  // 「所属组织」取的是设备的所属组织（原型如此）
  { title: '所属组织', dataIndex: 'org' },
  { title: '型号', dataIndex: 'model' },
  { title: '设备编号', dataIndex: 'code' },
  { title: '状态', key: 'status', render: () => <StatusTag status="accepted" text="成功" /> },
];

/**
 * 导入分配（设备 → 用户）：不解析文件，取当前前 2 个用户依次配设备生成预览。
 * 用户列表为空时生成 0 行，停留在上传框，无提示（原型如此）。
 */
export default function ImportAssignModal({ onClose, onSaved }: Props) {
  const { message } = App.useApp();
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<AssignImportRow[]>([]);

  const pick = async (file: File) => {
    setFileName(file.name);
    setRows(await previewAssignImport());
  };

  const save = async () => {
    const done = await saveAssignImport(rows);
    onClose();
    onSaved();
    message.success(`设备分配导入成功，共处理 ${done} 条记录`);
  };

  return (
    <UmModal
      title="导入分配"
      width={MODAL_WIDTH.wide}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>取消</Button>
          {rows.length > 0 && (
            <Button type="primary" onClick={save}>
              保存导入
            </Button>
          )}
        </>
      }
    >
      <div className={styles.importTools}>
        <Button
          type="link"
          className={styles.link}
          onClick={() => downloadBlob(ASSIGN_TEMPLATE.fileName, buildXlsx(ASSIGN_TEMPLATE.sheets))}
        >
          下载导入模板
        </Button>
      </div>
      {!rows.length ? (
        <UploadBox onFile={pick} />
      ) : (
        <>
          <div className={styles.summary}>
            文件 {fileName} 校验完成：成功 {rows.length} 条，失败 0 条
          </div>
          <BoxTable<Row>
            columns={columns}
            dataSource={rows.map((r, i) => ({ ...r, line: i + 2 }))}
            rowKey="line"
            minWidth={760}
            height={350}
          />
        </>
      )}
    </UmModal>
  );
}
