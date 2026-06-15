import { create } from 'zustand';
import { mockTasks } from '@/data/tasks';
import type { TransportTask, TaskStatus } from '@/types';
import { generateTaskNo } from '@/utils';

interface TaskStore {
  tasks: TransportTask[];
  addTask: (task: Omit<TransportTask, 'id' | 'taskNo' | 'createdAt' | 'status'>) => void;
  updateTask: (id: string, updates: Partial<TransportTask>) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  getTaskById: (id: string) => TransportTask | undefined;
  deleteTask: (id: string) => void;
  assignVehicleAndStaff: (taskId: string, vehicleId: string, driverId: string, assistantId: string) => void;
  getTasksByStatus: (status: TaskStatus) => TransportTask[];
  getTodayTasks: () => TransportTask[];
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: mockTasks,
  
  addTask: (taskData) => {
    const newTask: TransportTask = {
      ...taskData,
      id: Date.now().toString(),
      taskNo: generateTaskNo(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ tasks: [newTask, ...state.tasks] }));
  },
  
  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    }));
  },
  
  updateTaskStatus: (id, status) => {
    const updates: Partial<TransportTask> = { status };
    if (status === 'in_transit' && !get().tasks.find(t => t.id === id)?.actualStartTime) {
      updates.actualStartTime = new Date().toISOString();
    }
    if (status === 'completed') {
      updates.actualEndTime = new Date().toISOString();
    }
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    }));
  },
  
  getTaskById: (id) => {
    return get().tasks.find((task) => task.id === id);
  },
  
  deleteTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    }));
  },
  
  assignVehicleAndStaff: (taskId, vehicleId, driverId, assistantId) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? { ...task, vehicleId, driverId, assistantId, status: 'dispatched' as TaskStatus }
          : task
      ),
    }));
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
}));
