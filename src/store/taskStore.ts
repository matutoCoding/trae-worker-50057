import { create } from 'zustand';
import { mockTasks } from '@/data/tasks';
import { loadFromStorage, saveToStorage, hasStorageData } from '@/utils/storage';
import type { TransportTask, TaskStatus, AnomalyEvent, AnomalyType } from '@/types';
import { generateTaskNo } from '@/utils';

const STORAGE_KEY = 'tasks';

function ensureAnomalyEvents(tasks: TransportTask[]): TransportTask[] {
  return tasks.map(task => ({
    ...task,
    anomalyEvents: task.anomalyEvents || [],
  }));
}

function getInitialTasks(): TransportTask[] {
  let tasks: TransportTask[];
  if (hasStorageData(STORAGE_KEY)) {
    tasks = loadFromStorage<TransportTask[]>(STORAGE_KEY, mockTasks);
  } else {
    tasks = mockTasks;
  }
  return ensureAnomalyEvents(tasks);
}

const ANOMALY_TYPE_NAMES: Record<AnomalyType, string> = {
  wait: '途中等待',
  reassign: '改派车辆',
  cancel: '家属取消',
  address_change: '变更地址',
  delay: '延误',
  other: '其他异常',
};

interface TaskStore {
  tasks: TransportTask[];
  _hasHydrated: boolean;
  
  addTask: (task: Omit<TransportTask, 'id' | 'taskNo' | 'createdAt' | 'status' | 'anomalyEvents'>) => void;
  updateTask: (id: string, updates: Partial<TransportTask>) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  getTaskById: (id: string) => TransportTask | undefined;
  deleteTask: (id: string) => void;
  assignVehicleAndStaff: (taskId: string, vehicleId: string, driverId: string, assistantId: string, handlerId?: string) => void;
  getTasksByStatus: (status: TaskStatus) => TransportTask[];
  getTodayTasks: () => TransportTask[];
  getCompletedTasks: () => TransportTask[];
  getTasksByDateRange: (startDate: Date, endDate: Date) => TransportTask[];
  
  addAnomalyEvent: (taskId: string, event: Omit<AnomalyEvent, 'id' | 'taskId' | 'occurTime'> & { occurTime?: string }) => void;
  updateAnomalyEvent: (taskId: string, eventId: string, updates: Partial<AnomalyEvent>) => void;
  deleteAnomalyEvent: (taskId: string, eventId: string) => void;
  getAnomalyEventsByTaskId: (taskId: string) => AnomalyEvent[];
  getAnomalyCountByDateRange: (startDate: Date, endDate: Date) => number;
  
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
      anomalyEvents: [],
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
    const now = new Date().toISOString();
    
    if (task) {
      if (status === 'dispatched' && !task.actualStartTime) {
        updates.actualStartTime = now;
      }
      if (status === 'in_transit' && !task.actualStartTime) {
        updates.actualStartTime = now;
      }
      if (status === 'arrived' && !task.arrivalTime) {
        updates.arrivalTime = now;
      }
      if (status === 'transferring' && !task.transferTime) {
        updates.transferTime = now;
      }
      if (status === 'returning' && !task.returnTime) {
        updates.returnTime = now;
      }
      if (status === 'completed') {
        updates.actualEndTime = now;
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

  assignVehicleAndStaff: (taskId, vehicleId, driverId, assistantId, handlerId) => {
    const newTasks = get().tasks.map((task) =>
      task.id === taskId
        ? { 
            ...task, 
            vehicleId, 
            driverId, 
            assistantId, 
            handlerId,
            status: 'dispatched' as TaskStatus,
            actualStartTime: task.actualStartTime || new Date().toISOString(),
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

  addAnomalyEvent: (taskId, eventData) => {
    const newEvent: AnomalyEvent = {
      ...eventData,
      id: Date.now().toString(),
      taskId,
      typeName: ANOMALY_TYPE_NAMES[eventData.type],
      occurTime: eventData.occurTime || new Date().toISOString(),
    };

    const newTasks = get().tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            anomalyEvents: [...(task.anomalyEvents || []), newEvent],
          }
        : task
    );
    set({ tasks: newTasks });
    get()._persist(newTasks);
  },

  updateAnomalyEvent: (taskId, eventId, updates) => {
    const newTasks = get().tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            anomalyEvents: task.anomalyEvents.map((event) =>
              event.id === eventId ? { ...event, ...updates } : event
            ),
          }
        : task
    );
    set({ tasks: newTasks });
    get()._persist(newTasks);
  },

  deleteAnomalyEvent: (taskId, eventId) => {
    const newTasks = get().tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            anomalyEvents: task.anomalyEvents.filter((event) => event.id !== eventId),
          }
        : task
    );
    set({ tasks: newTasks });
    get()._persist(newTasks);
  },

  getAnomalyEventsByTaskId: (taskId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    return task?.anomalyEvents || [];
  },

  getAnomalyCountByDateRange: (startDate, endDate) => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    let count = 0;
    get().tasks.forEach((task) => {
      (task.anomalyEvents || []).forEach((event) => {
        const eventTime = new Date(event.occurTime);
        if (eventTime >= start && eventTime <= end) {
          count++;
        }
      });
    });
    return count;
  },
}));
