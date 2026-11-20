import { useState } from 'react';
import { Button, Descriptions, Empty, Input, Radio, Select, Tag } from 'antd';
import {
  ApartmentOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  ContainerOutlined,
  PartitionOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import GeoMap from '@/components/GeoMap';
import excavatorImage from '@/assets/monitor-excavator.png';
import dumpTruckImage from '@/assets/monitor-dump-truck.png';
import graderImage from '@/assets/monitor-grader.png';
import defaultDeviceImage from '@/assets/monitor-device-default.png';
import { listMapDevices, type MapDevice } from '@/services/monitor/devices';
import { listProjects } from '@/services/project/projects';
import styles from './index.module.css';
function DeviceImage({ type }: { type: string }) {
  const source =
    type === '挖掘机'
      ? excavatorImage
      : type === '电动自卸车'
        ? dumpTruckImage
        : type === '平地机'
          ? graderImage
          : defaultDeviceImage;
  return <img className={styles.deviceImage} src={source} alt={type} />;
}
export default function MapMonitorPage() {
  const navigate = useNavigate();
  const [devices] = useState(listMapDevices);
  const [keyword, setKeyword] = useState('');
  const [project, setProject] = useState<string>();
  const [organization, setOrganization] = useState<string>('5656');
  const [type, setType] = useState<string>();
  const [running, setRunning] = useState<string>();
  const [online, setOnline] = useState('全部');
  const [selected, setSelected] = useState<MapDevice>();
  const [center, setCenter] = useState<[number, number]>();
  const filtered = devices.filter(
    (d) =>
      (!keyword ||
        [d.id, d.alias, d.asset].some((v) => v.toLowerCase().includes(keyword.toLowerCase()))) &&
      (!project || d.project === project) &&
      (!organization || d.organization === organization) &&
      (!type || d.type === type) &&
      (!running || d.running === running),
  );
  const rows = filtered.filter((d) => online === '全部' || d.online === (online === '在线'));
  const pick = (d: MapDevice) => {
    setSelected(d);
    setCenter([d.longitude, d.latitude]);
  };
  return (
    <div className={styles.mapPage}>
      <GeoMap
        center={center}
        points={rows.map((d) => ({
          id: d.id,
          longitude: d.longitude,
          latitude: d.latitude,
          label: d.id,
          online: d.online,
        }))}
        selected={selected?.id}
        onSelect={(id) => {
          const d = rows.find((d) => d.id === id);
          if (d) pick(d);
        }}
      >
        <div className={styles.mapFilters} onPointerDown={(e) => e.stopPropagation()}>
          <Input
            allowClear
            placeholder="设备编号/自编号/车牌号"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setSelected(undefined);
            }}
          />
          <Select
            allowClear
            placeholder="全部项目"
            value={project}
            options={listProjects().map((p) => ({ value: p.name }))}
            onChange={(v) => {
              setProject(v);
              setSelected(undefined);
            }}
          />
          <Select
            allowClear
            placeholder="所属组织"
            value={organization}
            options={[{ value: '5656' }]}
            onChange={(v) => {
              setOrganization(v);
              setSelected(undefined);
            }}
          />
          <Select
            allowClear
            placeholder="全部类型"
            value={type}
            options={[...new Set(devices.map((d) => d.type))].map((value) => ({ value }))}
            onChange={(v) => {
              setType(v);
              setSelected(undefined);
            }}
          />
          <Select
            allowClear
            placeholder="全部状态"
            value={running}
            options={['工作', '行驶', '怠速', '关机', '充电', '离线'].map((value) => ({ value }))}
            onChange={(v) => {
              setRunning(v);
              setSelected(undefined);
            }}
          />
        </div>
        <aside className={styles.deviceList} onPointerDown={(e) => e.stopPropagation()}>
          <Radio.Group
            className={styles.onlineTabs}
            optionType="button"
            value={online}
            onChange={(e) => {
              setOnline(e.target.value);
              setSelected(undefined);
            }}
            options={['全部', '在线', '离线'].map((value) => ({
              value,
              label: `${value}(${value === '全部' ? filtered.length : filtered.filter((d) => d.online === (value === '在线')).length})`,
            }))}
          />
          <div className={styles.deviceCards}>
            {rows.length ? (
              rows.map((d) => (
                <button
                  key={d.id}
                  className={`${styles.deviceCard} ${d.id === selected?.id ? styles.activeCard : ''}`}
                  onClick={() => pick(d)}
                >
                  <DeviceImage type={d.type} />
                  <div className={styles.deviceInfo}>
                    <div className={styles.deviceTitle}>
                      <strong title={d.id}>{d.id}</strong>
                      <Tag color={d.online ? 'green' : 'default'}>{d.online ? '在线' : '离线'}</Tag>
                      <Tag>{d.running}</Tag>
                    </div>
                    <p>
                      <ContainerOutlined /> {d.type}
                    </p>
                    <p>
                      <PartitionOutlined /> {d.project || '-'}
                    </p>
                    <p>
                      <ApartmentOutlined /> {d.organization}
                    </p>
                    <p>
                      <ClockCircleOutlined /> {d.updated}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <Empty description="暂无设备" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </div>
        </aside>
        {selected && rows.some((d) => d.id === selected.id) && (
          <section className={styles.mapPopup} onPointerDown={(e) => e.stopPropagation()}>
            <Button
              type="text"
              className={styles.popupClose}
              aria-label="关闭设备信息"
              icon={<CloseOutlined />}
              onClick={() => setSelected(undefined)}
            />
            <div className={styles.popupTitle}>
              <DeviceImage type={selected.type} />
              <div>
                <strong>{selected.alias || '-'}</strong>
                <p>
                  {selected.type} | {selected.id}
                </p>
              </div>
            </div>
            <Descriptions
              size="small"
              column={1}
              items={[
                { key: 'plate', label: '车牌号', children: selected.asset || '-' },
                {
                  key: 'status',
                  label: '设备状态',
                  children: (
                    <>
                      <Tag color={selected.online ? 'green' : 'default'}>
                        {selected.online ? '在线' : '离线'}
                      </Tag>
                      <Tag>{selected.running}</Tag>
                    </>
                  ),
                },
                { key: 'update', label: '数据更新时间', children: selected.updated },
                { key: 'ownership', label: '设备归属类型', children: selected.ownership || '-' },
                { key: 'project', label: '所在项目', children: selected.project || '-' },
                { key: 'org', label: '所属组织', children: selected.organization },
                { key: 'address', label: '所在地址', children: selected.address },
              ]}
            />
            <div className={styles.popupActions}>
              <Button
                type="primary"
                onClick={() => navigate(`/devices?device=${encodeURIComponent(selected.id)}`)}
              >
                查看详情
              </Button>
              <Button
                onClick={() =>
                  navigate(`/devices?device=${encodeURIComponent(selected.id)}&tab=历史轨迹`)
                }
              >
                历史轨迹
              </Button>
            </div>
          </section>
        )}
      </GeoMap>
    </div>
  );
}
