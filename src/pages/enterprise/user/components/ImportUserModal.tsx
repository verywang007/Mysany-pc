import { useState } from 'react';
import { App, Button, type TableProps } from 'antd';
import { previewUserImport, saveUserImport, type User } from '@/services/enterprise/user';
import { USER_TEMPLATE, MODAL_WIDTH } from '../constants';
import { downloadText } from '../utils';
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

type Row = User & { line: number };

const columns: TableProps<Row>['columns'] = [
  { title: '行号', dataIndex: 'line' },
  // 「用户名」「姓名」两列都显示 name；角色只显示第一个（原型如此）
  { title: '用户名', dataIndex: 'name', key: 'username' },
  { title: '姓名', dataIndex: 'name' },
  // 与导入模板第 5 列对应：用户编号取用户 id
  { title: '用户编号', dataIndex: 'id' },
  { title: '角色', dataIndex: 'roles', render: (v: string[]) => v[0] },
  { title: '状态', key: 'status', render: () => <StatusTag status="accepted" text="成功" /> },
];

/** 导入用户（弹窗标题为「导入」，原型如此）：选择任意文件都固定生成 2 条成功预览 */
export default function ImportUserModal({ onClose, onSaved }: Props) {
  const { message } = App.useApp();
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<User[]>([]);

  const pick = async (file: File) => {
    setFileName(file.name);
    setRows(await previewUserImport());
  };

  const save = async () => {
    await saveUserImport(rows);
    onClose();
    onSaved();
    message.success('用户导入成功');
  };

  return (
    <UmModal
      title="导入"
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
          onClick={() => downloadText(USER_TEMPLATE.fileName, USER_TEMPLATE.content)}
        >
          下载模板
        </Button>
      </div>
      {!rows.length ? (
        <UploadBox
          hint="请下载标准的 Excel 模板，按照模板格式填写用户数据后上传文件"
          onFile={pick}
        />
      ) : (
        <>
          <div className={styles.summary}>
            文件 {fileName} 校验完成：成功 {rows.length} 条，失败 0 条
          </div>
          <BoxTable<Row>
            columns={columns}
            dataSource={rows.map((r, i) => ({ ...r, line: i + 2 }))}
            rowKey="id"
            minWidth={850}
            height={350}
          />
        </>
      )}
    </UmModal>
  );
}
