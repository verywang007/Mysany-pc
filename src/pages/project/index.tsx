import { useState } from 'react';
import {
  App,
  Button,
  Descriptions,
  Drawer,
  Empty,
  Input,
  Pagination,
  Select,
  Space,
  Table,
  Tag,
} from 'antd';
import { ExportOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { exportCsv, listDevices } from '@/services/device/devices';
import {
  listProjects,
  projectStatus,
  saveProjects,
  type Project,
} from '@/services/project/projects';
import ProjectForm from './components/ProjectForm';
import styles from './index.module.css';
export default function ProjectsPage() {
  const { message, modal } = App.useApp();
  const [projects, setProjects] = useState(listProjects);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<string>();
  const [organization, setOrganization] = useState<string>();
  const [editing, setEditing] = useState<Project>();
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<Project>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const devices = listDevices();
  const rows = projects.filter(
    (p) =>
      (!keyword ||
        [p.name, p.code].some((s) => s?.toLowerCase().includes(keyword.toLowerCase()))) &&
      (!status || projectStatus(p) === status) &&
      (!organization || p.organization === organization),
  );
  const commit = (next: Project[]) => {
    saveProjects(next);
    setProjects(next);
  };
  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <Input
          className={styles.search}
          prefix={<SearchOutlined />}
          allowClear
          placeholder="请输入项目名称或编码"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setPage(1);
          }}
        />
        <Select
          allowClear
          placeholder="项目状态"
          value={status}
          options={['进行中', '已完成'].map((value) => ({ value }))}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        />
        <Select
          allowClear
          placeholder="所属组织"
          value={organization}
          options={[{ value: '5656' }]}
          onChange={(v) => {
            setOrganization(v);
            setPage(1);
          }}
        />
        <Space className={styles.actions}>
          <Button
            disabled={!rows.length}
            icon={<ExportOutlined />}
            onClick={() =>
              exportCsv(
                '项目列表',
                [
                  '项目名称',
                  '项目编码',
                  '所属组织',
                  '项目状态',
                  '在场设备数',
                  '项目地址',
                  '项目周期',
                  '创建日期',
                ],
                rows.map((p) => [
                  p.name,
                  p.code ?? '',
                  p.organization,
                  projectStatus(p),
                  devices.filter((d) => d.project === p.name).length,
                  p.address,
                  `${p.start} ~ ${p.plannedEnd}`,
                  p.created,
                ]),
              )
            }
          >
            导出
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditing(undefined);
              setOpen(true);
            }}
          >
            新增项目
          </Button>
        </Space>
      </div>
      <Table<Project>
        rowKey="id"
        bordered
        dataSource={rows.slice((page - 1) * pageSize, page * pageSize)}
        scroll={{ x: 1250 }}
        locale={{
          emptyText: <Empty description="无结果" image={Empty.PRESENTED_IMAGE_SIMPLE} />,
        }}
        pagination={false}
        columns={[
          {
            title: '项目名称',
            dataIndex: 'name',
            width: 200,
            render: (_, p) => (
              <Button type="link" onClick={() => setDetail(p)}>
                {p.name}
              </Button>
            ),
          },
          { title: '所属组织', dataIndex: 'organization', width: 140 },
          {
            title: '项目状态',
            width: 110,
            render: (_, p) => (
              <Tag color={projectStatus(p) === '进行中' ? 'blue' : 'default'}>
                {projectStatus(p)}
              </Tag>
            ),
          },
          {
            title: '在场设备数',
            width: 130,
            sorter: (a, b) =>
              devices.filter((d) => d.project === a.name).length -
              devices.filter((d) => d.project === b.name).length,
            render: (_, p) => devices.filter((d) => d.project === p.name).length,
          },
          { title: '项目地址', dataIndex: 'address', ellipsis: true },
          { title: '项目周期', width: 220, render: (_, p) => `${p.start} ~ ${p.plannedEnd}` },
          { title: '创建日期', dataIndex: 'created', width: 180 },
          {
            title: '操作',
            width: 150,
            fixed: 'right',
            render: (_, p) => (
              <Space>
                <Button
                  type="link"
                  onClick={() => {
                    setEditing(p);
                    setOpen(true);
                  }}
                >
                  编辑
                </Button>
                <Button
                  type="link"
                  danger
                  onClick={() =>
                    modal.confirm({
                      title: '删除项目',
                      content: `确定删除项目「${p.name}」？`,
                      onOk: () => {
                        commit(projects.filter((x) => x.id !== p.id));
                        message.success('项目已删除');
                      },
                    })
                  }
                >
                  删除
                </Button>
              </Space>
            ),
          },
        ]}
      />
      <Pagination
        className={styles.pagination}
        current={page}
        pageSize={pageSize}
        total={rows.length}
        showSizeChanger
        showQuickJumper
        onChange={(p, size) => {
          setPage(p);
          setPageSize(size);
        }}
        showTotal={(n, r) => `显示第 ${n ? r[0] : 0} 到 ${n ? r[1] : 0} 条，共 ${n} 条记录`}
      />
      <ProjectForm
        open={open}
        project={editing}
        onCancel={() => setOpen(false)}
        onSave={(p) => {
          commit(
            editing ? projects.map((item) => (item.id === p.id ? p : item)) : [p, ...projects],
          );
          setOpen(false);
          message.success(editing ? '项目已更新' : '项目已创建');
        }}
      />
      <Drawer title="项目详情" open={!!detail} width={700} onClose={() => setDetail(undefined)}>
        {detail && (
          <>
            <Descriptions
              column={2}
              items={[
                { key: 'name', label: '项目名称', children: detail.name },
                { key: 'code', label: '项目编码', children: detail.code || '-' },
                { key: 'org', label: '所属组织', children: detail.organization },
                { key: 'manager', label: '项目经理', children: detail.manager || '-' },
                { key: 'status', label: '项目状态', children: projectStatus(detail) },
                { key: 'start', label: '开始日期', children: detail.start },
                { key: 'end', label: '项目计划完成日期', children: detail.plannedEnd },
                { key: 'actual', label: '项目实际完成日期', children: detail.actualEnd || '-' },
                {
                  key: 'address',
                  label: '项目地址',
                  span: 2,
                  children: `${detail.region.join(' ')} ${detail.address}`,
                },
                {
                  key: 'description',
                  label: '项目描述',
                  span: 2,
                  children: detail.description || '-',
                },
              ]}
            />
            <h3>在场设备</h3>
            <Table
              rowKey="id"
              dataSource={devices.filter((d) => d.project === detail.name)}
              columns={[
                { title: '设备编号', dataIndex: 'id' },
                { title: '设备类型', dataIndex: 'type' },
              ]}
            />
          </>
        )}
      </Drawer>
    </div>
  );
}
