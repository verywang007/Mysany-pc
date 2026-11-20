import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button, Space, Tooltip } from 'antd';
import { AimOutlined, FullscreenOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import styles from './index.module.css';
export interface MapPoint {
  id: string;
  longitude: number;
  latitude: number;
  label: ReactNode;
  online?: boolean;
}
interface Props {
  points?: MapPoint[];
  center?: [number, number];
  zoom?: number;
  selected?: string;
  onSelect?: (id: string) => void;
  onPick?: (lng: number, lat: number) => void;
  children?: ReactNode;
}
const project = (lng: number, lat: number, z: number) => ({
  x: ((lng + 180) / 360) * 256 * 2 ** z,
  y:
    ((1 - Math.asinh(Math.tan((Math.max(-85, Math.min(85, lat)) * Math.PI) / 180)) / Math.PI) / 2) *
    256 *
    2 ** z,
});
const unproject = (x: number, y: number, z: number): [number, number] => [
  (((((x / (256 * 2 ** z)) * 360) % 360) + 360) % 360) - 180,
  (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / (256 * 2 ** z)))) * 180) / Math.PI,
];
/** 无线上地图密钥，使用带来源标识的公开底图；交互坐标与瓦片采用相同投影。 */
export default function GeoMap({
  points = [],
  center,
  zoom = 3,
  selected,
  onSelect,
  onPick,
  children,
}: Props) {
  const root = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [level, setLevel] = useState(zoom);
  const [position, setPosition] = useState<[number, number]>(center ?? [65, 15]);
  const [failed, setFailed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const drag = useRef<{ x: number; y: number; origin: [number, number]; moved: boolean }>();
  useEffect(() => {
    if (!root.current) return;
    const observer = new ResizeObserver(([entry]) =>
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height }),
    );
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (center) setPosition(center);
  }, [center?.[0], center?.[1]]); // eslint-disable-line react-hooks/exhaustive-deps
  const origin = project(...position, level);
  const left = origin.x - size.width / 2;
  const top = origin.y - size.height / 2;
  const tiles = [];
  for (let x = Math.floor(left / 256); x <= Math.floor((left + size.width) / 256); x++)
    for (let y = Math.floor(top / 256); y <= Math.floor((top + size.height) / 256); y++) {
      if (y < 0 || y >= 2 ** level) continue;
      const tx = ((x % 2 ** level) + 2 ** level) % 2 ** level;
      tiles.push(
        <img
          draggable={false}
          alt=""
          key={`${level}/${x}/${y}`}
          style={{ left: x * 256 - left, top: y * 256 - top }}
          src={`https://tile.openstreetmap.org/${level}/${tx}/${y}.png`}
          onError={() => setFailed(true)}
        />,
      );
    }
  return (
    <div
      ref={root}
      className={`${styles.map} ${expanded ? styles.expanded : ''}`}
      aria-label="设备位置地图"
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest('button,a,input')) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        drag.current = { x: e.clientX, y: e.clientY, origin: position, moved: false };
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        if (Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y) > 4) d.moved = true;
        const p = project(...d.origin, level);
        setPosition(unproject(p.x - e.clientX + d.x, p.y - e.clientY + d.y, level));
      }}
      onPointerUp={(e) => {
        const d = drag.current;
        drag.current = undefined;
        if (d && !d.moved && onPick) {
          const r = e.currentTarget.getBoundingClientRect();
          onPick(...unproject(left + e.clientX - r.left, top + e.clientY - r.top, level));
        }
      }}
    >
      <div className={styles.tiles}>{tiles}</div>
      {points.map((point) => {
        const p = project(point.longitude, point.latitude, level);
        return (
          <button
            key={point.id}
            className={`${styles.marker} ${point.online ? styles.online : ''} ${selected === point.id ? styles.selected : ''}`}
            style={{ left: p.x - left, top: p.y - top }}
            onClick={() => onSelect?.(point.id)}
          >
            {point.label}
          </button>
        );
      })}
      {children}
      <Space direction="vertical" className={styles.tools}>
        <Tooltip title={expanded ? '退出全屏' : '全屏'}>
          <Button
            aria-label={expanded ? '退出全屏' : '全屏'}
            icon={<FullscreenOutlined />}
            onClick={() => setExpanded(!expanded)}
          />
        </Tooltip>
        <Tooltip title="回到初始视图">
          <Button
            aria-label="回到初始视图"
            icon={<AimOutlined />}
            onClick={() => {
              setPosition(center ?? [65, 15]);
              setLevel(zoom);
            }}
          />
        </Tooltip>
        <Button
          aria-label="放大地图"
          icon={<PlusOutlined />}
          disabled={level >= 17}
          onClick={() => setLevel(level + 1)}
        />
        <Button
          aria-label="缩小地图"
          icon={<MinusOutlined />}
          disabled={level <= 2}
          onClick={() => setLevel(level - 1)}
        />
      </Space>
      {failed && <div className={styles.error}>底图暂时无法加载，请检查网络</div>}
      <div className={styles.credit}>
        ©{' '}
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
          OpenStreetMap
        </a>
      </div>
    </div>
  );
}
