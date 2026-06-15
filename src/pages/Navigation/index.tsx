import { useState } from 'react';
import { useTaskStore } from '@/store/taskStore';
import {
  MapPin,
  Navigation,
  Search,
  Route,
  Clock,
  Navigation2,
  Phone,
  User,
  ChevronRight,
} from 'lucide-react';

export default function RouteNavigation() {
  const { tasks } = useTaskStore();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('市殡仪馆');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const inProgressTasks = tasks.filter(
    (t) => t.status === 'dispatched' || t.status === 'in_transit' || t.status === 'arrived'
  );

  const handleTaskSelect = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setSelectedTask(taskId);
      setOrigin(task.pickupAddress);
      setDestination(task.destination);
    }
  };

  const handleStartNavigation = () => {
    alert('导航功能已启动！（模拟：实际应用中会调用地图导航API）');
  };

  const selectedTaskData = tasks.find((t) => t.id === selectedTask);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-96 bg-gradient-to-br from-slate-700 to-slate-900 relative flex items-center justify-center">
              <div className="text-center text-white">
                <Navigation2 className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium opacity-60">地图视图</p>
                <p className="text-sm opacity-40 mt-2">实际项目中集成高德/百度地图</p>
              </div>
              
              <div className="absolute top-4 left-4 right-4">
                <div className="bg-white rounded-lg p-3 shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-700 flex-1 truncate">
                      {origin || '起点位置'}
                    </span>
                  </div>
                  <div className="w-0.5 h-4 bg-gray-300 ml-1.5"></div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm text-gray-700 flex-1 truncate">
                      {destination || '终点位置'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-white rounded-lg p-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-800">28.5</p>
                      <p className="text-xs text-gray-500">公里</p>
                    </div>
                    <div className="h-10 w-px bg-gray-200"></div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-800">45</p>
                      <p className="text-xs text-gray-500">分钟</p>
                    </div>
                    <div className="h-10 w-px bg-gray-200"></div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-green-600">畅通</p>
                      <p className="text-xs text-gray-500">路况</p>
                    </div>
                    <button
                      onClick={handleStartNavigation}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
                    >
                      <Navigation className="w-4 h-4" />
                      开始导航
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="输入起点地址..."
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full h-10 pl-9 pr-4 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
                <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  <Route className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="输入终点地址..."
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full h-10 pl-9 pr-4 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">推荐路线</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">最快路线</p>
                      <p className="text-xs text-gray-500">经 环城高速 · 28.5公里</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-amber-600">45分钟</p>
                    <p className="text-xs text-green-600">畅通</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">最短路线</p>
                      <p className="text-xs text-gray-500">经 人民路 · 22.3公里</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-700">58分钟</p>
                    <p className="text-xs text-yellow-600">缓行</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">避开高速</p>
                      <p className="text-xs text-gray-500">经 国道G107 · 31.8公里</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-700">52分钟</p>
                    <p className="text-xs text-green-600">畅通</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">进行中的任务</h3>
            </div>
            <div className="p-2">
              {inProgressTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <MapPin className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">暂无进行中任务</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {inProgressTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => handleTaskSelect(task.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedTask === task.id
                          ? 'bg-amber-50 border border-amber-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono text-gray-500">{task.taskNo}</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-800">
                          {task.deceased.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-500 line-clamp-1">
                          {task.pickupAddress}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {selectedTaskData && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-800 mb-4">任务详情</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {selectedTaskData.deceased.name} · {selectedTaskData.deceased.age}岁
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedTaskData.deceased.causeOfDeath}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {selectedTaskData.family.name}（{selectedTaskData.family.relation}）
                    </p>
                    <p className="text-xs text-gray-500">{selectedTaskData.family.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">接运地址</p>
                    <p className="text-sm text-gray-800">{selectedTaskData.pickupAddress}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">预计到达</p>
                    <p className="text-sm font-medium text-gray-800">约45分钟后</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
