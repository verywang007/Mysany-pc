import { useEffect } from 'react';
import { DatePicker, Form, Input, Modal, Radio } from 'antd';
import dayjs from 'dayjs';
import type { AttendanceHoliday } from '@/services/personnel/attendance';
interface Values {
  name: string;
  dates: [dayjs.Dayjs, dayjs.Dayjs];
  type: AttendanceHoliday['type'];
  remark: string;
}
export default function HolidayForm({
  open,
  holiday,
  onCancel,
  onSave,
}: {
  open: boolean;
  holiday?: AttendanceHoliday;
  onCancel: () => void;
  onSave: (holiday: AttendanceHoliday) => void;
}) {
  const [form] = Form.useForm<Values>();
  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (holiday)
      form.setFieldsValue({ ...holiday, dates: [dayjs(holiday.start), dayjs(holiday.end)] });
  }, [open, holiday, form]);
  return (
    <Modal
      open={open}
      title={holiday ? '编辑节假日' : '添加节假日'}
      width={520}
      okText="保存"
      onCancel={onCancel}
      onOk={() => form.submit()}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ type: '法定节假日' }}
        onFinish={(v) =>
          onSave({
            id: holiday?.id ?? crypto.randomUUID(),
            name: v.name.trim(),
            start: v.dates[0].format('YYYY-MM-DD'),
            end: v.dates[1].format('YYYY-MM-DD'),
            type: v.type,
            remark: v.remark?.trim() ?? '',
          })
        }
      >
        <Form.Item
          label="节假日名称"
          name="name"
          rules={[{ required: true, whitespace: true, message: '请输入节假日名称' }]}
        >
          <Input placeholder="输入节假日名称" maxLength={100} />
        </Form.Item>
        <Form.Item
          label="起止时间"
          name="dates"
          rules={[{ required: true, message: '请选择节假日日期' }]}
        >
          <DatePicker.RangePicker
            placeholder={['年/月/日', '年/月/日']}
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item label="类型" name="type" rules={[{ required: true }]}>
          <Radio.Group optionType="button" options={['法定节假日', '公司福利假']} />
        </Form.Item>
        <Form.Item label="备注" name="remark">
          <Input.TextArea rows={3} placeholder="填写备注信息（可选）" maxLength={500} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
