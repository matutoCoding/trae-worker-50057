import { create } from 'zustand';
import { mockSchedules } from '@/data/schedules';
import { loadFromStorage, saveToStorage, hasStorageData } from '@/utils/storage';
import type { ScheduleRecord, ShiftType } from '@/types';

const STORAGE_KEY = 'schedules';

function getInitialSchedules(): ScheduleRecord[] {
  if (hasStorageData(STORAGE_KEY)) {
    return loadFromStorage<ScheduleRecord[]>(STORAGE_KEY, mockSchedules);
  }
  return mockSchedules;
}

interface ScheduleStore {
  schedules: ScheduleRecord[];
  _hasHydrated: boolean;
  
  addSchedule: (schedule: Omit<ScheduleRecord, 'id'>) => void;
  updateSchedule: (id: string, updates: Partial<ScheduleRecord>) => void;
  deleteSchedule: (id: string) => void;
  getSchedulesByDate: (date: string) => ScheduleRecord[];
  getSchedulesByStaff: (staffId: string) => ScheduleRecord[];
  getNightShiftStaff: (date: string) => ScheduleRecord[];
  setShift: (staffId: string, staffName: string, date: string, shiftType: ShiftType) => void;
  _persist: (schedules: ScheduleRecord[]) => void;
}

export const useScheduleStore = create<ScheduleStore>((set, get) => ({
  schedules: getInitialSchedules(),
  _hasHydrated: true,

  _persist: (schedules) => {
    saveToStorage(STORAGE_KEY, schedules);
  },

  addSchedule: (scheduleData) => {
    const newSchedule: ScheduleRecord = {
      ...scheduleData,
      id: Date.now().toString(),
    };
    const newList = [...get().schedules, newSchedule];
    set({ schedules: newList });
    get()._persist(newList);
  },

  updateSchedule: (id, updates) => {
    const newList = get().schedules.map((schedule) =>
      schedule.id === id ? { ...schedule, ...updates } : schedule
    );
    set({ schedules: newList });
    get()._persist(newList);
  },

  deleteSchedule: (id) => {
    const newList = get().schedules.filter((schedule) => schedule.id !== id);
    set({ schedules: newList });
    get()._persist(newList);
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
    
    let newList: ScheduleRecord[];
    if (existing) {
      newList = get().schedules.map((s) =>
        s.id === existing.id
          ? { ...s, shiftType, isNightShift: shiftType === 'night' }
          : s
      );
    } else {
      const newSchedule: ScheduleRecord = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        staffId,
        staffName,
        date,
        shiftType,
        isNightShift: shiftType === 'night',
      };
      newList = [...get().schedules, newSchedule];
    }
    set({ schedules: newList });
    get()._persist(newList);
  },
}));
