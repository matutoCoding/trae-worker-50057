import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FileSignature,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import type { StorageUnitStatus } from '@/types';

export default function ColdStorage() {
  const navigate = useNavigate();
  const { units, getUnitsByCabinet, getOccupiedUnits, getAvailableUnits, storeBody, releaseUnit, storageRecords } =
    useColdStorageStore();
  const { tasks } = useTaskStore();
  const [selectedCabinet, setSelectedCabinet] = useState<string>('A');
  const [statusFilter, setStatusFilter] = useState<StorageUnitStatus | 'all'>('all');
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [deceasedName, setDeceasedName] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [expectedPickupTime, setExpectedPickupTime] = useState('');

  const cabinetUnits = getUnitsByCabinet(selectedCabinet);
  
  const filteredUnits = cabinetUnits.filter((unit) => {
    const matchesStatus = statusFilter === 'all' || unit.status === statusFilter;
    const matchesSearch =
      searchText === '' ||
      (unit.deceasedName && unit.deceasedName.includes(searchText)) ||
      unit.cabinetNo.includes(searchText) ||
      `${unit.cabinetNo}-${unit.layer}-${unit.unitNo}`.includes(searchText);
    return matchesStatus && matchesSearch;
  });

  const layers = [1, 2, 3];

  const stats = {
    total: units.length,
    occupied: getOccupiedUnits().length,
    available: getAvailableUnits().length,
    maintenance: units.filter((u) => u.status === 'maintenance').length,
    reserved: units.filter((u) => u.status === 'reserved').length,
  };

  const selectedUnit = selectedUnitId ? units.find((u) => u.id === selectedUnitId) : null;
  const relatedTask = selectedUnit?.taskId
    ? tasks.find((t) => t.id === selectedUnit.taskId)
    : null;

  const occupiedUnits = getOccupiedUnits();

  const handleStore = (unitId: string) => {
    const unit = units.find((u) => u.id === unitId);
    if (unit?.taskId) {
      const task = tasks.find((t) => t.id === unit.taskId);
      if (task) {
        setDeceasedName(task.deceased.name);
        setSelectedTaskId(task.id);
      }
    } else {
      setDeceasedName('');
      setSelectedTaskId('');
    }
    setExpectedPickupTime('');
    setSelectedUnitId(unitId);
    setShowStoreModal(true);
  };

  const handleConfirmStore = () => {
    if (!selectedUnitId || !deceasedName.trim()) return;
    
    const task = tasks.find((t) => t.id === selectedTaskId);
    const name = deceasedName.trim() || task?.deceased.name || '未知';
    
    storeBody(
      selectedUnitId,
      selectedTaskId || undefined,
      name,
      expectedPickupTime || undefined
    );
    
    setShowStoreModal(false);
    setDeceasedName('');
    setSelectedTaskId('');
    setExpectedPickupTime('');
  };

  const handleRelease = (unitId: string) => {
    if (confirm('确认释放此柜位吗？出库后柜位将恢复为空置状态。')) {
      releaseUnit(unitId);
    }
  };

  const handleRecordClick = (unitId: string, cabinetNo: string) => {
    setSelectedCabinet(cabinetNo);
    setSelectedUnitId(unitId);
    setStatusFilter('all');
    setTimeout(() => {
      const element = document.querySelector(`[data-unit-id="${unitId}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleStorageRecordClick = (record: typeof storageRecords[0]) => {
    const unit = units.find((u) => u.id === record.unitId);
    if (unit) {
      setSelectedCabinet(unit.cabinetNo);
      setSelectedUnitId(unit.id);
      setStatusFilter('all');
    }
  };

  const occupancyRate = Math.round((stats.occupied / stats.total) * 100);

  const availableTasks = tasks.filter(
    (t) => t.status === 'returning' || t.status === 'transferring' || t.status === 'arrived'
  );

  const getTaskByUnitId = (unitId: string) => {
    const unit = units.find((u) => u.id === unitId);
    if (!unit?.taskId) return null;
    return tasks.find((t) => t.id === unit.taskId);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
              <p className="text-sm text-gray-500">已预约</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{stats.reserved}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">使用率</p>
              <p className="text-2xl font-bold text-slate-600 mt-1">{occupancyRate}%</p>
            </div>
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center">
              <Info className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索柜位号或逝者姓名..."
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
                    onClick={() => {
                      setSelectedCabinet(cabinet);
                      setSelectedUnitId(null);
                    }}
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
                  <div key={layer} className="flex items-start gap-4">
                    <div className="w-12 text-sm font-medium text-gray-500 text-right pt-3">
                      {layer} 层
                    </div>
                    <div className="flex-1 grid grid-cols-4 gap-3">
                      {layerUnits.map((unit) => {
                        const config = storageUnitStatusMap[unit.status];
                        const unitTask = unit.taskId ? tasks.find((t) => t.id === unit.taskId) : null;
                        return (
                          <div
                            key={unit.id}
                            data-unit-id={unit.id}
                            onClick={() => setSelectedUnitId(unit.id)}
                            className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                              config.bgColor
                            } ${
                              selectedUnitId === unit.id
                                ? 'ring-2 ring-amber-400 ring-offset-2 border-amber-400'
                                : ''
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span
                                className={`text-sm font-bold ${config.color}`}
                              >
                                {unit.cabinetNo}-{unit.layer}-{unit.unitNo}
                              </span>
                              {unit.status === 'maintenance' && (
                                <AlertTriangle className="w-4 h-4 text-orange-500" />
                              )}
                            </div>
                            {unit.deceasedName ? (
                              <div>
                                <p className="text-sm font-medium text-gray-800 truncate">
                                  {unit.deceasedName}
                                </p>
                                {unitTask && (
                                  <p className="text-xs text-blue-600 mt-0.5 truncate">
                                    {unitTask.taskNo}
                                  </p>
                                )}
                                {unit.storageTime && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {unit.storageTime.slice(5, 10)} 入库
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400">{config.label}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredUnits.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Search className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">未找到匹配的柜位</p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-50 border border-green-200"></div>
                  <span className="text-sm text-gray-600">空置</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-50 border border-blue-200"></div>
                  <span className="text-sm text-gray-600">已占用</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-amber-50 border border-amber-200"></div>
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

        <div className="space-y-6">
          {selectedUnit ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">柜位详情</h3>
                  <StatusBadge status={selectedUnit.status} />
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">柜位编号</p>
                  <p className="text-xl font-bold text-gray-800">
                    {selectedUnit.cabinetNo}柜 {selectedUnit.layer}层{' '}
                    {selectedUnit.unitNo}号
                  </p>
                </div>

                {selectedUnit.deceasedName && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-gray-800">逝者信息</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">姓名</span>
                        <span className="text-sm font-medium text-gray-800">
                          {selectedUnit.deceasedName}
                        </span>
                      </div>
                      {selectedUnit.storageTime && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">入库时间</span>
                          <span className="text-sm text-gray-700">
                            {formatDateTime(selectedUnit.storageTime)}
                          </span>
                        </div>
                      )}
                      {selectedUnit.expectedPickupTime && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">预计出馆</span>
                          <span className="text-sm text-gray-700">
                            {formatDateTime(selectedUnit.expectedPickupTime)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {relatedTask && (
                  <div className="bg-amber-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-600" />
                        <span className="font-medium text-gray-800">关联任务</span>
                      </div>
                      <button
                        onClick={() => navigate(`/tasks/${relatedTask.id}`)}
                        className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1"
                      >
                        查看
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-sm font-mono text-gray-700">{relatedTask.taskNo}</p>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {relatedTask.pickupAddress}
                    </p>
                    <div className="mt-2">
                      <StatusBadge status={relatedTask.status} />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {selectedUnit.status === 'empty' && (
                    <button
                      onClick={() => handleStore(selectedUnit.id)}
                      className="w-full py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      登记入库
                    </button>
                  )}
                  {selectedUnit.status === 'reserved' && (
                    <button
                      onClick={() => handleStore(selectedUnit.id)}
                      className="w-full py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      确认入库
                    </button>
                  )}
                  {selectedUnit.status === 'occupied' && (
                    <button
                      onClick={() => handleRelease(selectedUnit.id)}
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
              <p className="text-gray-500 text-sm">点击柜位查看详情</p>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">停尸登记记录</h3>
              <span className="text-xs text-gray-500">共 {occupiedUnits.length} 位</span>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {occupiedUnits.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-sm">
                  暂无停尸记录
                </div>
              ) : (
                occupiedUnits.map((unit) => {
                  const unitTask = unit.taskId ? tasks.find((t) => t.id === unit.taskId) : null;
                  return (
                    <div
                      key={unit.id}
                      onClick={() => handleRecordClick(unit.id, unit.cabinetNo)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedUnitId === unit.id
                          ? 'bg-amber-50 border border-amber-200'
                          : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {unit.deceasedName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {unit.cabinetNo}柜 {unit.layer}层{unit.unitNo}号
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </div>
                      {unitTask && (
                        <div className="mt-2 ml-12 text-xs text-blue-600 truncate">
                          任务：{unitTask.taskNo}
                        </div>
                      )}
                      {unit.storageTime && (
                        <div className="mt-1 ml-12 text-xs text-gray-400">
                          入库：{formatDateTime(unit.storageTime)}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {storageRecords.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileSignature className="w-4 h-4 text-amber-500" />
                  <h3 className="font-semibold text-gray-800">出入库记录</h3>
                </div>
                <span className="text-xs text-gray-500">共 {storageRecords.length} 条</span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {storageRecords.slice(0, 15).map((record) => (
                  <div
                    key={record.id}
                    onClick={() => handleStorageRecordClick(record)}
                    className="text-xs p-2.5 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium truncate">
                        {record.deceasedName}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          record.type === 'in'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {record.type === 'in' ? '入库' : '出库'}
                      </span>
                    </div>
                    <div className="text-gray-500 mt-1 flex items-center justify-between">
                      <span>{record.cabinetNo}柜</span>
                      <span>{formatDateTime(record.operateTime)}</span>
                    </div>
                    {record.taskId && (
                      <div className="text-blue-500 mt-1 text-xs">
                        关联任务
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showStoreModal && selectedUnit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 m-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">停尸登记</h3>
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">柜位</p>
                <p className="font-medium text-gray-800">
                  {selectedUnit.cabinetNo}柜 {selectedUnit.layer}层{' '}
                  {selectedUnit.unitNo}号
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  逝者姓名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={deceasedName}
                  onChange={(e) => setDeceasedName(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400"
                  placeholder="请输入逝者姓名"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">关联任务</label>
                <select
                  value={selectedTaskId}
                  onChange={(e) => {
                    setSelectedTaskId(e.target.value);
                    if (e.target.value) {
                      const task = tasks.find((t) => t.id === e.target.value);
                      if (task && !deceasedName.trim()) {
                        setDeceasedName(task.deceased.name);
                      }
                    }
                  }}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400"
                >
                  <option value="">请选择任务（选填）</option>
                  {availableTasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.taskNo} - {t.deceased.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  预计出馆时间
                </label>
                <input
                  type="datetime-local"
                  value={expectedPickupTime}
                  onChange={(e) => setExpectedPickupTime(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400"
                />
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
                onClick={handleConfirmStore}
                disabled={!deceasedName.trim()}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
