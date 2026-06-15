import { create } from 'zustand';
import { mockStaff } from '@/data/staff';
import { loadFromStorage, saveToStorage, hasStorageData } from '@/utils/storage';
import type { Staff, StaffRole, StaffStatus } from '@/types';

const STORAGE_KEY = 'staff';

function getInitialStaff(): Staff[] {
  if (hasStorageData(STORAGE_KEY)) {
    return loadFromStorage<Staff[]>(STORAGE_KEY, mockStaff);
  }
  return mockStaff;
}

interface StaffStore {
  staffList: Staff[];
  _hasHydrated: boolean;
  
  addStaff: (staff: Omit<Staff, 'id'>) => void;
  updateStaff: (id: string, updates: Partial<Staff>) => void;
  updateStaffStatus: (id: string, status: StaffStatus) => void;
  getStaffById: (id: string) => Staff | undefined;
  getStaffByRole: (role: StaffRole) => Staff[];
  getStaffByStatus: (status: StaffStatus) => Staff[];
  getAvailableDrivers: () => Staff[];
  getAvailableAssistants: () => Staff[];
  _persist: (staffList: Staff[]) => void;
}

export const useStaffStore = create<StaffStore>((set, get) => ({
  staffList: getInitialStaff(),
  _hasHydrated: true,

  _persist: (staffList) => {
    saveToStorage(STORAGE_KEY, staffList);
  },

  addStaff: (staffData) => {
    const newStaff: Staff = {
      ...staffData,
      id: Date.now().toString(),
    };
    const newList = [...get().staffList, newStaff];
    set({ staffList: newList });
    get()._persist(newList);
  },

  updateStaff: (id, updates) => {
    const newList = get().staffList.map((staff) =>
      staff.id === id ? { ...staff, ...updates } : staff
    );
    set({ staffList: newList });
    get()._persist(newList);
  },

  updateStaffStatus: (id, status) => {
    const newList = get().staffList.map((staff) =>
      staff.id === id ? { ...staff, status } : staff
    );
    set({ staffList: newList });
    get()._persist(newList);
  },

  getStaffById: (id) => {
    return get().staffList.find((staff) => staff.id === id);
  },

  getStaffByRole: (role) => {
    return get().staffList.filter((staff) => staff.role === role);
  },

  getStaffByStatus: (status) => {
    return get().staffList.filter((staff) => staff.status === status);
  },

  getAvailableDrivers: () => {
    return get().staffList.filter(
      (staff) => staff.role === 'driver' && (staff.status === 'on_duty' || staff.status === 'night_shift')
    );
  },

  getAvailableAssistants: () => {
    return get().staffList.filter(
      (staff) => staff.role === 'assistant' && (staff.status === 'on_duty' || staff.status === 'night_shift')
    );
  },
}));
