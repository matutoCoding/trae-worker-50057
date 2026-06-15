import { create } from 'zustand';
import { loadFromStorage, saveToStorage, hasStorageData } from '@/utils/storage';
import type { TransferRecord } from '@/types';

const STORAGE_KEY = 'transferRecords';

function getInitialRecords(): TransferRecord[] {
  if (hasStorageData(STORAGE_KEY)) {
    return loadFromStorage<TransferRecord[]>(STORAGE_KEY, []);
  }
  return [];
}

interface TransferStore {
  transferRecords: TransferRecord[];
  _hasHydrated: boolean;
  
  addTransferRecord: (record: Omit<TransferRecord, 'id'>) => void;
  updateTransferRecord: (id: string, updates: Partial<TransferRecord>) => void;
  deleteTransferRecord: (id: string) => void;
  getRecordById: (id: string) => TransferRecord | undefined;
  getRecordsByTaskId: (taskId: string) => TransferRecord[];
  getRecordsByDateRange: (startDate: Date, endDate: Date) => TransferRecord[];
  getLatestRecordByTaskId: (taskId: string) => TransferRecord | undefined;
  _persist: (records: TransferRecord[]) => void;
}

export const useTransferStore = create<TransferStore>((set, get) => ({
  transferRecords: getInitialRecords(),
  _hasHydrated: true,

  _persist: (records) => {
    saveToStorage(STORAGE_KEY, records);
  },

  addTransferRecord: (recordData) => {
    const newRecord: TransferRecord = {
      ...recordData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    const newRecords = [newRecord, ...get().transferRecords];
    set({ transferRecords: newRecords });
    get()._persist(newRecords);
  },

  updateTransferRecord: (id, updates) => {
    const newRecords = get().transferRecords.map((record) =>
      record.id === id ? { ...record, ...updates } : record
    );
    set({ transferRecords: newRecords });
    get()._persist(newRecords);
  },

  deleteTransferRecord: (id) => {
    const newRecords = get().transferRecords.filter((record) => record.id !== id);
    set({ transferRecords: newRecords });
    get()._persist(newRecords);
  },

  getRecordById: (id) => {
    return get().transferRecords.find((record) => record.id === id);
  },

  getRecordsByTaskId: (taskId) => {
    return get().transferRecords.filter((record) => record.taskId === taskId);
  },

  getRecordsByDateRange: (startDate, endDate) => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    return get().transferRecords.filter((record) => {
      const recordDate = new Date(record.transferTime);
      return recordDate >= start && recordDate <= end;
    });
  },

  getLatestRecordByTaskId: (taskId) => {
    const taskRecords = get().transferRecords
      .filter((r) => r.taskId === taskId)
      .sort((a, b) => new Date(b.transferTime).getTime() - new Date(a.transferTime).getTime());
    return taskRecords[0] || undefined;
  },
}));
