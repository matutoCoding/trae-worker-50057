import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaskStore } from '@/store/taskStore';
import { useVehicleStore } from '@/store/vehicleStore';
import { useStaffStore } from '@/store/staffStore';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDateTime, roleMap } from '@/utils';
import { Plus, Search, Filter, Clock, MapPin, Phone, User, Calendar } from 'lucide-react';
import type { TaskStatus } from '@/types';

const statusFilters: { value: TaskStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待派发' },
  { value: 'dispatched', label: '已派发' },
  { value: 'in_transit', label: '接运中' },
  { value: 'arrived', label: '已到达' },
  { value: 'transferring', label: '交接中' },
  { value: 'returning', label: '返程中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
];

export default function TaskList() {
  const navigate = useNavigate();
  const { tasks } = useTaskStore();
  const { vehicles } = useVehicleStore();
  const { staffList } = useStaffStore();
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [searchText, setSearchText] = useState('');

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesSearch =
      searchText === '' ||
      task.deceased.name.includes(searchText) ||
      task.family.name.includes(searchText) ||
      task.pickupAddress.includes(searchText) ||
      task.taskNo.includes(searchText);
    return matchesStatus && matchesSearch;
  });

  const getVehicleInfo = (vehicleId?: string) => {
    if (!vehicleId) return null;
    return vehicles.find((v) => v.id === vehicleId);
  };

  const getStaffInfo = (staffId?: string) => {
    if (!staffId) return null;
    return staffList.find((s) => s.id === staffId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索任务..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-72 h-10 pl-9 pr-4 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
            />
          </div>
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
            <Filter className="w-4 h-4 text-gray-400 ml-2" />
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  statusFilter === filter.value
                    ? 'bg-amber-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => navigate('/tasks/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium shadow-sm"
        >
          <Plus className="w-5 h-5" />
          新建任务
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">任务编号</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">逝者信息</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">家属信息</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">接运地址</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">车辆/人员</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">预约时间</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">状态</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTasks.map((task) => {
                const vehicle = getVehicleInfo(task.vehicleId);
                const driver = getStaffInfo(task.driverId);
                const assistant = getStaffInfo(task.assistantId);
                return (
                  <tr
                    key={task.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/tasks/${task.id}`)}
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-600">{task.taskNo}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-slate-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {task.deceased.name}
                            <span className="text-gray-500 ml-2 text-sm">
                              {task.deceased.gender === 'male' ? '男' : '女'} · {task.deceased.age}岁
                            </span>
                          </p>
                          <p className="text-sm text-gray-500">{task.deceased.causeOfDeath}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{task.family.name}</p>
                        <p className="text-sm text-gray-500">
                          {task.family.relation} · {task.family.phone}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2 max-w-xs">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600 line-clamp-2">{task.pickupAddress}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {vehicle ? (
                        <div>
                          <p className="text-sm font-medium text-gray-800">{vehicle.plateNo}</p>
                          <p className="text-xs text-gray-500">
                            {driver?.name || '未分配'} / {assistant?.name || '未分配'}
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">未分配</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{formatDateTime(task.scheduledTime)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/tasks/${task.id}`);
                        }}
                        className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                      >
                        查看详情
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredTasks.length === 0 && (
          <div className="py-16 text-center text-gray-400">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>暂无任务数据</p>
          </div>
        )}
      </div>
    </div>
  );
}
