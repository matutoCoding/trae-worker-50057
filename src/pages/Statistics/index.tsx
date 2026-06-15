import { useState, useMemo } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { useVehicleStore } from '@/store/vehicleStore';
import { useStaffStore } from '@/store/staffStore';
import { useTransferStore } from '@/store/transferStore';
import { useColdStorageStore } from '@/store/coldStorageStore';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Users,
  Truck,
  Calendar,
  Clock,
  MapPin,
  Activity,
  Download,
  FileSpreadsheet,
  AlertTriangle,
  Gauge,
  FileDown,
} from 'lucide-react';
import { formatDateTime, formatDate } from '@/utils';
import type { VehicleUsageDetail, StaffWorkloadDetail, AnomalyType } from '@/types';

const ANOMALY_TYPE_NAMES: Record<AnomalyType, string> = {
  wait: '途中等待',
  reassign: '改派车辆',
  cancel: '家属取消',
  address_change: '变更地址',
  delay: '延误',
  other: '其他异常',
};

const ROLE_NAMES: Record<string, string> = {
  driver: '司机',
  assistant: '接运员',
  dispatcher: '调度员',
  manager: '管理员',
  handler: '经办人',
};

export default function Statistics() {
  const { tasks, getTasksByDateRange, getAnomalyCountByDateRange, getAnomaliesByDateRange, getUnresolvedAnomalyCount, getAverageResolutionTime } = useTaskStore();
  const { vehicles } = useVehicleStore();
  const { staffList } = useStaffStore();
  const { transferRecords } = useTransferStore();
  const { storageRecords, units } = useColdStorageStore();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  const now = new Date();

  const getDateRange = () => {
    const end = new Date(now);
    const start = new Date(now);

    switch (timeRange) {
      case 'week':
        start.setDate(start.getDate() - 6);
        break;
      case 'month':
        start.setDate(1);
        break;
      case 'year':
        start.setMonth(0, 1);
        break;
    }
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  };

  const rangeTasks = useMemo(() => {
    const { start, end } = getDateRange();
    return getTasksByDateRange(start, end);
  }, [timeRange, tasks]);

  const completedTasks = useMemo(
    () => rangeTasks.filter((t) => t.status === 'completed'),
    [rangeTasks]
  );

  const totalMileage = useMemo(
    () => completedTasks.reduce((sum, t) => sum + (t.mileage || 0), 0),
    [completedTasks]
  );

  const avgMileage = completedTasks.length > 0
    ? (totalMileage / completedTasks.length).toFixed(1)
    : '0';

  const anomalyCount = useMemo(() => {
    const { start, end } = getDateRange();
    return getAnomalyCountByDateRange(start, end);
  }, [timeRange, tasks]);

  const rangeAnomalies = useMemo(() => {
    const { start, end } = getDateRange();
    return getAnomaliesByDateRange(start, end);
  }, [timeRange, tasks]);

  const unresolvedAnomalyCount = useMemo(() => getUnresolvedAnomalyCount(), [tasks]);
  const averageResolutionTime = useMemo(() => getAverageResolutionTime(), [tasks]);

  const anomalyByType = useMemo(() => {
    const counts: Record<string, number> = {};
    rangeAnomalies.forEach(event => {
      const name = ANOMALY_TYPE_NAMES[event.type] || event.type;
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [rangeAnomalies]);

  const vehicleUsageDetails = useMemo((): VehicleUsageDetail[] => {
    const { start, end } = getDateRange();
    const periodMinutes = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60));

    return vehicles.map(vehicle => {
      const vehicleTasks = completedTasks.filter(t => t.vehicleId === vehicle.id);
      const totalTasks = vehicleTasks.length;
      const totalMileage = vehicleTasks.reduce((sum, t) => sum + (t.mileage || 0), 0);
      
      const totalDurationMinutes = vehicleTasks.reduce((sum, t) => {
        if (t.actualStartTime && t.actualEndTime) {
          return sum + (new Date(t.actualEndTime).getTime() - new Date(t.actualStartTime).getTime()) / (1000 * 60);
        }
        return sum;
      }, 0);

      const utilizationRate = Math.min(100, Math.round((totalDurationMinutes / periodMinutes) * 100));

      return {
        vehicleId: vehicle.id,
        plateNo: vehicle.plateNo,
        totalTasks,
        totalMileage: parseFloat(totalMileage.toFixed(1)),
        totalDurationMinutes: Math.round(totalDurationMinutes),
        utilizationRate,
      };
    }).sort((a, b) => b.utilizationRate - a.utilizationRate);
  }, [completedTasks, vehicles, timeRange]);

  const staffWorkloadDetails = useMemo((): StaffWorkloadDetail[] => {
    const workloadMap: Record<string, StaffWorkloadDetail> = {};

    completedTasks.forEach(task => {
      const duration = task.actualStartTime && task.actualEndTime
        ? (new Date(task.actualEndTime).getTime() - new Date(task.actualStartTime).getTime()) / (1000 * 60)
        : 0;
      const mileage = task.mileage || 0;

      if (task.driverId) {
        const driver = staffList.find(s => s.id === task.driverId);
        if (!workloadMap[task.driverId]) {
          workloadMap[task.driverId] = {
            staffId: task.driverId,
            name: driver?.name || '未知',
            role: 'driver',
            roleName: '司机',
            taskCount: 0,
            totalMileage: 0,
            totalDurationMinutes: 0,
          };
        }
        workloadMap[task.driverId].taskCount++;
        workloadMap[task.driverId].totalMileage += mileage;
        workloadMap[task.driverId].totalDurationMinutes += duration;
      }

      if (task.assistantId) {
        const assistant = staffList.find(s => s.id === task.assistantId);
        if (!workloadMap[task.assistantId]) {
          workloadMap[task.assistantId] = {
            staffId: task.assistantId,
            name: assistant?.name || '未知',
            role: 'assistant',
            roleName: '接运员',
            taskCount: 0,
            totalMileage: 0,
            totalDurationMinutes: 0,
          };
        }
        workloadMap[task.assistantId].taskCount++;
        workloadMap[task.assistantId].totalMileage += mileage;
        workloadMap[task.assistantId].totalDurationMinutes += duration;
      }

      if (task.handlerId) {
        const handler = staffList.find(s => s.id === task.handlerId);
        if (!workloadMap[task.handlerId]) {
          workloadMap[task.handlerId] = {
            staffId: task.handlerId,
            name: handler?.name || '未知',
            role: 'dispatcher',
            roleName: '经办人',
            taskCount: 0,
            totalMileage: 0,
            totalDurationMinutes: 0,
          };
        }
        workloadMap[task.handlerId].taskCount++;
      }

      const taskTransfers = transferRecords.filter(r => r.taskId === task.id);
      taskTransfers.forEach(record => {
        const handlerKey = `handler_${record.handlerName}`;
        if (!workloadMap[handlerKey]) {
          workloadMap[handlerKey] = {
            staffId: handlerKey,
            name: record.handlerName,
            role: 'dispatcher',
            roleName: '经办人',
            taskCount: 0,
            totalMileage: 0,
            totalDurationMinutes: 0,
          };
        }
        workloadMap[handlerKey].taskCount++;
      });
    });

    return Object.values(workloadMap)
      .map(item => ({
        ...item,
        totalMileage: parseFloat(item.totalMileage.toFixed(1)),
        totalDurationMinutes: Math.round(item.totalDurationMinutes),
      }))
      .sort((a, b) => b.taskCount - a.taskCount);
  }, [completedTasks, staffList, transferRecords]);

  const driverWorkload = useMemo(() => 
    staffWorkloadDetails.filter(w => w.role === 'driver'),
    [staffWorkloadDetails]
  );

  const assistantWorkload = useMemo(() => 
    staffWorkloadDetails.filter(w => w.role === 'assistant'),
    [staffWorkloadDetails]
  );

  const handlerWorkload = useMemo(() => 
    staffWorkloadDetails.filter(w => w.roleName === '经办人'),
    [staffWorkloadDetails]
  );

  const chartData = useMemo(() => {
    const data: { label: string; date?: string; month?: string; taskCount: number; mileage: number; anomalyCount: number }[] = [];
    const { start, end } = getDateRange();

    if (timeRange === 'week') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayTasks = rangeTasks.filter((t) => {
          const taskDate = t.createdAt.split('T')[0];
          return taskDate === dateStr;
        });
        
        const dayCompleted = dayTasks.filter((t) => t.status === 'completed');
        const dayMileage = dayCompleted.reduce((sum, t) => sum + (t.mileage || 0), 0);
        const dayAnomaly = dayTasks.reduce((sum, t) => sum + (t.anomalyEvents?.filter(e => {
          const eventDate = new Date(e.occurTime).toISOString().split('T')[0];
          return eventDate === dateStr;
        }).length || 0), 0);
        
        data.push({
          label: `${date.getMonth() + 1}/${date.getDate()}`,
          date: `${date.getMonth() + 1}/${date.getDate()}`,
          taskCount: dayCompleted.length,
          mileage: parseFloat(dayMileage.toFixed(1)),
          anomalyCount: dayAnomaly,
        });
      }
    } else if (timeRange === 'month') {
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const dayTasks = rangeTasks.filter((t) => t.createdAt.split('T')[0] === dateStr);
        const dayCompleted = dayTasks.filter((t) => t.status === 'completed');
        const dayMileage = dayCompleted.reduce((sum, t) => sum + (t.mileage || 0), 0);
        const dayAnomaly = dayTasks.reduce((sum, t) => sum + (t.anomalyEvents?.filter(e => {
          const eventDate = new Date(e.occurTime).toISOString().split('T')[0];
          return eventDate === dateStr;
        }).length || 0), 0);
        
        data.push({
          label: `${i}日`,
          date: `${i}日`,
          taskCount: dayCompleted.length,
          mileage: parseFloat(dayMileage.toFixed(1)),
          anomalyCount: dayAnomaly,
        });
      }
    } else {
      for (let i = 0; i < 12; i++) {
        const monthTasks = rangeTasks.filter((t) => {
          const taskDate = new Date(t.createdAt);
          return taskDate.getMonth() === i;
        });
        const monthCompleted = monthTasks.filter((t) => t.status === 'completed');
        const monthMileage = monthCompleted.reduce((sum, t) => sum + (t.mileage || 0), 0);
        const monthAnomaly = monthTasks.reduce((sum, t) => sum + (t.anomalyEvents?.filter(e => {
          const eventMonth = new Date(e.occurTime).getMonth();
          return eventMonth === i;
        }).length || 0), 0);
        
        data.push({
          label: `${i + 1}月`,
          month: `${i + 1}月`,
          taskCount: monthCompleted.length,
          mileage: parseFloat(monthMileage.toFixed(1)),
          anomalyCount: monthAnomaly,
        });
      }
    }

    return data;
  }, [timeRange, rangeTasks, now]);

  const causeOfDeathData = useMemo(() => {
    const causeCount: Record<string, number> = {};
    completedTasks.forEach((task) => {
      const cause = task.deceased.causeOfDeath || '其他';
      causeCount[cause] = (causeCount[cause] || 0) + 1;
    });

    const colors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#6b7280', '#ec4899', '#14b8a6'];
    const total = completedTasks.length || 1;

    return Object.entries(causeCount).map(([name, value], index) => ({
      name,
      value,
      percent: ((value / total) * 100).toFixed(1),
      color: colors[index % colors.length],
    }));
  }, [completedTasks]);

  const driverCount = staffList.filter((s) => s.role === 'driver').length;
  const assistantCount = staffList.filter((s) => s.role === 'assistant').length;

  const activeVehicles = vehicles.filter((v) => v.status === 'on_duty' || v.status === 'idle').length;

  const avgDuration = useMemo(() => {
    if (completedTasks.length === 0) return 0;
    const totalDuration = completedTasks.reduce((sum, t) => {
      if (t.actualStartTime && t.actualEndTime) {
        return sum + (new Date(t.actualEndTime).getTime() - new Date(t.actualStartTime).getTime());
      }
      return sum;
    }, 0);
    return Math.round(totalDuration / completedTasks.length / (1000 * 60));
  }, [completedTasks]);

  const xAxisKey = timeRange === 'year' ? 'month' : 'date';

  const handleExport = () => {
    const headers = [
      '任务编号',
      '逝者姓名',
      '性别',
      '年龄',
      '接运地址',
      '目的地',
      '预约时间',
      '实际出发时间',
      '实际完成时间',
      '行驶里程(公里)',
      '车辆号牌',
      '司机',
      '接运员',
      '任务状态',
      '是否有交接记录',
      '交接次数',
      '是否冷藏存储',
      '冷藏柜位',
      '异常事件数',
      '异常事件类型',
      '异常处理状态',
      '创建时间',
    ];

    const rows = rangeTasks.map((task) => {
      const vehicle = vehicles.find((v) => v.id === task.vehicleId);
      const driver = staffList.find((s) => s.id === task.driverId);
      const assistant = staffList.find((s) => s.id === task.assistantId);
      const taskTransferRecords = transferRecords.filter((r) => r.taskId === task.id);
      const storageUnit = units.find((u) => u.taskId === task.id);
      const anomalyTypes = (task.anomalyEvents || []).map(e => ANOMALY_TYPE_NAMES[e.type]).join('; ');
      const aStatusMap: Record<string, string> = { pending: '待处理', processing: '处理中', resolved: '已解决' };
      const anomalyStatuses = (task.anomalyEvents || []).map(e => `${ANOMALY_TYPE_NAMES[e.type]}:${aStatusMap[e.status] || '待处理'}`).join('; ');

      const statusMap: Record<string, string> = {
        pending: '待派发',
        dispatched: '已派发',
        in_transit: '接运中',
        arrived: '已到达',
        transferring: '交接中',
        returning: '返程中',
        completed: '已完成',
        cancelled: '已取消',
      };

      const cells = [
        task.taskNo,
        task.deceased.name,
        task.deceased.gender === 'male' ? '男' : '女',
        task.deceased.age,
        task.pickupAddress,
        task.destination,
        task.scheduledTime ? formatDateTime(task.scheduledTime) : '',
        task.actualStartTime ? formatDateTime(task.actualStartTime) : '',
        task.actualEndTime ? formatDateTime(task.actualEndTime) : '',
        task.mileage || '',
        vehicle?.plateNo || '',
        driver?.name || '',
        assistant?.name || '',
        statusMap[task.status] || task.status,
        taskTransferRecords.length > 0 ? '是' : '否',
        taskTransferRecords.length,
        storageUnit ? '是' : '否',
        storageUnit ? `${storageUnit.cabinetNo}柜${storageUnit.layer}层${storageUnit.unitNo}号` : '',
        task.anomalyEvents?.length || 0,
        anomalyTypes || '',
        anomalyStatuses || '',
        formatDateTime(task.createdAt),
      ];
      return cells.map((cell) => {
        const s = String(cell).replace(/"/g, '""');
        return '"' + s + '"';
      }).join(',');
    });

    const rangeLabel = timeRange === 'week' ? '本周' : timeRange === 'month' ? '本月' : '本年';
    
    const summaryHeaders = [
      '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
    ];
    const summaryRows: string[] = [];
    
    summaryRows.push([
      `=== 汇总统计 (${rangeLabel}) ===`, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
    ].map(() => '').join(','));
    
    summaryRows.push([
      '统计指标', '数值', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
    ].map((cell, i) => i === 0 || i === 1 ? `"${cell}"` : '').join(','));
    
    summaryRows.push([
      '完成接运数', completedTasks.length, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
    ].map((cell, i) => i === 0 || i === 1 ? `"${cell}"` : '').join(','));
    
    summaryRows.push([
      '总行驶里程(公里)', totalMileage.toFixed(1), '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
    ].map((cell, i) => i === 0 || i === 1 ? `"${cell}"` : '').join(','));
    
    summaryRows.push([
      '平均单次里程(公里)', avgMileage, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
    ].map((cell, i) => i === 0 || i === 1 ? `"${cell}"` : '').join(','));
    
    summaryRows.push([
      '平均接运时长(分钟)', avgDuration, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
    ].map((cell, i) => i === 0 || i === 1 ? `"${cell}"` : '').join(','));
    
    summaryRows.push([
      '异常事件数', anomalyCount, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
    ].map((cell, i) => i === 0 || i === 1 ? `"${cell}"` : '').join(','));
    
    summaryRows.push([
      '未处理异常数', unresolvedAnomalyCount, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
    ].map((cell, i) => i === 0 || i === 1 ? `"${cell}"` : '').join(','));
    
    summaryRows.push([
      '平均异常处理时长(分钟)', averageResolutionTime, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
    ].map((cell, i) => i === 0 || i === 1 ? `"${cell}"` : '').join(','));
    
    summaryRows.push([
      '任务完成率', rangeTasks.length > 0 ? `${Math.round((completedTasks.length / rangeTasks.length) * 100)}%` : '-', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
    ].map((cell, i) => i === 0 || i === 1 ? `"${cell}"` : '').join(','));

    summaryRows.push(['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''].join(','));
    summaryRows.push(['=== 车辆使用详情 ===', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''].join(','));
    summaryRows.push(['车辆号牌', '任务数', '总里程(公里)', '总时长(分钟)', '使用率(%)', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''].map((cell, i) => i < 5 ? `"${cell}"` : '').join(','));
    
    vehicleUsageDetails.forEach(v => {
      summaryRows.push([
        v.plateNo, v.totalTasks, v.totalMileage, v.totalDurationMinutes, v.utilizationRate,
        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
      ].map((cell, i) => i < 5 ? `"${cell}"` : '').join(','));
    });

    summaryRows.push(['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''].join(','));
    summaryRows.push(['=== 人员工作量详情 ===', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''].join(','));
    summaryRows.push(['姓名', '角色', '任务数', '总里程(公里)', '总时长(分钟)', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''].map((cell, i) => i < 5 ? `"${cell}"` : '').join(','));
    
    staffWorkloadDetails.forEach(s => {
      summaryRows.push([
        s.name, s.roleName, s.taskCount, s.totalMileage, s.totalDurationMinutes,
        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
      ].map((cell, i) => i < 5 ? `"${cell}"` : '').join(','));
    });

    const csvContent = '\uFEFF' + [
      headers.join(','), 
      ...rows, 
      ...summaryRows
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `接运记录_${rangeLabel}_${formatDate(new Date())}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const ANOMALY_COLORS = ['#ef4444', '#f59e0b', '#8b5cf6', '#3b82f6', '#10b981', '#6b7280'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">统计分析</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
            {(['week', 'month', 'year'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
                  timeRange === range
                    ? 'bg-amber-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {range === 'week' ? '本周' : range === 'month' ? '本月' : '本年'}
              </button>
            ))}
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <FileDown className="w-4 h-4" />
            导出完整报表
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{completedTasks.length}</p>
          <p className="text-sm text-gray-500 mt-1">完成接运</p>
          <p className="text-xs text-gray-400 mt-2">
            总任务 {rangeTasks.length} 单
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{totalMileage.toFixed(1)}</p>
          <p className="text-sm text-gray-500 mt-1">总行驶里程 (km)</p>
          <p className="text-xs text-gray-400 mt-2">
            平均单次 {avgMileage} km
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Truck className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{vehicles.length}</p>
          <p className="text-sm text-gray-500 mt-1">车辆总数</p>
          <p className="text-xs text-gray-400 mt-2">
            在用 {activeVehicles} 辆 · 执勤中 {vehicles.filter(v => v.status === 'on_duty').length} 辆
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{staffList.length}</p>
          <p className="text-sm text-gray-500 mt-1">工作人员</p>
          <p className="text-xs text-gray-400 mt-2">
            司机 {driverCount} 人 · 接运员 {assistantCount} 人
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{anomalyCount}</p>
          <p className="text-sm text-gray-500 mt-1">异常事件</p>
          <p className="text-xs text-red-600 mt-2">
            未处理 {unresolvedAnomalyCount} 条{averageResolutionTime > 0 ? ` · 平均处理 ${averageResolutionTime} 分钟` : ''}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-800">接运量趋势</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={xAxisKey} tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                }}
              />
              <Legend />
              <Bar dataKey="taskCount" name="接运量" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="anomalyCount" name="异常数" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-800">里程统计</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={xAxisKey} tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                }}
              />
              <Line
                type="monotone"
                dataKey="mileage"
                name="里程(km)"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {(anomalyByType.length > 0 || unresolvedAnomalyCount > 0) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-800">异常事件类型分布</h3>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={anomalyByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {anomalyByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={ANOMALY_COLORS[index % ANOMALY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="lg:col-span-2">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {anomalyByType.map((item, index) => (
                  <div key={item.name} className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: ANOMALY_COLORS[index % ANOMALY_COLORS.length] }}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                      <p className="text-lg font-bold text-gray-900">{item.value} 次</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-800">死因分布</h3>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          {causeOfDeathData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={causeOfDeathData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {causeOfDeathData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {causeOfDeathData.slice(0, 4).map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-xs text-gray-600">
                      {item.name} ({item.percent}%)
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-gray-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">暂无数据</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-800">车辆使用率排行 (按实际时长)</h3>
            <Gauge className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={vehicleUsageDetails.slice(0, 8)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="plateNo" type="category" tick={{ fontSize: 12 }} width={70} />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                }}
                formatter={(value: any, name: string) => {
                  const nameMap: Record<string, string> = {
                    utilizationRate: '使用率(%)',
                    totalMileage: '总里程(km)',
                    totalDurationMinutes: '总时长(分钟)',
                    totalTasks: '任务数',
                  };
                  return [value, nameMap[name] || name];
                }}
              />
              <Legend />
              <Bar dataKey="utilizationRate" name="使用率(%)" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              <Bar dataKey="totalMileage" name="总里程(km)" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {driverWorkload.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-800">司机工作量</h3>
              <Truck className="w-5 h-5 text-blue-500" />
            </div>
            <div className="space-y-3">
              {driverWorkload.slice(0, 6).map((item) => (
                <div key={item.staffId} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.taskCount} 单 · {item.totalMileage} km</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-600">{item.totalDurationMinutes} 分钟</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {assistantWorkload.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-800">接运员工作量</h3>
              <Users className="w-5 h-5 text-green-500" />
            </div>
            <div className="space-y-3">
              {assistantWorkload.slice(0, 6).map((item) => (
                <div key={item.staffId} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.taskCount} 单 · {item.totalMileage} km</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">{item.totalDurationMinutes} 分钟</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {handlerWorkload.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-800">经办人工作量</h3>
              <FileSpreadsheet className="w-5 h-5 text-purple-500" />
            </div>
            <div className="space-y-3">
              {handlerWorkload.slice(0, 6).map((item) => (
                <div key={item.staffId} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.taskCount} 次交接/经办</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-gray-800">车辆使用情况明细</h3>
          <Truck className="w-5 h-5 text-gray-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">车辆号牌</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-gray-500">任务数</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-gray-500">总里程(km)</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-gray-500">总时长(分钟)</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-gray-500">使用率</th>
              </tr>
            </thead>
            <tbody>
              {vehicleUsageDetails.map((item) => (
                <tr key={item.vehicleId} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-800">{item.plateNo}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 text-center">{item.totalTasks}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 text-center">{item.totalMileage}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 text-center">{item.totalDurationMinutes}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all"
                          style={{ width: `${item.utilizationRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{item.utilizationRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-gray-800">关键指标</h3>
          <FileSpreadsheet className="w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-600">{avgMileage}</p>
            <p className="text-sm text-gray-500 mt-1">平均单次里程 (km)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{avgDuration || '-'}</p>
            <p className="text-sm text-gray-500 mt-1">平均接运时长 (分钟)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {rangeTasks.length > 0 ? `${Math.round((completedTasks.length / rangeTasks.length) * 100)}` : '-'}%
            </p>
            <p className="text-sm text-gray-500 mt-1">完成率</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{transferRecords.length}</p>
            <p className="text-sm text-gray-500 mt-1">交接记录总数</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{anomalyCount}</p>
            <p className="text-sm text-gray-500 mt-1">异常事件数</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{unresolvedAnomalyCount}</p>
            <p className="text-sm text-gray-500 mt-1">未处理异常数</p>
          </div>
        </div>
      </div>
    </div>
  );
}
