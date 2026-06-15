import { create } from 'zustand';
import { mockTasks } from '@/data/tasks';
import { loadFromStorage, saveToStorage, hasStorageData } from '@/utils/storage';
import type { TransportTask, TaskStatus } from '@/types';
import { generateTaskNo } from '@/utils';

const STORAGE_KEY = 'tasks';

function getInitialTasks(): TransportTask[] {
  if (hasStorageData(STORAGE_KEY)) {
    return loadFromStorage<TransportTask[]>(STORAGE_KEY, mockTasks);
  }
  return mockTasks;
}

interface TaskStore {
  tasks: TransportTask[];
  _hasHydrated: boolean;
  
  addTask: (task: Omit<TransportTask, 'id' | 'taskNo' | 'createdAt' | 'status'>) => void;
  updateTask: (id: string, updates: Partial<TransportTask>) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  getTaskById: (id: string) => TransportTask | undefined;
  deleteTask: (id: string) => void;
  assignVehicleAndStaff: (taskId: string, vehicleId: string, driverId: string, assistantId: string) => void;
  getTasksByStatus: (status: TaskStatus) => TransportTask[];
  getTodayTasks: () => TransportTask[];
  getCompletedTasks: () => TransportTask[];
  getTasksByDateRange: (startDate: Date, endDate: Date) => TransportTask[];
  _persist: (tasks: TransportTask[]) => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: getInitialTasks(),
  _hasHydrated: true,

  _persist: (tasks) => {
    saveToStorage(STORAGE_KEY, tasks);
  },

  addTask: (taskData) => {
    const newTask: TransportTask = {
      ...taskData,
      id: Date.now().toString(),
      taskNo: generateTaskNo(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const newTasks = [newTask, ...get().tasks];
    set({ tasks: newTasks });
    get()._persist(newTasks);
  },

  updateTask: (id, updates) => {
    const newTasks = get().tasks.map((task) =>
      task.id === id ? { ...task, ...updates } : task
    );
    set({ tasks: newTasks });
    get()._persist(newTasks);
  },

  updateTaskStatus: (id, status) => {
    const updates: Partial<TransportTask> = { status };
    const task = get().tasks.find((t) => t.id === id);
    
    if (task) {
      if (status === 'in_transit' && !task.actualStartTime) {
        updates.actualStartTime = new Date().toISOString();
      }
      if (status === 'completed') {
        updates.actualEndTime = new Date().toISOString();
        if (!updates.mileage && !task.mileage) {
          const start = task.actualStartTime ? new Date(task.actualStartTime) : new Date();
          const end = new Date();
          const hours = Math.max(0.5, (end.getTime() - start.getTime()) / (1000 * 60 * 60));
          updates.mileage = Math.round(hours * 30 * 10) / 10;
        }
      }
    }

    const newTasks = get().tasks.map((task) =>
      task.id === id ? { ...task, ...updates } : task
    );
    set({ tasks: newTasks });
    get()._persist(newTasks);
  },

  getTaskById: (id) => {
    return get().tasks.find((task) => task.id === id);
  },

  deleteTask: (id) => {
    const newTasks = get().tasks.filter((task) => task.id !== id);
    set({ tasks: newTasks });
    get()._persist(newTasks);
  },

  assignVehicleAndStaff: (taskId, vehicleId, driverId, assistantId) => {
    const newTasks = get().tasks.map((task) =>
      task.id === taskId
        ? { 
            ...task, 
            vehicleId, 
            driverId, 
            assistantId, 
            status: 'dispatched' as TaskStatus,
          }
        : task
    );
    set({ tasks: newTasks });
    get()._persist(newTasks);
  },

  getTasksByStatus: (status) => {
    return get().tasks.filter((task) => task.status === status);
  },

  getTodayTasks: () => {
    const today = new Date().toDateString();
    return get().tasks.filter(
      (task) => new Date(task.createdAt).toDateString() === today
    );
  },

  getCompletedTasks: () => {
    return get().tasks.filter((task) => task.status === 'completed');
  },

  getTasksByDateRange: (startDate, endDate) => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    return get().tasks.filter((task) => {
      const taskDate = new Date(task.createdAt);
      return taskDate >= start && taskDate <= end;
    });
  },
}));
