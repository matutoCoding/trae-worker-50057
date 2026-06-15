import { useEffect } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { useVehicleStore } from '@/store/vehicleStore';
import { useStaffStore } from '@/store/staffStore';
import { useColdStorageStore } from '@/store/coldStorageStore';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDateTime, formatTime } from '@/utils';
import {
  ClipboardList,
  Truck,
  Users,
  Refrigerator,
  Phone,
  MapPin,
  FileText,
  BarChart3,
  Clock,
  ArrowRight,
  AlertTriangle,
  TrendingUp,
  Activity,
  Bell,
  CalendarClock,
  AlertOctagon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ColdStorageUnit } from '@/types';

export default function Dashboard() {
  const navigate = useNavigate();
  const { tasks, getTodayTasks } = useTaskStore();
  const { vehicles, getAvailableVehicles } = useVehicleStore();
  const { staffList, getAvailableDrivers, getAvailableAssistants } = useStaffStore();
  const { units, getOccupiedUnits, getAvailableUnits, getExpiringUnits, getOverdueUnits, getApproachingUnits, refreshExpiryStatus } = useColdStorageStore();

  useEffect(() => {
    refreshExpiryStatus();
    const interval = setInterval(refreshExpiryStatus, 60000);
    return () => clearInterval(interval);
  }, [refreshExpiryStatus]);

  const expiringUnits = getExpiringUnits();
  const overdueUnits = getOverdueUnits();
  const approachingUnits = getApproachingUnits();

  const handleExpiryClick = (unit: ColdStorageUnit) => {
    navigate('/cold-storage', { state: { unitId: unit.id, cabinetNo: unit.cabinetNo } });
  };

  const todayTasks = getTodayTasks();
  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const inProgressTasks = tasks.filter(
    (t) => t.status !== 'pending' && t.status !== 'completed' && t.status !== 'cancelled'
  );
  const completedToday = todayTasks.filter((t) => t.status === 'completed');

  const stats = [
    {
      label: '今日接运任务',
      value: todayTasks.length,
      icon: ClipboardList,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: '进行中任务',
      value: inProgressTasks.length,
      icon: Activity,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
    {
      label: '可用车辆',
      value: getAvailableVehicles().length,
      icon: Truck,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      label: '在岗人员',
      value: getAvailableDrivers().length + getAvailableAssistants().length,
      icon: Users,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
  ];

  const quickActions = [
    { label: '电话受理', icon: Phone, path: '/tasks/new', color: 'bg-blue-500 hover:bg-blue-600' },
    { label: '任务派发', icon: ClipboardList, path: '/tasks', color: 'bg-amber-500 hover:bg-amber-600' },
    { label: '路线导航', icon: MapPin, path: '/navigation', color: 'bg-green-500 hover:bg-green-600' },
    { label: '交接登记', icon: FileText, path: '/transfer', color: 'bg-purple-500 hover:bg-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600">今日已完成 {completedToday.length} 单</span>
              </div>
            </div>
          );
        })}
      </div>

      {expiringUnits.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-gray-800">冷藏到期提醒</h2>
            </div>
            <button
              onClick={() => navigate('/cold-storage')}
              className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
            >
              查看全部 <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {overdueUnits.map((unit) => (
              <div
                key={unit.id}
                onClick={() => handleExpiryClick(unit)}
                className="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
              >
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertOctagon className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-medium rounded-full">
                      已超期
                    </span>
                    <span className="text-sm font-medium text-gray-800">
                      {unit.cabinetNo}柜{unit.layer}层{unit.unitNo}号
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {unit.deceasedName}
                  </p>
                  <p className="text-xs text-red-600">
                    超期 {Math.abs(unit.daysRemaining || 0)} 天
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-red-400 flex-shrink-0" />
              </div>
            ))}
            {approachingUnits.map((unit) => (
              <div
                key={unit.id}
                onClick={() => handleExpiryClick(unit)}
                className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-lg cursor-pointer hover:bg-amber-100 transition-colors"
              >
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CalendarClock className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-medium rounded-full">
                      即将到期
                    </span>
                    <span className="text-sm font-medium text-gray-800">
                      {unit.cabinetNo}柜{unit.layer}层{unit.unitNo}号
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {unit.deceasedName}
                  </p>
                  <p className="text-xs text-amber-600">
                    剩余 {unit.daysRemaining} 天
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-400 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">待处理任务</h2>
              <button
                onClick={() => navigate('/tasks')}
                className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
              >
                查看全部 <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-6">
            {pendingTasks.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无待处理任务</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => navigate(`/tasks/${task.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {task.deceased.name} · {task.deceased.age}岁
                        </p>
                        <p className="text-sm text-gray-500">{task.pickupAddress}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={task.status} />
                      <p className="text-xs text-gray-400 mt-2">
                        {formatTime(task.createdAt)} 受理
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">快捷操作</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={() => navigate(action.path)}
                    className={`${action.color} text-white p-4 rounded-xl flex flex-col items-center gap-2 transition-all hover:scale-105 active:scale-95`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-sm font-medium">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">车辆状态</h2>
              <button
                onClick={() => navigate('/vehicles')}
                className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
              >
                车辆调度 <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-4 gap-3">
              {vehicles.slice(0, 8).map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="text-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => navigate('/vehicles')}
                >
                  <div
                    className={`w-10 h-10 mx-auto mb-2 rounded-lg flex items-center justify-center ${
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
                          : 'text-gray-600'
                      }`}
                    />
                  </div>
                  <p className="text-xs font-medium text-gray-700 truncate">{vehicle.plateNo}</p>
                  <StatusBadge status={vehicle.status} className="mt-1 text-xs" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">冷藏柜状态</h2>
              <button
                onClick={() => navigate('/cold-storage')}
                className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
              >
                冷藏管理 <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-8 mb-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{getOccupiedUnits().length}</p>
                <p className="text-sm text-gray-500">已占用</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{getAvailableUnits().length}</p>
                <p className="text-sm text-gray-500">空置</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-600">
                  {units.filter((u) => u.status === 'reserved').length}
                </p>
                <p className="text-sm text-gray-500">已预约</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-500">
                  {units.filter((u) => u.status === 'maintenance').length}
                </p>
                <p className="text-sm text-gray-500">维护中</p>
              </div>
            </div>
            <div className="grid grid-cols-8 gap-1.5">
              {units.slice(0, 24).map((unit) => (
                <div
                  key={unit.id}
                  className={`aspect-square rounded flex items-center justify-center text-xs font-medium ${
                    unit.status === 'empty'
                      ? 'bg-gray-100 text-gray-400'
                      : unit.status === 'occupied'
                      ? 'bg-blue-500 text-white'
                      : unit.status === 'reserved'
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-300 text-gray-500'
                  }`}
                  title={`${unit.cabinetNo}柜 ${unit.layer}层 ${unit.unitNo}号`}
                >
                  {unit.unitNo}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">在岗人员</h2>
            <button
              onClick={() => navigate('/staff')}
              className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
            >
              人员排班 <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {staffList
              .filter((s) => s.status === 'on_duty' || s.status === 'night_shift')
              .slice(0, 12)
              .map((staff) => (
                <div
                  key={staff.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {staff.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{staff.name}</p>
                    <p className="text-xs text-gray-500">
                      {staff.role === 'driver' ? '司机' : staff.role === 'assistant' ? '接运员' : '调度员'}
                    </p>
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      staff.status === 'on_duty' ? 'bg-green-500' : 'bg-indigo-500'
                    }`}
                  ></div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
