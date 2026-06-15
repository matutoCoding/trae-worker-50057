import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTaskStore } from '@/store/taskStore';
import { useVehicleStore } from '@/store/vehicleStore';
import { useStaffStore } from '@/store/staffStore';
import { useTransferStore } from '@/store/transferStore';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDateTime } from '@/utils';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Clock,
  Truck,
  FileText,
  Edit,
  CheckCircle,
  Send,
  Play,
  Navigation,
  ArrowRightLeft,
  PackageCheck,
} from 'lucide-react';
import type { TaskStatus } from '@/types';

const statusFlow: { status: TaskStatus; label: string; icon: typeof Play }[] = [
  { status: 'dispatched', label: '派发任务', icon: Send },
  { status: 'in_transit', label: '开始接运', icon: Play },
  { status: 'arrived', label: '到达地点', icon: Navigation },
  { status: 'transferring', label: '开始交接', icon: ArrowRightLeft },
  { status: 'returning', label: '开始返程', icon: Truck },
  { status: 'completed', label: '任务完成', icon: CheckCircle },
];

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tasks, updateTaskStatus, assignVehicleAndStaff } = useTaskStore();
  const { vehicles, getAvailableVehicles, assignToTask, releaseFromTask } = useVehicleStore();
  const { getAvailableDrivers, getAvailableAssistants, staffList } = useStaffStore();
  const { getLatestRecordByTaskId } = useTransferStore();
  
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedAssistant, setSelectedAssistant] = useState('');

  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">任务不存在</p>
        <button
          onClick={() => navigate('/tasks')}
          className="mt-4 text-amber-600 hover:text-amber-700"
        >
          返回任务列表
        </button>
      </div>
    );
  }

  const vehicle = vehicles.find((v) => v.id === task.vehicleId);
  const driver = staffList.find((s) => s.id === task.driverId);
  const assistant = staffList.find((s) => s.id === task.assistantId);
  const latestTransfer = getLatestRecordByTaskId(task.id);

  const currentStatusIndex = statusFlow.findIndex((s) => s.status === task.status);
  const canAdvance = task.status !== 'completed' && task.status !== 'cancelled';
  const nextStatus = canAdvance && currentStatusIndex >= 0 ? statusFlow[currentStatusIndex + 1] : null;

  const handleAssign = () => {
    if (selectedVehicle && selectedDriver && selectedAssistant) {
      const driverInfo = staffList.find((s) => s.id === selectedDriver);
      
      assignVehicleAndStaff(task.id, selectedVehicle, selectedDriver, selectedAssistant);
      assignToTask(selectedVehicle, task.id, driverInfo?.name || '');
      
      setShowAssignModal(false);
    }
  };

  const handleStatusAdvance = () => {
    if (nextStatus) {
      if (nextStatus.status === 'completed' && task.vehicleId) {
        updateTaskStatus(task.id, nextStatus.status);
        const updatedTask = useTaskStore.getState().tasks.find((t) => t.id === task.id);
        releaseFromTask(task.vehicleId, updatedTask?.mileage);
      } else {
        updateTaskStatus(task.id, nextStatus.status);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-800">{task.taskNo}</h2>
              <StatusBadge status={task.status} />
            </div>
            <p className="text-sm text-gray-500 mt-1">创建时间：{formatDateTime(task.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {task.status === 'pending' && (
            <button
              onClick={() => setShowAssignModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
            >
              <Send className="w-4 h-4" />
              派发任务
            </button>
          )}
          {nextStatus && task.status !== 'pending' && (
            <button
              onClick={handleStatusAdvance}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
            >
              {(() => {
                const Icon = nextStatus.icon;
                return <Icon className="w-4 h-4" />;
              })()}
              {nextStatus.label}
            </button>
          )}
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
            <Edit className="w-4 h-4" />
            编辑
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">逝者信息</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">姓名</p>
                <p className="font-medium text-gray-800">{task.deceased.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">性别</p>
                <p className="font-medium text-gray-800">{task.deceased.gender === 'male' ? '男' : '女'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">年龄</p>
                <p className="font-medium text-gray-800">{task.deceased.age} 岁</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">身份证号</p>
                <p className="font-medium text-gray-800 font-mono text-sm">{task.deceased.idCard}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">死亡原因</p>
                <p className="font-medium text-gray-800">{task.deceased.causeOfDeath}</p>
              </div>
              {task.deceased.hospital && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">所在医院</p>
                  <p className="font-medium text-gray-800">{task.deceased.hospital}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Phone className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">家属信息</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">姓名</p>
                <p className="font-medium text-gray-800">{task.family.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">与逝者关系</p>
                <p className="font-medium text-gray-800">{task.family.relation}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">联系电话</p>
                <p className="font-medium text-gray-800">{task.family.phone}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">接运信息</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-24 text-sm text-gray-500">接运地址</div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{task.pickupAddress}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-24 text-sm text-gray-500">目的地</div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{task.destination}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-24 text-sm text-gray-500">预约时间</div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{formatDateTime(task.scheduledTime)}</p>
                </div>
              </div>
              {task.mileage && (
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-24 text-sm text-gray-500">行驶里程</div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{task.mileage} 公里</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {latestTransfer && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <PackageCheck className="w-4 h-4 text-cyan-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">最新交接记录</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">交接时间</p>
                  <p className="text-sm font-medium text-gray-800">{formatDateTime(latestTransfer.transferTime)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">交接地点</p>
                  <p className="text-sm font-medium text-gray-800">{latestTransfer.transferPlace}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">家属确认</p>
                  <p className="text-sm font-medium text-green-600">
                    {latestTransfer.hasSignature ? '已签字' : '未签字'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">经办人</p>
                  <p className="text-sm font-medium text-gray-800">{latestTransfer.handlerName}</p>
                </div>
              </div>
            </div>
          )}

          {task.remarks && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">备注信息</h3>
              </div>
              <p className="text-gray-700">{task.remarks}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Truck className="w-4 h-4 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">车辆人员</h3>
            </div>
            {vehicle ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">车辆</p>
                  <p className="font-medium text-gray-800">{vehicle.plateNo}</p>
                  <p className="text-sm text-gray-500">{vehicle.model}</p>
                </div>
                {driver && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">司机</p>
                    <p className="font-medium text-gray-800">{driver.name}</p>
                    <p className="text-sm text-gray-500">{driver.phone}</p>
                  </div>
                )}
                {assistant && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">接运员</p>
                    <p className="font-medium text-gray-800">{assistant.name}</p>
                    <p className="text-sm text-gray-500">{assistant.phone}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Truck className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>暂未分配车辆人员</p>
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="mt-3 text-amber-600 hover:text-amber-700 text-sm font-medium"
                >
                  立即派发
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-cyan-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">任务时间线</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5"></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">任务创建</p>
                  <p className="text-xs text-gray-500">{formatDateTime(task.createdAt)}</p>
                </div>
              </div>
              {task.actualStartTime && (
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">开始执行</p>
                    <p className="text-xs text-gray-500">{formatDateTime(task.actualStartTime)}</p>
                  </div>
                </div>
              )}
              {task.actualEndTime && (
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-gray-500 mt-1.5"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">任务完成</p>
                    <p className="text-xs text-gray-500">{formatDateTime(task.actualEndTime)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 m-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">派发任务</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">选择车辆</label>
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400"
                >
                  <option value="">请选择车辆</option>
                  {getAvailableVehicles().map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plateNo} - {v.model}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">选择司机</label>
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400"
                >
                  <option value="">请选择司机</option>
                  {getAvailableDrivers().map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} - {s.phone}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">选择接运员</label>
                <select
                  value={selectedAssistant}
                  onChange={(e) => setSelectedAssistant(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400"
                >
                  <option value="">请选择接运员</option>
                  {getAvailableAssistants().map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} - {s.phone}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedVehicle || !selectedDriver || !selectedAssistant}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认派发
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
