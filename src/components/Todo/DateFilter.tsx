import { DateFilter } from '../../types';
import { DatePicker, Space, Typography } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

interface DateFilterProps {
  onFilterChange: (filters: DateFilter) => void;
  filters: DateFilter;
}

export function DateFilterComponent({ onFilterChange, filters }: DateFilterProps) {
  const handleChange = (field: keyof DateFilter, value: dayjs.Dayjs | null) => {
    onFilterChange({
      ...filters,
      [field]: value ? value.format('YYYY-MM-DD') : undefined
    });
  };

  return (
    <Space className="date-filter" size="middle">
      <Space size="small">
        <Text type="secondary"><CalendarOutlined /> Due From:</Text>
        <DatePicker
          value={filters.startDate ? dayjs(filters.startDate) : null}
          onChange={(value) => handleChange('startDate', value)}
          placeholder="Start date"
          allowClear
        />
      </Space>

      <Space size="small">
        <Text type="secondary"><CalendarOutlined /> Due To:</Text>
        <DatePicker
          value={filters.endDate ? dayjs(filters.endDate) : null}
          onChange={(value) => handleChange('endDate', value)}
          placeholder="End date"
          allowClear
        />
      </Space>
    </Space>
  );
}
