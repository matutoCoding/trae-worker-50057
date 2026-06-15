import { create } from 'zustand';
import { mockColdStorage } from '@/data/coldStorage';
import { loadFromStorage, saveToStorage, hasStorageData } from '@/utils/storage';
import type { ColdStorageUnit, StorageUnitStatus, StorageRecord, ExpiryStatus } from '@/types';

const STORAGE_KEY = 'coldStorage';
const RECORDS_KEY = 'storageRecords';
const EXPIRY_WARNING_DAYS = 3;

function calculateExpiry(unit: ColdStorageUnit, now: Date): ColdStorageUnit {
  if (!unit.expectedPickupTime || unit.status !== 'occupied') {
    return { ...unit, expiryStatus: 'normal' as ExpiryStatus, daysRemaining: undefined };
  }

  const pickupDate = new Date(unit.expectedPickupTime);
  pickupDate.setHours(23, 59, 59, 999);
  
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  
  const diffTime = pickupDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let expiryStatus: ExpiryStatus = 'normal';
  if (diffDays < 0) {
    expiryStatus = 'overdue';
  } else if (diffDays <= EXPIRY_WARNING_DAYS) {
    expiryStatus = 'approaching';
  }

  return { ...unit, expiryStatus, daysRemaining: diffDays };
}

function processUnits(units: ColdStorageUnit[]): ColdStorageUnit[] {
  const now = new Date();
  return units.map(unit => calculateExpiry(unit, now));
}

function getInitialUnits(): ColdStorageUnit[] {
  let units: ColdStorageUnit[];
  if (hasStorageData(STORAGE_KEY)) {
    units = loadFromStorage<ColdStorageUnit[]>(STORAGE_KEY, mockColdStorage);
  } else {
    units = mockColdStorage;
  }
  return processUnits(units);
}

function getInitialRecords(): StorageRecord[] {
  if (hasStorageData(RECORDS_KEY)) {
    return loadFromStorage<StorageRecord[]>(RECORDS_KEY, []);
  }
  return [];
}

interface ColdStorageStore {
  units: ColdStorageUnit[];
  storageRecords: StorageRecord[];
  _hasHydrated: boolean;
  
  updateUnitStatus: (id: string, status: StorageUnitStatus, data?: Partial<ColdStorageUnit>) => void;
  getUnitById: (id: string) => ColdStorageUnit | undefined;
  getUnitsByStatus: (status: StorageUnitStatus) => ColdStorageUnit[];
  getUnitsByCabinet: (cabinetNo: string) => ColdStorageUnit[];
  getAvailableUnits: () => ColdStorageUnit[];
  getOccupiedUnits: () => ColdStorageUnit[];
  storeBody: (unitId: string, taskId?: string, deceasedName?: string, expectedPickupTime?: string) => void;
  releaseUnit: (unitId: string) => void;
  reserveUnit: (unitId: string, taskId: string, deceasedName: string, expectedPickupTime: string) => void;
  
  getExpiringUnits: () => ColdStorageUnit[];
  getOverdueUnits: () => ColdStorageUnit[];
  getApproachingUnits: () => ColdStorageUnit[];
  refreshExpiryStatus: () => void;
  
  _persist: (units: ColdStorageUnit[]) => void;
  _persistRecords: (records: StorageRecord[]) => void;
}

export const useColdStorageStore = create<ColdStorageStore>((set, get) => ({
  units: getInitialUnits(),
  storageRecords: getInitialRecords(),
  _hasHydrated: true,

  _persist: (units) => {
    saveToStorage(STORAGE_KEY, units);
  },

  _persistRecords: (records) => {
    saveToStorage(RECORDS_KEY, records);
  },

  refreshExpiryStatus: () => {
    const units = get().units;
    const processedUnits = processUnits(units);
    set({ units: processedUnits });
  },

  updateUnitStatus: (id, status, data) => {
    const newUnits = processUnits(
      get().units.map((unit) =>
        unit.id === id ? { ...unit, status, ...data } : unit
      )
    );
    set({ units: newUnits });
    get()._persist(newUnits);
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

  getExpiringUnits: () => {
    return get().units.filter(
      (unit) => unit.expiryStatus === 'approaching' || unit.expiryStatus === 'overdue'
    );
  },

  getOverdueUnits: () => {
    return get().units.filter((unit) => unit.expiryStatus === 'overdue');
  },

  getApproachingUnits: () => {
    return get().units.filter((unit) => unit.expiryStatus === 'approaching');
  },

  storeBody: (unitId, taskId, deceasedName, expectedPickupTime) => {
    const unit = get().units.find((u) => u.id === unitId);
    if (!unit) return;

    const newUnits = processUnits(
      get().units.map((u) =>
        u.id === unitId
          ? {
              ...u,
              status: 'occupied' as StorageUnitStatus,
              taskId: taskId || u.taskId,
              deceasedName: deceasedName || u.deceasedName,
              storageTime: new Date().toISOString(),
              expectedPickupTime: expectedPickupTime || u.expectedPickupTime,
            }
          : u
      )
    );

    const record: StorageRecord = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      unitId,
      cabinetNo: unit.cabinetNo,
      deceasedName: deceasedName || unit.deceasedName || '未知',
      taskId: taskId || unit.taskId,
      type: 'in',
      operateTime: new Date().toISOString(),
    };

    const newRecords = [record, ...get().storageRecords];

    set({ units: newUnits, storageRecords: newRecords });
    get()._persist(newUnits);
    get()._persistRecords(newRecords);
  },

  releaseUnit: (unitId) => {
    const unit = get().units.find((u) => u.id === unitId);
    if (!unit) return;

    const newUnits = processUnits(
      get().units.map((u) =>
        u.id === unitId
          ? {
              ...u,
              status: 'empty' as StorageUnitStatus,
              taskId: undefined,
              deceasedName: undefined,
              storageTime: undefined,
              expectedPickupTime: undefined,
              expiryStatus: undefined,
              daysRemaining: undefined,
            }
          : u
      )
    );

    const record: StorageRecord = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      unitId,
      cabinetNo: unit.cabinetNo,
      deceasedName: unit.deceasedName || '未知',
      taskId: unit.taskId,
      type: 'out',
      operateTime: new Date().toISOString(),
    };

    const newRecords = [record, ...get().storageRecords];

    set({ units: newUnits, storageRecords: newRecords });
    get()._persist(newUnits);
    get()._persistRecords(newRecords);
  },

  reserveUnit: (unitId, taskId, deceasedName, expectedPickupTime) => {
    const newUnits = processUnits(
      get().units.map((unit) =>
        unit.id === unitId
          ? {
              ...unit,
              status: 'reserved' as StorageUnitStatus,
              taskId,
              deceasedName,
              expectedPickupTime,
            }
          : unit
      )
    );
    set({ units: newUnits });
    get()._persist(newUnits);
  },
}));
