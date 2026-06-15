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
} from 'lucide-react';
import { formatDateTime, formatDate } from '@/utils';

export default function Statistics() {
  const { tasks, getTasksByDateRange } = useTaskStore();
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

  const chartData = useMemo(() => {
    const data: { label: string; date?: string; month?: string; taskCount: number; mileage: number }[] = [];
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
        
        data.push({
          label: `${date.getMonth() + 1}/${date.getDate()}`,
          date: `${date.getMonth() + 1}/${date.getDate()}`,
          taskCount: dayCompleted.length,
          mileage: parseFloat(dayMileage.toFixed(1)),
        });
      }
    } else if (timeRange === 'month') {
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const dayTasks = rangeTasks.filter((t) => t.createdAt.split('T')[0] === dateStr);
        const dayCompleted = dayTasks.filter((t) => t.status === 'completed');
        const dayMileage = dayCompleted.reduce((sum, t) => sum + (t.mileage || 0), 0);
        
        data.push({
          label: `${i}日`,
          date: `${i}日`,
          taskCount: dayCompleted.length,
          mileage: parseFloat(dayMileage.toFixed(1)),
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
        
        data.push({
          label: `${i + 1}月`,
          month: `${i + 1}月`,
          taskCount: monthCompleted.length,
          mileage: parseFloat(monthMileage.toFixed(1)),
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

  const staffWorkload = useMemo(() => {
    const driverMap: Record<string, { name: string; tasks: number; mileage: number }> = {};

    completedTasks.forEach((task) => {
      if (task.driverId) {
        const driver = staffList.find((s) => s.id === task.driverId);
        const name = driver?.name || '未知司机';
        if (!driverMap[task.driverId]) {
          driverMap[task.driverId] = { name, tasks: 0, mileage: 0 };
        }
        driverMap[task.driverId].tasks += 1;
        driverMap[task.driverId].mileage += task.mileage || 0;
      }
    });

    const result = Object.values(driverMap)
      .sort((a, b) => b.tasks - a.tasks)
      .slice(0, 6);

    if (result.length === 0) {
      return staffList
        .filter((s) => s.role === 'driver')
        .slice(0, 6)
        .map((s) => ({ name: s.name, tasks: 0, mileage: 0 }));
    }

    return result.map((item) => ({
      ...item,
      mileage: parseFloat(item.mileage.toFixed(0)),
    }));
  }, [completedTasks, staffList]);

  const driverCount = staffList.filter((s) => s.role === 'driver').length;
  const assistantCount = staffList.filter((s) => s.role === 'assistant').length;

  const activeVehicles = vehicles.filter((v) => v.status === 'on_duty' || v.status === 'idle').length;

  const getVehicleUtilization = (vehicleId: string) => {
    const vehicleTasks = completedTasks.filter((t) => t.vehicleId === vehicleId);
    const totalTasks = completedTasks.length;
    if (totalTasks === 0) return 0;
    return Math.min(Math.round((vehicleTasks.length / Math.max(totalTasks, 5)) * 100), 100);
  };

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
      '创建时间',
    ];

    const rows = rangeTasks.map((task) => {
      const vehicle = vehicles.find((v) => v.id === task.vehicleId);
      const driver = staffList.find((s) => s.id === task.driverId);
      const assistant = staffList.find((s) => s.id === task.assistantId);
      const taskTransferRecords = transferRecords.filter((r) => r.taskId === task.id);
      const storageUnit = units.find((u) => u.taskId === task.id);

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

      return [
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
        formatDateTime(task.createdAt),
      ].map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    
    const rangeLabel = timeRange === 'week' ? '本周' : timeRange === 'month' ? '本月' : '本年';
    link.setAttribute('download', `接运记录_${rangeLabel}_${formatDate(new Date())}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
            <Download className="w-4 h-4" />
            导出接运记录
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <Bar dataKey="taskCount" name="接运量" fill="#f59e0b" radius={[4, 4, 0, 0]} />
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
            <h3 className="font-semibold text-gray-800">人员工作量排行</h3>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={staffWorkload} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={60} />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                }}
              />
              <Legend />
              <Bar dataKey="tasks" name="接运次数" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              <Bar dataKey="mileage" name="里程(km)" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-gray-800">车辆使用情况</h3>
          <Truck className="w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {vehicles.map((vehicle) => {
            const utilization = getVehicleUtilization(vehicle.id);
            return (
              <div key={vehicle.id} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${
                  vehicle.status === 'on_duty' ? 'bg-blue-100' :
                  vehicle.status === 'idle' ? 'bg-green-100' : 'bg-gray-200'
                }`}>
                  <Truck className={`w-6 h-6 ${
                    vehicle.status === 'on_duty' ? 'text-blue-600' :
                    vehicle.status === 'idle' ? 'text-green-600' : 'text-gray-500'
                  }`} />
                </div>
                <p className="text-sm font-medium text-gray-800 truncate">{vehicle.plateNo}</p>
                <p className="text-xs text-gray-500 mt-1">使用率 {utilization}%</p>
                <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${utilization}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-gray-800">关键指标</h3>
          <FileSpreadsheet className="w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-600">{avgMileage}</p>
            <p className="text-sm text-gray-500 mt-1">平均单次里程 (km)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {completedTasks.length > 0 ? (() => {
                const totalDuration = completedTasks.reduce((sum, t) => {
                  if (t.actualStartTime && t.actualEndTime) {
                    return sum + (new Date(t.actualEndTime).getTime() - new Date(t.actualStartTime).getTime());
                  }
                  return sum;
                }, 0);
                const avgDuration = totalDuration / completedTasks.length / (1000 * 60);
                return Math.round(avgDuration) || '-';
              })() : '-'}
            </p>
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
        </div>
      </div>
    </div>
  );
}
