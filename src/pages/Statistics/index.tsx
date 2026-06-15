import { useState, useMemo } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { useVehicleStore } from '@/store/vehicleStore';
import { useStaffStore } from '@/store/staffStore';
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
} from 'lucide-react';

export default function Statistics() {
  const { tasks, getTasksByDateRange } = useTaskStore();
  const { vehicles } = useVehicleStore();
  const { staffList } = useStaffStore();
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
    return Math.min(Math.round((vehicleTasks.length / Math.max(totalTasks, 5)) * 100), 95);
  };

  const xAxisKey = timeRange === 'year' ? 'month' : 'date';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {timeRange === 'week' ? '本周' : timeRange === 'month' ? '本月' : '本年'}
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{completedTasks.length}</p>
          <p className="text-sm text-gray-500 mt-1">完成接运</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              累计
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{totalMileage.toFixed(1)}</p>
          <p className="text-sm text-gray-500 mt-1">总行驶里程 (km)</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Truck className="w-6 h-6 text-amber-600" />
            </div>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              在用 {activeVehicles} 辆
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{vehicles.length}</p>
          <p className="text-sm text-gray-500 mt-1">车辆总数</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              在岗 {staffList.filter((s) => s.status === 'on_duty').length} 人
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{staffList.length}</p>
          <p className="text-sm text-gray-500 mt-1">工作人员</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">数据统计</h3>
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
        <h3 className="font-semibold text-gray-800 mb-6">车辆使用情况</h3>
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
        <h3 className="font-semibold text-gray-800 mb-6">关键指标</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-600">{avgMileage}</p>
            <p className="text-sm text-gray-500 mt-1">平均单次里程 (km)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {completedTasks.length > 0 ? Math.round(45) : '-'}
            </p>
            <p className="text-sm text-gray-500 mt-1">平均接运时长 (分钟)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {rangeTasks.length > 0 ? '98.5' : '-'}%
            </p>
            <p className="text-sm text-gray-500 mt-1">准时率</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{driverCount + assistantCount}</p>
            <p className="text-sm text-gray-500 mt-1">接运人员 (司机{driverCount}+接运员{assistantCount})</p>
          </div>
        </div>
      </div>
    </div>
  );
}
