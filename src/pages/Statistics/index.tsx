import { useState } from 'react';
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

// 生成最近7天的模拟统计数据
const generateWeeklyData = () => {
  const data = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const taskCount = Math.floor(Math.random() * 8) + 3;
    const mileage = Math.floor(Math.random() * 100) + 50;
    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      taskCount,
      mileage,
    });
  }
  return data;
};

// 生成月度数据
const generateMonthlyData = () => {
  const data = [];
  for (let i = 1; i <= 12; i++) {
    const taskCount = Math.floor(Math.random() * 50) + 80;
    const mileage = Math.floor(Math.random() * 500) + 800;
    data.push({
      month: `${i}月`,
      taskCount,
      mileage,
    });
  }
  return data;
};

// 死因分布数据
const causeOfDeathData = [
  { name: '心脏病', value: 35, color: '#3b82f6' },
  { name: '癌症', value: 28, color: '#8b5cf6' },
  { name: '脑血管疾病', value: 18, color: '#f59e0b' },
  { name: '交通事故', value: 10, color: '#ef4444' },
  { name: '自然死亡', value: 6, color: '#10b981' },
  { name: '其他', value: 3, color: '#6b7280' },
];

// 人员工作量数据
const generateStaffWorkload = () => {
  return [
    { name: '陈建国', tasks: 45, mileage: 1280 },
    { name: '刘德明', tasks: 42, mileage: 1150 },
    { name: '王志强', tasks: 38, mileage: 1020 },
    { name: '吴大勇', tasks: 35, mileage: 980 },
    { name: '孙建华', tasks: 32, mileage: 890 },
    { name: '徐晓东', tasks: 28, mileage: 760 },
  ];
};

export default function Statistics() {
  const { tasks } = useTaskStore();
  const { vehicles } = useVehicleStore();
  const { staffList } = useStaffStore();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  const weeklyData = generateWeeklyData();
  const monthlyData = generateMonthlyData();
  const staffWorkload = generateStaffWorkload();

  const chartData = timeRange === 'week' ? weeklyData : monthlyData;

  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const totalMileage = tasks
    .filter((t) => t.mileage)
    .reduce((sum, t) => sum + (t.mileage || 0), 0);
  const avgMileage = completedTasks > 0 ? (totalMileage / completedTasks).toFixed(1) : 0;

  const driverCount = staffList.filter((s) => s.role === 'driver').length;
  const assistantCount = staffList.filter((s) => s.role === 'assistant').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              +12%
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{completedTasks}</p>
          <p className="text-sm text-gray-500 mt-1">本月完成接运</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              +8%
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
              在用 {vehicles.filter((v) => v.status === 'on_duty' || v.status === 'idle').length} 辆
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
              <XAxis dataKey={timeRange === 'year' ? 'month' : 'date'} tick={{ fontSize: 12 }} />
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
              <XAxis dataKey={timeRange === 'year' ? 'month' : 'date'} tick={{ fontSize: 12 }} />
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
                  {item.name} ({item.value}%)
                </span>
              </div>
            ))}
          </div>
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
            const utilization = Math.floor(Math.random() * 40) + 50;
            return (
              <div key={vehicle.id} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 mx-auto mb-3 bg-slate-200 rounded-xl flex items-center justify-center">
                  <Truck className="w-6 h-6 text-slate-600" />
                </div>
                <p className="text-sm font-medium text-gray-800 truncate">{vehicle.plateNo}</p>
                <p className="text-xs text-gray-500 mt-1">使用率 {utilization}%</p>
                <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2">
                  <div
                    className="h-full bg-amber-500 rounded-full"
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
            <p className="text-2xl font-bold text-blue-600">45</p>
            <p className="text-sm text-gray-500 mt-1">平均接运时长 (分钟)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">98.5%</p>
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
