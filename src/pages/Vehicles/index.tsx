import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVehicleStore } from '@/store/vehicleStore';
import { useTaskStore } from '@/store/taskStore';
import { useStaffStore } from '@/store/staffStore';
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
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  ClipboardCheck,
  ArrowLeftRight,
  XCircle,
  Timer,
} from 'lucide-react';
import type { VehicleStatus, TransportTask, TaskVehicleReconciliation, TaskTimeoutInfo } from '@/types';

type ViewMode = 'dispatch' | 'reconciliation';

export default function VehicleDispatch() {
  const navigate = useNavigate();
  const { vehicles, assignToTask, releaseFromTask, updateVehicle } = useVehicleStore();
  const { tasks, updateTask, getTimeoutTasks } = useTaskStore();
  const { staffList } = useStaffStore();
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('dispatch');

  const activeTasks = useMemo(() => {
    return tasks.filter(t => 
      t.status !== 'completed' && t.status !== 'cancelled'
    );
  }, [tasks]);

  const timeoutTasks = useMemo(() => getTimeoutTasks(), [tasks]);

  const vehicleIdsWithActiveTask = useMemo(() => {
    const ids = new Set<string>();
    activeTasks.forEach(t => {
      if (t.vehicleId) ids.add(t.vehicleId);
    });
    vehicles.forEach(v => {
      if (v.currentTaskId && activeTasks.some(t => t.id === v.currentTaskId)) {
        ids.add(v.id);
      }
    });
    return ids;
  }, [activeTasks, vehicles]);

  const reconciliationData = useMemo((): TaskVehicleReconciliation[] => {
    const results: TaskVehicleReconciliation[] = [];

    activeTasks.forEach(task => {
      const taskVehicle = task.vehicleId 
        ? vehicles.find(v => v.id === task.vehicleId) 
        : undefined;
      
      const vehicleWithTask = vehicles.find(v => v.currentTaskId === task.id);
      
      let isMatch = true;
      let issue: TaskVehicleReconciliation['issue'] = 'ok';
      let issueDesc = '数据一致';

      if (!task.vehicleId) {
        isMatch = false;
        issue = 'task_no_vehicle';
        issueDesc = '任务未分配车辆';
      } else if (!taskVehicle) {
        isMatch = false;
        issue = 'task_no_vehicle';
        issueDesc = '任务关联的车辆不存在';
      } else if (taskVehicle.currentTaskId !== task.id) {
        isMatch = false;
        issue = 'mismatch';
        if (taskVehicle.currentTaskId) {
          issueDesc = `车辆已挂其他任务(${taskVehicle.currentTaskId})`;
        } else {
          issueDesc = '车辆未挂此任务(状态可能为空闲)';
        }
      }

      if (vehicleWithTask && vehicleWithTask.id !== task.vehicleId) {
        isMatch = false;
        issue = 'mismatch';
        issueDesc = `车辆${vehicleWithTask.plateNo}也挂了此任务`;
      }

      results.push({
        taskId: task.id,
        taskNo: task.taskNo,
        deceasedName: task.deceased.name,
        taskVehicleId: task.vehicleId,
        taskVehiclePlate: taskVehicle?.plateNo,
        vehicleId: vehicleWithTask?.id,
        vehiclePlate: vehicleWithTask?.plateNo,
        vehicleTaskId: vehicleWithTask?.currentTaskId,
        isMatch,
        issue,
        issueDesc,
      });
    });

    vehicles.forEach(vehicle => {
      if (vehicle.currentTaskId && !results.find(r => r.taskId === vehicle.currentTaskId)) {
        const task = tasks.find(t => t.id === vehicle.currentTaskId);
        results.push({
          taskId: vehicle.currentTaskId,
          taskNo: task?.taskNo || '未知任务',
          deceasedName: task?.deceased.name || '未知',
          taskVehicleId: task?.vehicleId,
          taskVehiclePlate: task?.vehicleId ? vehicles.find(v => v.id === task.vehicleId)?.plateNo : undefined,
          vehicleId: vehicle.id,
          vehiclePlate: vehicle.plateNo,
          vehicleTaskId: vehicle.currentTaskId,
          isMatch: false,
          issue: 'vehicle_no_task',
          issueDesc: '车辆挂的任务不存在或已完成/取消',
        });
      }
    });

    return results;
  }, [activeTasks, vehicles, tasks]);

  const reconciliationIssues = useMemo(() => {
    return reconciliationData.filter(r => !r.isMatch);
  }, [reconciliationData]);

  const idleVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (v.status !== 'idle') return false;
      if (vehicleIdsWithActiveTask.has(v.id)) return false;
      return true;
    });
  }, [vehicles, vehicleIdsWithActiveTask]);

  const onDutyVehicles = useMemo(() => {
    return vehicles.filter((v) => v.status === 'on_duty');
  }, [vehicles]);

  const maintenanceVehicles = useMemo(() => {
    return vehicles.filter((v) => v.status === 'maintenance');
  }, [vehicles]);

  const offlineVehicles = useMemo(() => {
    return vehicles.filter((v) => v.status === 'offline');
  }, [vehicles]);

  const getCurrentTask = (taskId?: string): TransportTask | undefined => {
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

  const getStageLabel = (task: TransportTask): string => {
    const config = taskStatusMap[task.status];
    return config?.label || task.status;
  };

  const fixReconciliation = async (item: TaskVehicleReconciliation) => {
    const task = tasks.find(t => t.id === item.taskId);
    if (!task) return;

    if (item.issue === 'task_no_vehicle' && item.vehicleId) {
      const staff = staffList.find(s => s.id === task.driverId);
      assignToTask(item.vehicleId, task.id, staff?.name || '');
      updateTask(task.id, { vehicleId: item.vehicleId });
    } else if (item.issue === 'vehicle_no_task') {
      if (item.vehicleId) {
        releaseFromTask(item.vehicleId);
      }
    } else if (item.issue === 'mismatch') {
      if (item.taskVehicleId && !item.vehicleTaskId) {
        const staff = staffList.find(s => s.id === task.driverId);
        assignToTask(item.taskVehicleId, task.id, staff?.name || '');
      } else if (item.vehicleId && item.vehicleTaskId && item.vehicleTaskId !== task.id) {
        const otherTask = tasks.find(t => t.id === item.vehicleTaskId);
        if (otherTask) {
          updateTask(otherTask.id, { vehicleId: undefined });
        }
        releaseFromTask(item.vehicleId);
        if (item.taskVehicleId) {
          const staff = staffList.find(s => s.id === task.driverId);
          assignToTask(item.taskVehicleId, task.id, staff?.name || '');
        }
      } else if (item.vehicleId && !item.taskVehicleId) {
        updateTask(task.id, { vehicleId: item.vehicleId });
      }
    }
  };

  const fixAllIssues = () => {
    reconciliationIssues.forEach(item => {
      fixReconciliation(item);
    });
  };

  const VehicleCard = ({ vehicle, showTask = false }: { vehicle: typeof vehicles[0]; showTask?: boolean }) => {
    const currentTask = showTask ? getCurrentTask(vehicle.currentTaskId) : undefined;
    const hasTaskMismatch = currentTask && currentTask.vehicleId !== vehicle.id;

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow relative">
        {hasTaskMismatch && (
          <div className="absolute -top-2 -right-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
        )}
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
            className={`mt-3 pt-3 border-t cursor-pointer ${
              hasTaskMismatch ? 'border-red-200 bg-red-50/50' : 'border-gray-100'
            } rounded-lg`}
          >
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs text-gray-500">当前任务</span>
              <div className="flex items-center gap-1 text-blue-500 hover:text-blue-600">
                <ExternalLink className="w-3 h-3" />
                <span className="text-xs">查看</span>
              </div>
            </div>
            <div className={`rounded-lg p-3 space-y-1.5 ${
              hasTaskMismatch ? 'bg-red-50' : 'bg-blue-50'
            }`}>
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
              {hasTaskMismatch && (
                <div className="text-xs text-red-600 flex items-center gap-1 pt-1 border-t border-red-200">
                  <AlertTriangle className="w-3 h-3" />
                  数据不一致：任务未关联此车
                </div>
              )}
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
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode('dispatch')}
              className={`px-4 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1.5 ${
                viewMode === 'dispatch'
                  ? 'bg-amber-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Navigation className="w-4 h-4" />
              调度视图
            </button>
            <button
              onClick={() => setViewMode('reconciliation')}
              className={`px-4 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1.5 ${
                viewMode === 'reconciliation'
                  ? 'bg-amber-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              对账视图
              {reconciliationIssues.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {reconciliationIssues.length}
                </span>
              )}
            </button>
          </div>
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

      {viewMode === 'reconciliation' ? (
        <div className="space-y-6">
          {reconciliationIssues.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h3 className="font-semibold text-red-800">
                    发现 {reconciliationIssues.length} 处数据不一致
                  </h3>
                </div>
                <button
                  onClick={fixAllIssues}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  一键修正全部
                </button>
              </div>
              <div className="space-y-2">
                {reconciliationIssues.map((item) => (
                  <div
                    key={item.taskId + '-' + (item.vehicleId || 'no-vehicle')}
                    className="bg-white rounded-lg p-4 border border-red-100 flex items-center justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <XCircle className="w-4 h-4 text-red-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-800">{item.taskNo}</span>
                          <span className="text-sm text-gray-500">{item.deceasedName}</span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-0.5">
                          <p>
                            任务关联车辆：
                            <span className={item.taskVehiclePlate ? 'text-gray-800' : 'text-red-600'}>
                              {item.taskVehiclePlate || '未分配'}
                            </span>
                          </p>
                          <p>
                            实际挂任务车辆：
                            <span className={item.vehiclePlate ? 'text-gray-800' : 'text-red-600'}>
                              {item.vehiclePlate || '无'}
                            </span>
                          </p>
                          <p className="text-red-600">{item.issueDesc}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTaskClick(item.taskId, { stopPropagation: () => {} } as React.MouseEvent)}
                        className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        查看任务
                      </button>
                      <button
                        onClick={() => fixReconciliation(item)}
                        className="px-3 py-1.5 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-1.5"
                      >
                        <ArrowLeftRight className="w-4 h-4" />
                        修正
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">任务-车辆对账明细</h3>
              {reconciliationIssues.length === 0 && (
                <div className="flex items-center gap-1.5 text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  全部一致
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">任务编号</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">逝者</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">任务状态</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">任务关联车辆</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">实际挂任务车辆</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">状态</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {reconciliationData.map((item) => {
                    const task = tasks.find(t => t.id === item.taskId);
                    return (
                      <tr key={item.taskId + '-' + (item.vehicleId || 'no-vehicle')} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium text-gray-800">{item.taskNo}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{item.deceasedName}</td>
                        <td className="py-3 px-4">
                          {task && <StatusBadge status={task.status} />}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{item.taskVehiclePlate || '-'}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{item.vehiclePlate || '-'}</td>
                        <td className="py-3 px-4">
                          {item.isMatch ? (
                            <span className="inline-flex items-center gap-1 text-xs text-green-600">
                              <CheckCircle className="w-3.5 h-3.5" />
                              一致
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-red-600">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              不一致
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => handleTaskClick(item.taskId, e)}
                            className="text-blue-500 hover:text-blue-600 text-sm"
                          >
                            查看
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {reconciliationIssues.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800">
                    发现 {reconciliationIssues.length} 处任务-车辆数据不一致
                  </p>
                  <p className="text-sm text-amber-600">请切换到对账视图查看并修正</p>
                </div>
              </div>
              <button
                onClick={() => setViewMode('reconciliation')}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium"
              >
                去修正
              </button>
            </div>
          )}

          {timeoutTasks.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Timer className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-red-800">
                    {timeoutTasks.length} 个任务超时预警
                  </h3>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {timeoutTasks.slice(0, 6).map((info) => (
                  <div
                    key={info.taskId}
                    onClick={() => navigate(`/tasks/${info.taskId}`)}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg border border-red-100 cursor-pointer hover:bg-red-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Timer className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {info.taskNo} · {info.deceasedName}
                      </p>
                      <p className="text-xs text-red-600">
                        {info.timeoutStages.map(s => `${s.stageLabel}超${s.elapsedMinutes - s.limitMinutes}分钟`).join('、')}
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-red-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

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
      )}

      {vehicles.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Truck className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>暂无车辆数据</p>
        </div>
      )}

      {searchText && viewMode === 'dispatch' &&
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
