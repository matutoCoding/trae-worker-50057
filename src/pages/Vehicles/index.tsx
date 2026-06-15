import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVehicleStore } from '@/store/vehicleStore';
import { useTaskStore } from '@/store/taskStore';
import { StatusBadge } from '@/components/StatusBadge';
import { taskStatusMap, formatDateTime } from '@/utils';
import {
  Truck,
  Search,
  Wrench,
  Clock,
  Navigation,
  User,
  MapPin,
  ExternalLink,
  Settings,
} from 'lucide-react';
import type { VehicleStatus, Task } from '@/types';

export default function VehicleDispatch() {
  const navigate = useNavigate();
  const { vehicles } = useVehicleStore();
  const { tasks } = useTaskStore();
  const [searchText, setSearchText] = useState('');

  const idleVehicles = vehicles.filter((v) => v.status === 'idle');
  const onDutyVehicles = vehicles.filter((v) => v.status === 'on_duty');
  const maintenanceVehicles = vehicles.filter((v) => v.status === 'maintenance');
  const offlineVehicles = vehicles.filter((v) => v.status === 'offline');

  const getCurrentTask = (taskId?: string): Task | undefined => {
    if (!taskId) return undefined;
    return tasks.find((t) => t.id === taskId);
  };

  const filterBySearch = (list: typeof vehicles) => {
    if (!searchText) return list;
    return list.filter(
      (v) =>
        v.plateNo.includes(searchText) ||
        v.model.includes(searchText) ||
        (v.driverName && v.driverName.includes(searchText))
    );
  };

  const handleTaskClick = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/tasks/${taskId}`);
  };

  const getStageLabel = (task: Task): string => {
    const config = taskStatusMap[task.status];
    return config?.label || task.status;
  };

  const VehicleCard = ({ vehicle, showTask = false }: { vehicle: typeof vehicles[0]; showTask?: boolean }) => {
    const currentTask = showTask ? getCurrentTask(vehicle.currentTaskId) : undefined;

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
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
                className={`w-5 h-5 ${
                  vehicle.status === 'idle'
                    ? 'text-green-600'
                    : vehicle.status === 'on_duty'
                    ? 'text-blue-600'
                    : vehicle.status === 'maintenance'
                    ? 'text-orange-600'
                    : 'text-gray-500'
                }`}
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">{vehicle.plateNo}</h3>
              <p className="text-xs text-gray-500">{vehicle.model}</p>
            </div>
          </div>
          <StatusBadge status={vehicle.status} />
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 flex items-center gap-1">
              <User className="w-3 h-3" />
              司机
            </span>
            <span className="text-gray-700 font-medium">
              {vehicle.driverName || '未分配'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              总里程
            </span>
            <span className="text-gray-700 font-medium">
              {vehicle.currentMileage.toLocaleString()} km
            </span>
          </div>
        </div>

        {currentTask && (
          <div
            onClick={(e) => handleTaskClick(currentTask.id, e)}
            className="mt-3 pt-3 border-t border-gray-100 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">当前任务</span>
              <div className="flex items-center gap-1 text-blue-500 hover:text-blue-600">
                <ExternalLink className="w-3 h-3" />
                <span className="text-xs">查看</span>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">
                  {currentTask.taskNo}
                </span>
                <StatusBadge status={currentTask.status} />
              </div>
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <User className="w-3 h-3" />
                逝者：{currentTask.deceased.name}
              </div>
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <Navigation className="w-3 h-3" />
                当前阶段：{getStageLabel(currentTask)}
              </div>
              <div className="flex items-center gap-1 text-xs text-blue-600 truncate">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{currentTask.pickupAddress}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const SectionHeader = ({
    title,
    count,
    icon: Icon,
    colorClass,
  }: {
    title: string;
    count: number;
    icon: typeof Truck;
    colorClass: string;
  }) => (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="font-medium text-gray-800">{title}</span>
        <span className="text-sm text-gray-500">({count})</span>
      </div>
    </div>
  );

  const filteredIdle = filterBySearch(idleVehicles);
  const filteredOnDuty = filterBySearch(onDutyVehicles);
  const filteredMaintenance = filterBySearch(maintenanceVehicles);
  const filteredOffline = filterBySearch(offlineVehicles);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">车辆调度台</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索车牌号、车型、司机..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-64 h-9 pl-9 pr-4 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
            <Settings className="w-4 h-4" />
            车辆管理
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredOnDuty.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <SectionHeader
              title="执勤中"
              count={filteredOnDuty.length}
              icon={Navigation}
              colorClass="bg-blue-100 text-blue-600"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredOnDuty.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} showTask />
              ))}
            </div>
          </div>
        )}

        {filteredIdle.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <SectionHeader
              title="空闲车辆"
              count={filteredIdle.length}
              icon={Truck}
              colorClass="bg-green-100 text-green-600"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredIdle.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          </div>
        )}

        {filteredMaintenance.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <SectionHeader
              title="维修中"
              count={filteredMaintenance.length}
              icon={Wrench}
              colorClass="bg-orange-100 text-orange-600"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredMaintenance.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          </div>
        )}

        {filteredOffline.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <SectionHeader
              title="离线"
              count={filteredOffline.length}
              icon={Truck}
              colorClass="bg-gray-200 text-gray-500"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredOffline.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          </div>
        )}
      </div>

      {vehicles.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Truck className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>暂无车辆数据</p>
        </div>
      )}

      {searchText &&
        filteredIdle.length === 0 &&
        filteredOnDuty.length === 0 &&
        filteredMaintenance.length === 0 &&
        filteredOffline.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>未找到匹配的车辆</p>
          </div>
        )}
    </div>
  );
}
