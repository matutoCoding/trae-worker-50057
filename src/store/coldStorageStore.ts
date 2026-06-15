import { create } from 'zustand';
import { mockColdStorage } from '@/data/coldStorage';
import type { ColdStorageUnit, StorageUnitStatus } from '@/types';

interface ColdStorageStore {
  units: ColdStorageUnit[];
  updateUnitStatus: (id: string, status: StorageUnitStatus, data?: Partial<ColdStorageUnit>) => void;
  getUnitById: (id: string) => ColdStorageUnit | undefined;
  getUnitsByStatus: (status: StorageUnitStatus) => ColdStorageUnit[];
  getUnitsByCabinet: (cabinetNo: string) => ColdStorageUnit[];
  getAvailableUnits: () => ColdStorageUnit[];
  getOccupiedUnits: () => ColdStorageUnit[];
  storeBody: (unitId: string, taskId: string, deceasedName: string) => void;
  releaseUnit: (unitId: string) => void;
}

export const useColdStorageStore = create<ColdStorageStore>((set, get) => ({
  units: mockColdStorage,
  
  updateUnitStatus: (id, status, data) => {
    set((state) => ({
      units: state.units.map((unit) =>
        unit.id === id ? { ...unit, status, ...data } : unit
      ),
    }));
  },
  
  getUnitById: (id) => {
    return get().units.find((unit) => unit.id === id);
  },
  
  getUnitsByStatus: (status) => {
    return get().units.filter((unit) => unit.status === status);
  },
  
  getUnitsByCabinet: (cabinetNo) => {
    return get().units.filter((unit) => unit.cabinetNo === cabinetNo);
  },
  
  getAvailableUnits: () => {
    return get().units.filter((unit) => unit.status === 'empty');
  },
  
  getOccupiedUnits: () => {
    return get().units.filter((unit) => unit.status === 'occupied');
  },
  
  storeBody: (unitId, taskId, deceasedName) => {
    set((state) => ({
      units: state.units.map((unit) =>
        unit.id === unitId
          ? {
              ...unit,
              status: 'occupied' as StorageUnitStatus,
              taskId,
              deceasedName,
              storageTime: new Date().toISOString(),
            }
          : unit
      ),
    }));
  },
  
  releaseUnit: (unitId) => {
    set((state) => ({
      units: state.units.map((unit) =>
        unit.id === unitId
          ? {
              ...unit,
              status: 'empty' as StorageUnitStatus,
              taskId: undefined,
              deceasedName: undefined,
              storageTime: undefined,
              expectedPickupTime: undefined,
            }
          : unit
      ),
    }));
  },
}));
