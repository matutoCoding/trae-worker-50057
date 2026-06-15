import { useState } from 'react';
import { useColdStorageStore } from '@/store/coldStorageStore';
import { useTaskStore } from '@/store/taskStore';
import { StatusBadge } from '@/components/StatusBadge';
import { storageUnitStatusMap, formatDateTime } from '@/utils';
import {
  Refrigerator,
  Search,
  Filter,
  User,
  Clock,
  FileText,
  Plus,
  Info,
  AlertTriangle,
  PackageCheck,
} from 'lucide-react';
import type { StorageUnitStatus } from '@/types';

export default function ColdStorage() {
  const { units, getUnitsByCabinet, getOccupiedUnits, getAvailableUnits, storeBody, releaseUnit } =
    useColdStorageStore();
  const { tasks } = useTaskStore();
  const [selectedCabinet, setSelectedCabinet] = useState<string>('A');
  const [statusFilter, setStatusFilter] = useState<StorageUnitStatus | 'all'>('all');
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [searchText, setSearchText] = useState('');

  const cabinetUnits = getUnitsByCabinet(selectedCabinet);
  
  const filteredUnits = cabinetUnits.filter((unit) => {
    const matchesStatus = statusFilter === 'all' || unit.status === statusFilter;
    const matchesSearch =
      searchText === '' ||
      (unit.deceasedName && unit.deceasedName.includes(searchText)) ||
      unit.cabinetNo.includes(searchText);
    return matchesStatus && matchesSearch;
  });

  const layers = [1, 2, 3];

  const stats = {
    total: units.length,
    occupied: getOccupiedUnits().length,
    available: getAvailableUnits().length,
    maintenance: units.filter((u) => u.status === 'maintenance').length,
  };

  const selectedUnitData = units.find((u) => u.id === selectedUnit);
  const relatedTask = selectedUnitData?.taskId
    ? tasks.find((t) => t.id === selectedUnitData.taskId)
    : null;

  const handleStore = (unitId: string) => {
    setSelectedUnit(unitId);
    setShowStoreModal(true);
  };

  const handleRelease = (unitId: string) => {
    if (confirm('确认释放此柜位吗？')) {
      releaseUnit(unitId);
      setSelectedUnit(null);
    }
  };

  const occupancyRate = Math.round((stats.occupied / stats.total) * 100);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">柜位总数</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
              <Refrigerator className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">已占用</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.occupied}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">空置</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.available}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <PackageCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">使用率</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{occupancyRate}%</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <Info className="w-6 h-6 text-amber-600" />
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
              placeholder="搜索柜位..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-64 h-10 pl-9 pr-4 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
            />
          </div>
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
            <Filter className="w-4 h-4 text-gray-400 ml-2" />
            {(['all', 'empty', 'occupied', 'reserved', 'maintenance'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  statusFilter === status
                    ? 'bg-amber-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {status === 'all' ? '全部' : storageUnitStatusMap[status].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">冷藏柜平面图</h3>
              <div className="flex items-center gap-2">
                {['A', 'B'].map((cabinet) => (
                  <button
                    key={cabinet}
                    onClick={() => setSelectedCabinet(cabinet)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCabinet === cabinet
                        ? 'bg-slate-700 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cabinet} 柜
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {layers.map((layer) => {
                const layerUnits = filteredUnits.filter((u) => u.layer === layer);
                return (
                  <div key={layer} className="flex items-center gap-4">
                    <div className="w-16 text-sm font-medium text-gray-500 text-right">
                      {layer} 层
                    </div>
                    <div className="flex-1 grid grid-cols-4 gap-3">
                      {layerUnits.map((unit) => {
                        const config = storageUnitStatusMap[unit.status];
                        return (
                          <div
                            key={unit.id}
                            onClick={() => setSelectedUnit(unit.id)}
                            className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                              config.bgColor
                            } ${
                              selectedUnit === unit.id
                                ? 'ring-2 ring-amber-400 ring-offset-2'
                                : ''
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span
                                className={`text-sm font-bold ${config.color}`}
                              >
                                {unit.cabinetNo}-{unit.layer}-{unit.unitNo}
                              </span>
                            </div>
                            {unit.deceasedName ? (
                              <div>
                                <p className="text-sm font-medium text-gray-800 truncate">
                                  {unit.deceasedName}
                                </p>
                                {unit.storageTime && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {unit.storageTime.slice(0, 10)}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400">{config.label}</p>
                            )}
                            {unit.status === 'maintenance' && (
                              <div className="absolute top-2 right-2">
                                <AlertTriangle className="w-4 h-4 text-orange-500" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-100 border border-green-200"></div>
                  <span className="text-sm text-gray-600">空置</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-100 border border-blue-200"></div>
                  <span className="text-sm text-gray-600">已占用</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-amber-100 border border-amber-200"></div>
                  <span className="text-sm text-gray-600">已预约</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-100 border border-gray-200"></div>
                  <span className="text-sm text-gray-600">维护中</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          {selectedUnitData ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">柜位详情</h3>
                  <StatusBadge status={selectedUnitData.status} />
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">柜位编号</p>
                  <p className="text-xl font-bold text-gray-800">
                    {selectedUnitData.cabinetNo}柜 {selectedUnitData.layer}层{' '}
                    {selectedUnitData.unitNo}号
                  </p>
                </div>

                {selectedUnitData.deceasedName && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-gray-800">逝者信息</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">姓名</span>
                        <span className="text-sm font-medium text-gray-800">
                          {selectedUnitData.deceasedName}
                        </span>
                      </div>
                      {selectedUnitData.storageTime && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">入库时间</span>
                          <span className="text-sm text-gray-700">
                            {formatDateTime(selectedUnitData.storageTime)}
                          </span>
                        </div>
                      )}
                      {selectedUnitData.expectedPickupTime && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">预计出馆</span>
                          <span className="text-sm text-gray-700">
                            {formatDateTime(selectedUnitData.expectedPickupTime)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {relatedTask && (
                  <div className="bg-amber-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="w-4 h-4 text-amber-600" />
                      <span className="font-medium text-gray-800">关联任务</span>
                    </div>
                    <p className="text-sm font-mono text-gray-700">{relatedTask.taskNo}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {relatedTask.pickupAddress}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  {selectedUnitData.status === 'empty' && (
                    <button
                      onClick={() => handleStore(selectedUnitData.id)}
                      className="w-full py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      登记入库
                    </button>
                  )}
                  {selectedUnitData.status === 'occupied' && (
                    <button
                      onClick={() => handleRelease(selectedUnitData.id)}
                      className="w-full py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <PackageCheck className="w-4 h-4" />
                      出库登记
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <Info className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">点击柜位查看详情</p>
            </div>
          )}

          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-800 mb-4">停尸登记记录</h3>
            <div className="space-y-3">
              {getOccupiedUnits()
                .slice(0, 5)
                .map((unit) => (
                  <div
                    key={unit.id}
                    onClick={() => setSelectedUnit(unit.id)}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {unit.deceasedName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {unit.cabinetNo}柜 {unit.layer}层
                        </p>
                      </div>
                    </div>
                    <Clock className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {showStoreModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 m-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">停尸登记</h3>
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">柜位</p>
                <p className="font-medium text-gray-800">
                  {selectedUnitData?.cabinetNo}柜 {selectedUnitData?.layer}层{' '}
                  {selectedUnitData?.unitNo}号
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">逝者姓名</label>
                <input
                  type="text"
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400"
                  placeholder="请输入逝者姓名"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">关联任务</label>
                <select className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400">
                  <option value="">请选择任务（选填）</option>
                  {tasks
                    .filter((t) => t.status === 'returning' || t.status === 'transferring')
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.taskNo} - {t.deceased.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowStoreModal(false)}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (selectedUnit) {
                    storeBody(selectedUnit, 'mock-task-id', '新登记');
                    setShowStoreModal(false);
                  }
                }}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
              >
                确认登记
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
