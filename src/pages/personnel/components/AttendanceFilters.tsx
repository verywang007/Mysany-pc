import { Select } from 'antd';
import { attendanceOptions, type AttendanceFilter } from '@/services/personnel/attendance';
interface Props {
  order?: ('organization' | 'role' | 'status')[];
  value: AttendanceFilter;
  onChange: (filter: AttendanceFilter) => void;
}
export default function AttendanceFilters({
  value,
  onChange,
  order = ['organization', 'role', 'status'],
}: Props) {
  const options = attendanceOptions();
  const definitions = {
    organization: { placeholder: '全部组织', options: options.organizations },
    role: { placeholder: '全部角色', options: options.roles },
    status: { placeholder: '全部状态', options: options.statuses },
  };
  return (
    <>
      {order.map((key) => (
        <Select
          key={key}
          allowClear
          showSearch
          placeholder={definitions[key].placeholder}
          value={value[key]}
          options={definitions[key].options.map((value) => ({ value }))}
          onChange={(selected: string | undefined) => onChange({ ...value, [key]: selected })}
        />
      ))}
    </>
  );
}
