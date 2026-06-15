import { create } from 'zustand';
import { mockSchedules } from '@/data/schedules';
import type { ScheduleRecord, ShiftType } from '@/types';

interface ScheduleStore {
  schedules: ScheduleRecord[];
  addSchedule: (schedule: Omit<ScheduleRecord, 'id'>) => void;
  updateSchedule: (id: string, updates: Partial<ScheduleRecord>) => void;
  deleteSchedule: (id: string) => void;
  getSchedulesByDate: (date: string) => ScheduleRecord[];
  getSchedulesByStaff: (staffId: string) => ScheduleRecord[];
  getNightShiftStaff: (date: string) => ScheduleRecord[];
  setShift: (staffId: string, staffName: string, date: string, shiftType: ShiftType) => void;
}

export const useScheduleStore = create<ScheduleStore>((set, get) => ({
  schedules: mockSchedules,
  
  addSchedule: (scheduleData) => {
    const newSchedule: ScheduleRecord = {
      ...scheduleData,
      id: Date.now().toString(),
    };
    set((state) => ({ schedules: [...state.schedules, newSchedule] }));
  },
  
  updateSchedule: (id, updates) => {
    set((state) => ({
      schedules: state.schedules.map((schedule) =>
        schedule.id === id ? { ...schedule, ...updates } : schedule
      ),
    }));
  },
  
  deleteSchedule: (id) => {
    set((state) => ({
      schedules: state.schedules.filter((schedule) => schedule.id !== id),
    }));
  },
  
  getSchedulesByDate: (date) => {
    return get().schedules.filter((schedule) => schedule.date === date);
  },
  
  getSchedulesByStaff: (staffId) => {
    return get().schedules.filter((schedule) => schedule.staffId === staffId);
  },
  
  getNightShiftStaff: (date) => {
    return get().schedules.filter(
      (schedule) => schedule.date === date && schedule.isNightShift
    );
  },
  
  setShift: (staffId, staffName, date, shiftType) => {
    const existing = get().schedules.find(
      (s) => s.staffId === staffId && s.date === date
    );
    
    if (existing) {
      set((state) => ({
        schedules: state.schedules.map((s) =>
          s.id === existing.id
            ? { ...s, shiftType, isNightShift: shiftType === 'night' }
            : s
        ),
      }));
    } else {
      const newSchedule: ScheduleRecord = {
        id: Date.now().toString(),
        staffId,
        staffName,
        date,
        shiftType,
        isNightShift: shiftType === 'night',
      };
      set((state) => ({ schedules: [...state.schedules, newSchedule] }));
    }
  },
}));
