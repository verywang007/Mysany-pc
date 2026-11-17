import { useState } from 'react';
import { Alert, Button, Form, Input, Modal, Radio, Select, Space } from 'antd';
import type { Device } from '@/services/device/devices';
import styles from '../index.module.css';
interface Props {
  open: boolean;
  devices: Device[];
  onClose: () => void;
  onBind: (device: Device) => void;
}
export default function BindModal({ open, devices, onClose, onBind }: Props) {
  const [thirdParty, setThirdParty] = useState(false);
  const [verified, setVerified] = useState(false);
  const [form] = Form.useForm();
  const number = Form.useWatch('id', form);
  const bind = async () => {
    const values = await form.validateFields();
    onBind({
      id: values.id.trim(),
      type: values.type || '挖掘机',
      brand: values.brand || 'Sany',
      ownership: values.ownership || '',
      online: false,
      running: '离线',
      updated: '-',
      asset: '',
      alias: '',
      organization: '5656',
      project: '',
      contact: '',
      phone: '',
      supplier: '',
      dailyHours: 0,
      hours: 0,
      stops: [],
      maintenance: [],
    });
    form.resetFields();
    setVerified(false);
    onClose();
  };
  return (
    <Modal
      title="绑定设备"
      open={open}
      onCancel={onClose}
      onOk={bind}
      okText="确定"
      cancelText="取消"
      width={680}
      destroyOnClose
      okButtonProps={{ disabled: !thirdParty && !verified }}
    >
      <div className={styles.form}>
        <Alert
          type="warning"
          showIcon
          message="设备绑定需要系统人工审核，请尽快联系负责与您对接的业务人员进行审核。逾期未审核，则无法访问设备数据。"
        />
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item label="绑定设备类型" required>
            <Radio.Group
              value={thirdParty}
              onChange={(e) => {
                setThirdParty(e.target.value);
                setVerified(false);
              }}
              optionType="button"
              options={[
                { label: '三一设备', value: false },
                { label: '第三方设备', value: true },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="id"
            label={thirdParty ? '设备编码' : '设备编号'}
            rules={[
              { required: true, whitespace: true, message: '请输入设备编号' },
              {
                validator: (_, value) =>
                  devices.some((d) => d.id === value?.trim())
                    ? Promise.reject(new Error('该设备已绑定'))
                    : Promise.resolve(),
              },
            ]}
          >
            <Input placeholder="请输入" onChange={() => setVerified(false)} />
          </Form.Item>
          {!thirdParty && (
            <Space>
              <Button
                disabled={!number?.trim()}
                onClick={async () => {
                  await form.validateFields(['id']);
                  setVerified(true);
                }}
              >
                验证
              </Button>
              {verified && <span>设备编号验证通过（本地演示）</span>}
            </Space>
          )}
          {thirdParty && (
            <>
              <Form.Item name="brand" label="设备品牌" rules={[{ required: true }]}>
                <Select
                  placeholder="请选择"
                  options={['Sany', 'Caterpillar', 'Komatsu', '其他'].map((value) => ({ value }))}
                />
              </Form.Item>
              <Form.Item name="type" label="设备类型" rules={[{ required: true }]}>
                <Select
                  placeholder="请选择"
                  options={['挖掘机', '平地机', '电动自卸车', '起重机', '其他'].map((value) => ({
                    value,
                  }))}
                />
              </Form.Item>
              <Form.Item name="sn" label="终端SN码">
                <Input />
              </Form.Item>
              <Form.Item name="ownership" label="设备归属类型">
                <Select allowClear options={['自有', '租赁', '分包'].map((value) => ({ value }))} />
              </Form.Item>
            </>
          )}
        </Form>
      </div>
    </Modal>
  );
}
