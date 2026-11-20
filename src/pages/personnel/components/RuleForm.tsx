import { useEffect } from 'react';
import { Checkbox, Form, Input, InputNumber, Modal, Radio, Select, TimePicker } from 'antd';
import dayjs from 'dayjs';
import {
  attendanceOptions,
  type AttendanceRule,
  type PunchMethod,
} from '@/services/personnel/attendance';
import { listProjects } from '@/services/project/projects';
import styles from '../index.module.css';
type RuleValues = Omit<AttendanceRule, 'id' | 'onWindow' | 'offWindow'> & {
  onWindow: [dayjs.Dayjs, dayjs.Dayjs];
  offWindow: [dayjs.Dayjs, dayjs.Dayjs];
};
const time = (value: string) => dayjs(`2000-01-01T${value}:00`);
const methods: { value: PunchMethod; title: string; description: string }[] = [
  { value: 'phone', title: '手机打卡', description: '支持GPS定位打卡' },
  { value: 'project', title: '项目区域', description: '指定项目范围作为考勤区域' },
  {
    value: 'device',
    title: '手机+设备打卡',
    description: '需同时验证手机位置与作业设备距离（<1km）',
  },
];
export default function RuleForm({
  open,
  rule,
  onCancel,
  onSave,
}: {
  open: boolean;
  rule?: AttendanceRule;
  onCancel: () => void;
  onSave: (rule: AttendanceRule) => void;
}) {
  const [form] = Form.useForm<RuleValues>();
  const type = Form.useWatch('type', form);
  const chosenMethods = Form.useWatch('methods', form) as PunchMethod[] | undefined;
  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (rule)
      form.setFieldsValue({
        ...rule,
        onWindow: rule.onWindow.map(time) as [dayjs.Dayjs, dayjs.Dayjs],
        offWindow: rule.offWindow.map(time) as [dayjs.Dayjs, dayjs.Dayjs],
      });
  }, [open, rule, form]);
  const save = (values: RuleValues) =>
    onSave({
      ...values,
      id: rule?.id ?? crypto.randomUUID(),
      name: values.name.trim(),
      // 弹性工时隐藏时间窗口，保留完整规则结构，避免保存时读取未注册字段。
      onWindow: (
        values.onWindow ?? [time(rule?.onWindow[0] ?? '08:00'), time(rule?.onWindow[1] ?? '09:00')]
      ).map((t) => t.format('HH:mm')) as [string, string],
      offWindow: (
        values.offWindow ?? [
          time(rule?.offWindow[0] ?? '18:00'),
          time(rule?.offWindow[1] ?? '00:00'),
        ]
      ).map((t) => t.format('HH:mm')) as [string, string],
      lateMinutes: values.lateMinutes ?? rule?.lateMinutes ?? 5,
      earlyMinutes: values.earlyMinutes ?? rule?.earlyMinutes ?? 5,
      dailyHours: values.dailyHours ?? rule?.dailyHours ?? 0,
      projects: values.methods.includes('project') ? values.projects : [],
    });
  return (
    <Modal
      title={rule ? '编辑规则' : '新建规则'}
      width={520}
      open={open}
      onCancel={onCancel}
      okText="保存规则"
      onOk={() => form.submit()}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        className={styles.ruleForm}
        onFinish={save}
        initialValues={{
          type: 'fixed',
          onWindow: [time('08:00'), time('09:00')],
          offWindow: [time('18:00'), time('00:00')],
          lateMinutes: 5,
          earlyMinutes: 5,
          weekdays: [1, 2, 3, 4, 5],
          dailyHours: 0,
          methods: [],
          projects: [],
          watermark: false,
        }}
      >
        <h3>基本信息</h3>
        <section className={styles.rulePanel}>
          <Form.Item
            name="name"
            label="规则名称"
            rules={[{ required: true, whitespace: true, message: '请输入规则名称' }]}
          >
            <Input placeholder="请输入规则名称" maxLength={100} />
          </Form.Item>
          <Form.Item
            name="organizations"
            label="适用对象"
            rules={[{ required: true, type: 'array', min: 1, message: '请输入适用对象' }]}
          >
            <Select
              mode="multiple"
              showSearch
              placeholder="请选择组织"
              options={attendanceOptions().organizations.map((value) => ({ value }))}
            />
          </Form.Item>
          <Form.Item name="type" label="规则类型" rules={[{ required: true }]}>
            <Radio.Group
              optionType="button"
              className={styles.ruleTypes}
              options={[
                { value: 'fixed', label: '固定工时' },
                { value: 'flexible', label: '弹性工时' },
              ]}
            />
          </Form.Item>
          {type !== 'flexible' ? (
            <div className={styles.timeGrid}>
              <Form.Item
                name="onWindow"
                label="上班"
                rules={[{ required: true, message: '请选择上班时间' }]}
              >
                <TimePicker.RangePicker
                  format="HH:mm"
                  order={false}
                  placeholder={['上班时间', '下班时间']}
                />
              </Form.Item>
              <Form.Item name="lateMinutes" label="允许迟到" rules={[{ required: true }]}>
                <InputNumber min={0} max={1440} precision={0} addonAfter="分钟" />
              </Form.Item>
              <Form.Item
                name="offWindow"
                label="下班"
                rules={[{ required: true, message: '请选择下班时间' }]}
              >
                <TimePicker.RangePicker
                  format="HH:mm"
                  order={false}
                  placeholder={['上班时间', '下班时间']}
                />
              </Form.Item>
              <Form.Item name="earlyMinutes" label="允许早退" rules={[{ required: true }]}>
                <InputNumber min={0} max={1440} precision={0} addonAfter="分钟" />
              </Form.Item>
            </div>
          ) : (
            <Form.Item
              name="dailyHours"
              label="每日工时"
              rules={[
                { required: true, type: 'number', min: 0.01, max: 24, message: '请输入每日工时' },
              ]}
            >
              <InputNumber min={0} max={24} precision={2} addonAfter="小时" />
            </Form.Item>
          )}
          <Form.Item
            name="weekdays"
            label="工作日设置"
            rules={[{ required: true, type: 'array', min: 1, message: '请至少选择一个工作日' }]}
          >
            <Checkbox.Group
              className={styles.weekdays}
              options={['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((label, i) => ({
                label,
                value: i + 1,
              }))}
            />
          </Form.Item>
        </section>
        <h3>打卡方式</h3>
        <section className={styles.rulePanel}>
          <Form.Item
            name="methods"
            label="选择打卡方式"
            rules={[{ required: true, type: 'array', min: 1, message: '请至少选择一种打卡方式' }]}
          >
            <Checkbox.Group className={styles.methods}>
              {methods.map((m) => (
                <Checkbox value={m.value} key={m.value}>
                  <strong>{m.title}</strong>
                  <p>{m.description}</p>
                </Checkbox>
              ))}
            </Checkbox.Group>
          </Form.Item>
          {chosenMethods?.includes('project') && (
            <Form.Item
              name="projects"
              rules={[{ required: true, type: 'array', min: 1, message: '请选择关联项目' }]}
            >
              <Select
                mode="multiple"
                placeholder="请选择关联项目"
                options={listProjects().map((p) => ({ value: p.name }))}
              />
            </Form.Item>
          )}
        </section>
        <h3>安全与高级设置</h3>
        <section className={styles.rulePanel}>
          <Form.Item
            name="watermark"
            label="安全验证"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value: boolean) =>
                  value
                    ? Promise.resolve()
                    : Promise.reject(new Error('请至少选择一种安全验证方式')),
              },
            ]}
            required
          >
            <Checkbox>拍照水印</Checkbox>
          </Form.Item>
        </section>
      </Form>
    </Modal>
  );
}
