import { create } from 'zustand';
import { mockStaff } from '@/data/staff';
import type { Staff, StaffRole, StaffStatus } from '@/types';

interface StaffStore {
  staffList: Staff[];
  addStaff: (staff: Omit<Staff, 'id'>) => void;
  updateStaff: (id: string, updates: Partial<Staff>) => void;
  updateStaffStatus: (id: string, status: StaffStatus) => void;
  getStaffById: (id: string) => Staff | undefined;
  getStaffByRole: (role: StaffRole) => Staff[];
  getStaffByStatus: (status: StaffStatus) => Staff[];
  getAvailableDrivers: () => Staff[];
  getAvailableAssistants: () => Staff[];
}

export const useStaffStore = create<StaffStore>((set, get) => ({
  staffList: mockStaff,
  
  addStaff: (staffData) => {
    const newStaff: Staff = {
      ...staffData,
      id: Date.now().toString(),
    };
    set((state) => ({ staffList: [...state.staffList, newStaff] }));
  },
  
  updateStaff: (id, updates) => {
    set((state) => ({
      staffList: state.staffList.map((staff) =>
        staff.id === id ? { ...staff, ...updates } : staff
      ),
    }));
  },
  
  updateStaffStatus: (id, status) => {
    set((state) => ({
      staffList: state.staffList.map((staff) =>
        staff.id === id ? { ...staff, status } : staff
      ),
    }));
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
