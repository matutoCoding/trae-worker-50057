import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaskStore } from '@/store/taskStore';
import { useTransferStore } from '@/store/transferStore';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDateTime, formatDate } from '@/utils';
import {
  FileText,
  User,
  Phone,
  MapPin,
  Clock,
  Search,
  Calendar,
  Filter,
  Eye,
  FileCheck,
  CheckCircle,
  XCircle,
  ArrowLeft,
  FileSignature,
  ExternalLink,
} from 'lucide-react';

export default function TransferRegistration() {
  const navigate = useNavigate();
  const { tasks } = useTaskStore();
  const { transferRecords, addTransferRecord, getRecordsByTaskId } = useTransferStore();
  
  const [searchText, setSearchText] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedTaskForTransfer, setSelectedTaskForTransfer] = useState('');
  
  const [handlerName, setHandlerName] = useState('');
  const [transferPlace, setTransferPlace] = useState('');
  const [familyConfirmed, setFamilyConfirmed] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [notes, setNotes] = useState('');

  const filteredRecords = useMemo(() => {
    let list = [...transferRecords];

    if (searchText) {
      list = list.filter(
        (r) =>
          r.taskNo.includes(searchText) ||
          r.deceasedName.includes(searchText) ||
          r.familyName.includes(searchText) ||
          r.handlerName.includes(searchText) ||
          r.transferPlace.includes(searchText)
      );
    }

    if (dateFilter) {
      list = list.filter((r) => r.transferTime.startsWith(dateFilter));
    }

    return list.sort((a, b) => 
      new Date(b.transferTime).getTime() - new Date(a.transferTime).getTime()
    );
  }, [transferRecords, searchText, dateFilter]);

  const selectedRecord = selectedRecordId
    ? transferRecords.find((r) => r.id === selectedRecordId)
    : null;
  
  const relatedTask = selectedRecord?.taskId
    ? tasks.find((t) => t.id === selectedRecord.taskId)
    : null;

  const handleViewDetail = (recordId: string) => {
    setSelectedRecordId(recordId);
  };

  const handleCloseDetail = () => {
    setSelectedRecordId(null);
  };

  const handleOpenTaskDetail = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };

  const handleNewTransfer = () => {
    setSelectedTaskForTransfer('');
    setHandlerName('');
    setTransferPlace('');
    setFamilyConfirmed(false);
    setHasSignature(false);
    setNotes('');
    setShowConfirmModal(true);
  };

  const handleTaskSelect = (taskId: string) => {
    setSelectedTaskForTransfer(taskId);
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setTransferPlace(task.pickupAddress);
    }
  };

  const handleConfirmTransfer = () => {
    if (!selectedTaskForTransfer || !handlerName.trim()) return;

    const task = tasks.find((t) => t.id === selectedTaskForTransfer);
    if (!task) return;

    addTransferRecord({
      taskId: task.id,
      taskNo: task.taskNo,
      deceasedName: task.deceased.name,
      familyName: task.family.name,
      familyRelation: task.family.relation,
      transferTime: new Date().toISOString(),
      transferPlace: transferPlace.trim() || task.pickupAddress,
      handlerName: handlerName.trim(),
      familyConfirmed,
      hasSignature,
      notes: notes.trim(),
    });

    setShowConfirmModal(false);
    setHandlerName('');
    setTransferPlace('');
    setFamilyConfirmed(false);
    setHasSignature(false);
    setNotes('');
    setSelectedTaskForTransfer('');
  };

  const availableTasks = tasks.filter(
    (t) =>
      t.status === 'arrived' ||
      t.status === 'transferring' ||
      t.status === 'returning'
  );

  const getTaskRecords = (taskId: string) => {
    return getRecordsByTaskId(taskId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">交接登记台账</h2>
          <p className="text-sm text-gray-500 mt-1">共 {filteredRecords.length} 条交接记录</p>
        </div>
        <button
          onClick={handleNewTransfer}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
        >
          <FileCheck className="w-4 h-4" />
          新建交接
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索任务编号、逝者姓名、家属、经办人、地点..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              清除
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      任务编号
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      逝者信息
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      交接时间
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      地点
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      经办人
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                        <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p>暂无交接记录</p>
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record) => (
                      <tr
                        key={record.id}
                        className={`hover:bg-gray-50 cursor-pointer ${
                          selectedRecordId === record.id ? 'bg-amber-50' : ''
                        }`}
                        onClick={() => handleViewDetail(record.id)}
                      >
                        <td className="px-4 py-3">
                          <span className="text-sm font-mono text-gray-800">
                            {record.taskNo}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {record.deceasedName}
                            </p>
                            <p className="text-xs text-gray-500">
                              家属：{record.familyName}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-700">
                            {formatDateTime(record.transferTime)}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-700 truncate max-w-[150px]">
                            {record.transferPlace}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-700">{record.handlerName}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1 text-xs">
                              {record.familyConfirmed ? (
                                <>
                                  <CheckCircle className="w-3 h-3 text-green-500" />
                                  <span className="text-green-600">家属确认</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 text-gray-400" />
                                  <span className="text-gray-500">未确认</span>
                                </>
                              )}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs">
                              {record.hasSignature ? (
                                <>
                                  <FileSignature className="w-3 h-3 text-green-500" />
                                  <span className="text-green-600">已签字</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 text-gray-400" />
                                  <span className="text-gray-500">未签字</span>
                                </>
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetail(record.id);
                            }}
                            className="text-amber-600 hover:text-amber-700 text-sm font-medium inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            查看
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          {selectedRecord ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 sticky top-6">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">交接详情</h3>
                <button
                  onClick={handleCloseDetail}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">任务编号</span>
                    <button
                      onClick={() => handleOpenTaskDetail(selectedRecord.taskId)}
                      className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1"
                    >
                      查看任务
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="font-mono text-gray-800">{selectedRecord.taskNo}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">逝者姓名</p>
                  <p className="font-medium text-gray-800">{selectedRecord.deceasedName}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">家属信息</p>
                  <p className="text-gray-700">
                    {selectedRecord.familyName}（{selectedRecord.familyRelation}）
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">交接时间</p>
                  <p className="text-gray-700">{formatDateTime(selectedRecord.transferTime)}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">交接地点</p>
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700 text-sm">{selectedRecord.transferPlace}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">经办人</p>
                  <p className="text-gray-700">{selectedRecord.handlerName}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">家属信息确认</span>
                    {selectedRecord.familyConfirmed ? (
                      <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        已确认
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-gray-400 text-sm">
                        <XCircle className="w-4 h-4" />
                        未确认
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">家属签字</span>
                    {selectedRecord.hasSignature ? (
                      <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                        <FileSignature className="w-4 h-4" />
                        已签字
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-gray-400 text-sm">
                        <XCircle className="w-4 h-4" />
                        未签字
                      </span>
                    )}
                  </div>
                </div>

                {selectedRecord.notes && (
                  <div className="bg-amber-50 rounded-lg p-4">
                    <p className="text-sm text-gray-800 font-medium mb-1">备注</p>
                    <p className="text-sm text-gray-600">{selectedRecord.notes}</p>
                  </div>
                )}

                {relatedTask && (
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs text-gray-500 mb-2">关联任务状态</p>
                    <StatusBadge status={relatedTask.status} />
                  </div>
                )}

                {getTaskRecords(selectedRecord.taskId).length > 1 && (
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs text-gray-500 mb-2">
                      该任务共有 {getTaskRecords(selectedRecord.taskId).length} 条交接记录
                    </p>
                    <div className="space-y-2">
                      {getTaskRecords(selectedRecord.taskId)
                        .filter((r) => r.id !== selectedRecord.id)
                        .slice(0, 3)
                        .map((r) => (
                          <button
                            key={r.id}
                            onClick={() => setSelectedRecordId(r.id)}
                            className="w-full text-left p-2 bg-gray-50 hover:bg-gray-100 rounded text-xs text-gray-600 transition-colors"
                          >
                            {formatDateTime(r.transferTime)} · {r.handlerName}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center sticky top-6">
              <Eye className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">选择一条记录查看详情</p>
            </div>
          )}
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 m-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">新建交接登记</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  选择任务 <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedTaskForTransfer}
                  onChange={(e) => handleTaskSelect(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400"
                >
                  <option value="">请选择待交接任务</option>
                  {availableTasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.taskNo} - {t.deceased.name} ({t.pickupAddress.slice(0, 20)}...)
                    </option>
                  ))}
                </select>
                {availableTasks.length === 0 && (
                  <p className="text-xs text-gray-400 mt-1">暂无待交接的任务</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  交接地点 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={transferPlace}
                  onChange={(e) => setTransferPlace(e.target.value)}
                  placeholder="请输入交接地点"
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  经办人 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={handlerName}
                  onChange={(e) => setHandlerName(e.target.value)}
                  placeholder="请输入经办人姓名"
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={familyConfirmed}
                    onChange={(e) => setFamilyConfirmed(e.target.checked)}
                    className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
                  />
                  <span className="text-sm text-gray-700">家属已确认信息</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasSignature}
                    onChange={(e) => setHasSignature(e.target.checked)}
                    className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
                  />
                  <span className="text-sm text-gray-700">家属已签字</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="可选：填写交接备注"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmTransfer}
                disabled={!selectedTaskForTransfer || !handlerName.trim()}
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
