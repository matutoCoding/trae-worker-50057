import { useState } from 'react';
import { useStaffStore } from '@/store/staffStore';
import { useScheduleStore } from '@/store/scheduleStore';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDate, roleMap, shiftTypeMap } from '@/utils';
import {
  Users,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Coffee,
  UserPlus,
  Search,
  Filter,
  Moon as MoonIcon,
} from 'lucide-react';
import type { ShiftType, StaffRole } from '@/types';

const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export default function StaffScheduling() {
  const { staffList, getStaffByRole } = useStaffStore();
  const { schedules, getSchedulesByDate, setShift, getNightShiftStaff } = useScheduleStore();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState<StaffRole | 'all'>('all');

  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });

  const prevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const filteredStaff = staffList.filter((staff) => {
    const matchesRole = roleFilter === 'all' || staff.role === roleFilter;
    const matchesSearch =
      searchText === '' ||
      staff.name.includes(searchText) ||
      staff.phone.includes(searchText);
    return matchesRole && matchesSearch;
  });

  const getShiftForStaff = (staffId: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const daySchedules = getSchedulesByDate(dateStr);
    return daySchedules.find((s) => s.staffId === staffId);
  };

  const handleShiftChange = (staffId: string, staffName: string, date: Date, shift: ShiftType) => {
    const dateStr = date.toISOString().split('T')[0];
    setShift(staffId, staffName, dateStr, shift);
  };

  const nightShiftToday = getNightShiftStaff(new Date().toISOString().split('T')[0]);

  const shiftOptions: { value: ShiftType; label: string; icon: typeof Sun }[] = [
    { value: 'morning', label: '早班', icon: Sun },
    { value: 'afternoon', label: '中班', icon: Coffee },
    { value: 'night', label: '夜班', icon: Moon },
    { value: 'day_off', label: '休息', icon: MoonIcon },
  ];

  const stats = {
    total: staffList.length,
    onDuty: staffList.filter((s) => s.status === 'on_duty').length,
    nightShift: staffList.filter((s) => s.status === 'night_shift').length,
    offDuty: staffList.filter((s) => s.status === 'off_duty' || s.status === 'leave').length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">人员总数</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">在岗人员</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.onDuty}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">夜间值班</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">{nightShiftToday.length}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Moon className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">离岗/请假</p>
              <p className="text-2xl font-bold text-gray-500 mt-1">{stats.offDuty}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <Coffee className="w-6 h-6 text-gray-500" />
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
              placeholder="搜索人员..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-64 h-10 pl-9 pr-4 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
            />
          </div>
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
            <Filter className="w-4 h-4 text-gray-400 ml-2" />
            {(['all', 'driver', 'assistant', 'dispatcher'] as const).map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  roleFilter === role
                    ? 'bg-amber-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {role === 'all' ? '全部' : roleMap[role]}
              </button>
            ))}
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium">
          <UserPlus className="w-4 h-4" />
          添加人员
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CalendarIcon className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-800">排班日历</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={prevWeek}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <span className="text-sm font-medium text-gray-700 min-w-[160px] text-center">
              {formatDate(weekDates[0])} ~ {formatDate(weekDates[6])}
            </span>
            <button
              onClick={nextWeek}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 w-48 sticky left-0 bg-gray-50 z-10">
                  人员
                </th>
                {weekDates.map((date, index) => (
                  <th
                    key={index}
                    className={`text-center px-2 py-3 text-sm font-semibold min-w-[100px] ${
                      isToday(date) ? 'bg-amber-50 text-amber-700' : 'text-gray-700'
                    }`}
                  >
                    <div>{weekDays[index]}</div>
                    <div className="text-xs font-normal mt-0.5">
                      {date.getMonth() + 1}/{date.getDate()}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStaff.map((staff) => (
                <tr key={staff.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 sticky left-0 bg-white hover:bg-gray-50 z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-700 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {staff.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{staff.name}</p>
                        <p className="text-xs text-gray-500">{roleMap[staff.role]}</p>
                      </div>
                    </div>
                  </td>
                  {weekDates.map((date, index) => {
                    const schedule = getShiftForStaff(staff.id, date);
                    const shiftType = schedule?.shiftType || 'day_off';
                    return (
                      <td key={index} className="px-2 py-3 text-center">
                        <div
                          className={`inline-block cursor-pointer px-2 py-1 rounded text-xs font-medium transition-colors ${
                            shiftTypeMap[shiftType].color
                          }`}
                          onClick={() => {
                            const types: ShiftType[] = ['morning', 'afternoon', 'night', 'day_off'];
                            const currentIndex = types.indexOf(shiftType);
                            const nextType = types[(currentIndex + 1) % types.length];
                            handleShiftChange(staff.id, staff.name, date, nextType);
                          }}
                          title="点击切换班次"
                        >
                          {shiftTypeMap[shiftType].label}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">人员状态</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {staffList.map((staff) => (
            <div
              key={staff.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="relative">
                <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {staff.name.charAt(0)}
                </div>
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                    staff.status === 'on_duty'
                      ? 'bg-green-500'
                      : staff.status === 'night_shift'
                      ? 'bg-indigo-500'
                      : staff.status === 'leave'
                      ? 'bg-yellow-500'
                      : 'bg-gray-400'
                  }`}
                ></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{staff.name}</p>
                <p className="text-xs text-gray-500">{roleMap[staff.role]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
