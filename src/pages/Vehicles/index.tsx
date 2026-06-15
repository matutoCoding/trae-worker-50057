import { useState } from 'react';
import { useVehicleStore } from '@/store/vehicleStore';
import { useTaskStore } from '@/store/taskStore';
import { StatusBadge } from '@/components/StatusBadge';
import {
  Truck,
  Search,
  Filter,
  Settings,
  Wrench,
  Clock,
  Navigation,
  User,
} from 'lucide-react';
import type { VehicleStatus } from '@/types';

const statusFilters: { value: VehicleStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'idle', label: '空闲' },
  { value: 'on_duty', label: '执勤中' },
  { value: 'maintenance', label: '维修中' },
  { value: 'offline', label: '离线' },
];

export default function VehicleDispatch() {
  const { vehicles } = useVehicleStore();
  const { tasks } = useTaskStore();
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | 'all'>('all');
  const [searchText, setSearchText] = useState('');

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    const matchesSearch =
      searchText === '' ||
      vehicle.plateNo.includes(searchText) ||
      vehicle.model.includes(searchText) ||
      (vehicle.driverName && vehicle.driverName.includes(searchText));
    return matchesStatus && matchesSearch;
  });

  const getCurrentTask = (taskId?: string) => {
    if (!taskId) return null;
    return tasks.find((t) => t.id === taskId);
  };

  const stats = {
    total: vehicles.length,
    idle: vehicles.filter((v) => v.status === 'idle').length,
    onDuty: vehicles.filter((v) => v.status === 'on_duty').length,
    maintenance: vehicles.filter((v) => v.status === 'maintenance').length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">车辆总数</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
              <Truck className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">空闲车辆</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.idle}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <Truck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">执勤中</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.onDuty}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Navigation className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">维修中</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{stats.maintenance}</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
              <Wrench className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索车辆..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-64 h-10 pl-9 pr-4 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
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
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
          <Settings className="w-4 h-4" />
          车辆管理
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredVehicles.map((vehicle) => {
          const currentTask = getCurrentTask(vehicle.currentTaskId);
          return (
            <div
              key={vehicle.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      vehicle.status === 'idle'
                        ? 'bg-green-100'
                        : vehicle.status === 'on_duty'
                        ? 'bg-blue-100'
                        : vehicle.status === 'maintenance'
                        ? 'bg-orange-100'
                        : 'bg-gray-100'
                    }`}
                  >
                    <Truck
                      className={`w-6 h-6 ${
                        vehicle.status === 'idle'
                          ? 'text-green-600'
                          : vehicle.status === 'on_duty'
                          ? 'text-blue-600'
                          : vehicle.status === 'maintenance'
                          ? 'text-orange-600'
                          : 'text-gray-600'
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{vehicle.plateNo}</h3>
                    <p className="text-xs text-gray-500">{vehicle.model}</p>
                  </div>
                </div>
                <StatusBadge status={vehicle.status} />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    司机
                  </span>
                  <span className="text-gray-700 font-medium">
                    {vehicle.driverName || '未分配'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    里程
                  </span>
                  <span className="text-gray-700 font-medium">
                    {vehicle.currentMileage.toLocaleString()} km
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">载客量</span>
                  <span className="text-gray-700 font-medium">{vehicle.capacity} 人</span>
                </div>
              </div>

              {currentTask && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">当前任务</p>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-800">{currentTask.taskNo}</p>
                    <p className="text-xs text-blue-600 mt-1 line-clamp-1">
                      {currentTask.pickupAddress}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      逝者：{currentTask.deceased.name}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  上次保养：{vehicle.lastMaintenanceDate}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {filteredVehicles.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Truck className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>暂无车辆数据</p>
        </div>
      )}
    </div>
  );
}
