import { cn } from '@/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

interface StatusConfig {
  label: string;
  color: string;
}

const statusConfigMap: Record<string, StatusConfig> = {
  pending: { label: '待派发', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  dispatched: { label: '已派发', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  in_transit: { label: '接运中', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  arrived: { label: '已到达', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  transferring: { label: '交接中', color: 'bg-pink-100 text-pink-700 border-pink-200' },
  returning: { label: '返程中', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-700 border-green-200' },
  cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  idle: { label: '空闲', color: 'bg-green-100 text-green-700 border-green-200' },
  on_duty: { label: '执勤中', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  maintenance: { label: '维修中', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  offline: { label: '离线', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  on_duty_staff: { label: '在岗', color: 'bg-green-100 text-green-700 border-green-200' },
  off_duty: { label: '离岗', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  leave: { label: '请假', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  night_shift: { label: '夜班', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  empty: { label: '空置', color: 'bg-gray-100 text-gray-600 border-gray-200' },
  occupied: { label: '已占用', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  reserved: { label: '已预约', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  morning: { label: '早班', color: 'bg-sky-100 text-sky-700 border-sky-200' },
  afternoon: { label: '中班', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  night: { label: '夜班', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  day_off: { label: '休息', color: 'bg-gray-100 text-gray-600 border-gray-200' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfigMap[status] || { label: status, color: 'bg-gray-100 text-gray-700 border-gray-200' };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  );
}
