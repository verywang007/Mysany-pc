import { Alert, Descriptions, Form, Input, Modal, Select, Typography } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import type { MonitorAlarm } from '@/services/monitor/alarms';
import styles from '../index.module.css';
interface Values {
  status: '已处理' | '已忽略';
  description: string;
}
export default function ProcessAlarm({
  rows,
  onCancel,
  onSave,
}: {
  rows: MonitorAlarm[];
  onCancel: () => void;
  onSave: (values: Values) => void;
}) {
  const [form] = Form.useForm<Values>();
  const batch = rows.length > 1;
  return (
    <Modal
      title={batch ? '批量处理预警' : '处理预警'}
      open
      onCancel={onCancel}
      width={900}
      okText="确认处理"
      onOk={() => {
        void form
          .validateFields()
          .then(onSave)
          .catch(() => undefined);
      }}
      footer={(_, { OkBtn, CancelBtn }) => (
        <div className={styles.modalFooter}>
          <Typography.Text type="secondary">
            <ClockCircleOutlined /> 处理时间将自动记录为当前时间
          </Typography.Text>
          <div>
            <CancelBtn /> <OkBtn />
          </div>
        </div>
      )}
    >
      {batch ? (
        <Alert type="info" showIcon message={`您选择了 ${rows.length} 条待处理预警`} />
      ) : (
        <>
          <h3>预警详情</h3>
          <section className={styles.section}>
            <Descriptions
              column={2}
              items={[
                { key: 'time', label: '预警时间', children: rows[0].time },
                { key: 'type', label: '预警类型', children: rows[0].type },
                { key: 'device', label: '设备编号', children: rows[0].device },
                { key: 'project', label: '所在项目', children: rows[0].project || '-' },
                { key: 'content', label: '预警内容', span: 2, children: rows[0].content },
              ]}
            />
          </section>
        </>
      )}
      <h3>处理信息</h3>
      <section className={styles.section}>
        <Form form={form} layout="vertical">
          <Form.Item
            name="status"
            label="处理状态"
            rules={[{ required: true, message: '请选择处理状态' }]}
          >
            <Select
              placeholder="请选择 处理状态"
              style={{ maxWidth: 400 }}
              options={[{ value: '已处理' }, { value: '已忽略' }]}
            />
          </Form.Item>
          <Form.Item
            name="description"
            label="处理说明"
            rules={[{ required: true, whitespace: true, message: '请输入处理说明' }]}
          >
            <Input.TextArea
              rows={4}
              maxLength={500}
              showCount
              placeholder="请详细说明处理过程和结果（建议包含：问题原因、处理措施、预防建议等）"
            />
          </Form.Item>
        </Form>
      </section>
    </Modal>
  );
}
