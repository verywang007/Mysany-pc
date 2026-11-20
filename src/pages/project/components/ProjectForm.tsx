import { useEffect, useState } from 'react';
import { App, Button, DatePicker, Form, Input, Modal, Select } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import GeoMap from '@/components/GeoMap';
import { listProjects, type Project } from '@/services/project/projects';
import styles from '../index.module.css';
type Values = Omit<Project, 'id' | 'created' | 'start' | 'plannedEnd' | 'actualEnd'> & {
  start: Dayjs;
  plannedEnd: Dayjs;
  actualEnd?: Dayjs;
};
export default function ProjectForm({
  open,
  project,
  onCancel,
  onSave,
}: {
  open: boolean;
  project?: Project;
  onCancel: () => void;
  onSave: (project: Project) => void;
}) {
  const [form] = Form.useForm<Values>();
  const { message } = App.useApp();
  const [coordinate, setCoordinate] = useState<[number, number]>();
  useEffect(() => {
    if (!open) return;
    form.resetFields();
    setCoordinate(project ? [project.longitude, project.latitude] : undefined);
    if (project)
      form.setFieldsValue({
        ...project,
        start: dayjs(project.start),
        plannedEnd: dayjs(project.plannedEnd),
        actualEnd: project.actualEnd ? dayjs(project.actualEnd) : undefined,
      });
  }, [open, project, form]);
  const save = async () => {
    const values = await form.validateFields().catch(() => undefined);
    if (!values) return;
    if (!coordinate) {
      message.warning('请在地图上选择项目坐标');
      return;
    }
    onSave({
      ...values,
      name: values.name.trim(),
      code: values.code?.trim() ?? '',
      description: values.description?.trim() ?? '',
      manager: values.manager?.trim() ?? '',
      id: project?.id ?? crypto.randomUUID(),
      created: project?.created ?? dayjs().format('YYYY-MM-DD HH:mm:ss'),
      start: values.start.format('YYYY-MM-DD'),
      plannedEnd: values.plannedEnd.format('YYYY-MM-DD'),
      actualEnd: values.actualEnd?.format('YYYY-MM-DD'),
      longitude: coordinate[0],
      latitude: coordinate[1],
    });
  };
  return (
    <Modal
      title={project ? '编辑项目' : '新建项目'}
      open={open}
      onCancel={onCancel}
      onOk={() => void save()}
      width={800}
      destroyOnClose
      className={styles.dialog}
    >
      <Form form={form} layout="vertical" className={styles.form}>
        <h3>基本信息</h3>
        <div className={styles.grid}>
          <Form.Item
            name="name"
            label="项目名称"
            rules={[{ required: true, whitespace: true, message: '请输入项目名称' }]}
          >
            <Input maxLength={100} placeholder="请输入项目名称" />
          </Form.Item>
          <Form.Item
            name="code"
            label="项目编码"
            rules={[
              {
                validator: (_, value: string) =>
                  value &&
                  listProjects().some((p) => p.id !== project?.id && p.code === value.trim())
                    ? Promise.reject(new Error('项目编码已存在'))
                    : Promise.resolve(),
              },
            ]}
          >
            <Input maxLength={100} placeholder="请输入项目编码（若填写则需唯一）" />
          </Form.Item>
          <Form.Item
            name="organization"
            label="所属组织"
            rules={[{ required: true, message: '请选择所属组织' }]}
          >
            <Select placeholder="请选择所属组织" options={[{ value: '5656', label: '5656' }]} />
          </Form.Item>
          <Form.Item name="manager" label="项目经理">
            <Input placeholder="请输入项目经理姓名" maxLength={50} />
          </Form.Item>
          <Form.Item
            name="start"
            label="开始日期"
            rules={[{ required: true, message: '请选择项目开始日期' }]}
          >
            <DatePicker placeholder="请选择项目开始日期" />
          </Form.Item>
          <Form.Item
            name="plannedEnd"
            label="项目计划完成日期"
            dependencies={['start']}
            rules={[
              { required: true, message: '请选择项目计划完成日期' },
              ({ getFieldValue }) => ({
                validator: (_, value: Dayjs) =>
                  value && value.isBefore(getFieldValue('start'), 'day')
                    ? Promise.reject(new Error('计划完成日期不能早于开始日期'))
                    : Promise.resolve(),
              }),
            ]}
          >
            <DatePicker placeholder="请选择项目计划完成日期" />
          </Form.Item>
          <Form.Item
            name="actualEnd"
            label="项目实际完成日期"
            tooltip="填写实际完成日期后，项目状态为已完成"
            dependencies={['start']}
            rules={[
              ({ getFieldValue }) => ({
                validator: (_, value: Dayjs) =>
                  value && value.isBefore(getFieldValue('start'), 'day')
                    ? Promise.reject(new Error('实际完成日期不能早于开始日期'))
                    : Promise.resolve(),
              }),
            ]}
          >
            <DatePicker placeholder="请选择实际完成日期" />
          </Form.Item>
        </div>
        <Form.Item name="description" label="项目描述">
          <Input.TextArea
            rows={3}
            maxLength={500}
            showCount
            placeholder="请输入项目描述（最多500字符）"
          />
        </Form.Item>
        <h3>地理位置信息</h3>
        <Form.Item name="region" label="地区" rules={[{ required: true, message: '请选择地区' }]}>
          <Select
            mode="tags"
            placeholder="请选择地区"
            options={[
              '中国',
              '湖南省',
              '长沙市',
              '北京市',
              '上海市',
              '广东省',
              '深圳市',
              '约旦',
            ].map((value) => ({ value }))}
          />
        </Form.Item>
        <Form.Item
          name="address"
          label="详细地址"
          rules={[{ required: true, whitespace: true, message: '请输入详细地址' }]}
        >
          <Input placeholder="请输入详细地址" maxLength={200} />
        </Form.Item>
        <Form.Item label="地图坐标" required>
          <div className={styles.coordinate}>
            {coordinate
              ? `${coordinate[0].toFixed(6)}, ${coordinate[1].toFixed(6)}`
              : '点击地图选择位置，或拖动地图调整位置'}
          </div>
          <div className={styles.map}>
            <GeoMap
              onPick={(lng, lat) => setCoordinate([lng, lat])}
              points={
                coordinate
                  ? [
                      {
                        id: 'project',
                        longitude: coordinate[0],
                        latitude: coordinate[1],
                        label: '项目位置',
                        online: true,
                      },
                    ]
                  : []
              }
            />
          </div>
          {coordinate && (
            <Button type="link" onClick={() => setCoordinate(undefined)}>
              重新选择位置
            </Button>
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
}
