import { useState } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDateTime } from '@/utils';
import {
  FileText,
  User,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  PenTool,
  Search,
  Filter,
  Eye,
  FileCheck,
} from 'lucide-react';

export default function TransferRegistration() {
  const { tasks } = useTaskStore();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const transferTasks = tasks.filter(
    (t) =>
      t.status === 'arrived' ||
      t.status === 'transferring' ||
      t.status === 'returning' ||
      t.status === 'completed'
  );

  const filteredTasks = transferTasks.filter((task) => {
    const matchesSearch =
      searchText === '' ||
      task.deceased.name.includes(searchText) ||
      task.family.name.includes(searchText) ||
      task.taskNo.includes(searchText);
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetail = (taskId: string) => {
    setSelectedTask(taskId);
  };

  const selectedTaskData = tasks.find((t) => t.id === selectedTask);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索交接记录..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-72 h-10 pl-9 pr-4 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
            />
          </div>
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
            <Filter className="w-4 h-4 text-gray-400 ml-2" />
            {['all', 'arrived', 'transferring', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  statusFilter === status
                    ? 'bg-amber-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {status === 'all'
                  ? '全部'
                  : status === 'arrived'
                  ? '待交接'
                  : status === 'transferring'
                  ? '交接中'
                  : '已完成'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">交接记录列表</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleViewDetail(task.id)}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    selectedTask === task.id ? 'bg-amber-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {task.deceased.name}
                          <span className="text-gray-500 text-sm ml-2">
                            {task.deceased.gender === 'male' ? '男' : '女'} ·{' '}
                            {task.deceased.age}岁
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 font-mono">{task.taskNo}</p>
                      </div>
                    </div>
                    <StatusBadge status={task.status} />
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span className="truncate">{task.pickupAddress}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span>{task.family.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>{formatDateTime(task.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {filteredTasks.length === 0 && (
              <div className="py-16 text-center text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无交接记录</p>
              </div>
            )}
          </div>
        </div>

        <div>
          {selectedTaskData ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">交接单详情</h3>
                <StatusBadge status={selectedTaskData.status} />
              </div>
              <div className="p-4 space-y-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-slate-600" />
                    <span className="font-medium text-gray-800">医院殡仪交接单</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">任务编号</span>
                      <span className="font-mono text-gray-700">{selectedTaskData.taskNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">逝者姓名</span>
                      <span className="text-gray-700">{selectedTaskData.deceased.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">性别/年龄</span>
                      <span className="text-gray-700">
                        {selectedTaskData.deceased.gender === 'male' ? '男' : '女'} ·{' '}
                        {selectedTaskData.deceased.age}岁
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">死亡原因</span>
                      <span className="text-gray-700">{selectedTaskData.deceased.causeOfDeath}</span>
                    </div>
                    {selectedTaskData.deceased.hospital && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">所在医院</span>
                        <span className="text-gray-700">{selectedTaskData.deceased.hospital}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-gray-800">家属信息核对</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">家属姓名</span>
                      <span className="text-gray-700">{selectedTaskData.family.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">与逝者关系</span>
                      <span className="text-gray-700">{selectedTaskData.family.relation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">联系电话</span>
                      <span className="text-gray-700">{selectedTaskData.family.phone}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700">信息已核对无误</span>
                  </div>
                </div>

                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                  <PenTool className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">家属签字区域</p>
                  {selectedTaskData.status === 'completed' && (
                    <div className="mt-2 flex items-center justify-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">已签字确认</span>
                    </div>
                  )}
                </div>

                {selectedTaskData.remarks && (
                  <div className="bg-amber-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-800 mb-2">备注</p>
                    <p className="text-sm text-gray-600">{selectedTaskData.remarks}</p>
                  </div>
                )}

                {(selectedTaskData.status === 'arrived' ||
                  selectedTaskData.status === 'transferring') && (
                  <button className="w-full py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium flex items-center justify-center gap-2">
                    <FileCheck className="w-4 h-4" />
                    确认交接
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <Eye className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">选择一条记录查看详情</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
