import { create } from 'zustand';
import { mockVehicles } from '@/data/vehicles';
import { loadFromStorage, saveToStorage, hasStorageData } from '@/utils/storage';
import type { Vehicle, VehicleStatus } from '@/types';

const STORAGE_KEY = 'vehicles';

function getInitialVehicles(): Vehicle[] {
  if (hasStorageData(STORAGE_KEY)) {
    return loadFromStorage<Vehicle[]>(STORAGE_KEY, mockVehicles);
  }
  return mockVehicles;
}

interface VehicleStore {
  vehicles: Vehicle[];
  _hasHydrated: boolean;
  
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  updateVehicleStatus: (id: string, status: VehicleStatus) => void;
  getVehicleById: (id: string) => Vehicle | undefined;
  getAvailableVehicles: () => Vehicle[];
  getVehiclesByStatus: (status: VehicleStatus) => Vehicle[];
  assignToTask: (vehicleId: string, taskId: string, driverName: string) => void;
  releaseFromTask: (vehicleId: string, mileage?: number) => void;
  _persist: (vehicles: Vehicle[]) => void;
}

export const useVehicleStore = create<VehicleStore>((set, get) => ({
  vehicles: getInitialVehicles(),
  _hasHydrated: true,

  _persist: (vehicles) => {
    saveToStorage(STORAGE_KEY, vehicles);
  },

  addVehicle: (vehicleData) => {
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: Date.now().toString(),
    };
    const newVehicles = [...get().vehicles, newVehicle];
    set({ vehicles: newVehicles });
    get()._persist(newVehicles);
  },

  updateVehicle: (id, updates) => {
    const newVehicles = get().vehicles.map((vehicle) =>
      vehicle.id === id ? { ...vehicle, ...updates } : vehicle
    );
    set({ vehicles: newVehicles });
    get()._persist(newVehicles);
  },

  updateVehicleStatus: (id, status) => {
    const newVehicles = get().vehicles.map((vehicle) =>
      vehicle.id === id ? { ...vehicle, status } : vehicle
    );
    set({ vehicles: newVehicles });
    get()._persist(newVehicles);
  },

  getVehicleById: (id) => {
    return get().vehicles.find((vehicle) => vehicle.id === id);
  },

  getAvailableVehicles: () => {
    return get().vehicles.filter((vehicle) => vehicle.status === 'idle');
  },

  getVehiclesByStatus: (status) => {
    return get().vehicles.filter((vehicle) => vehicle.status === status);
  },

  assignToTask: (vehicleId, taskId, driverName) => {
    const newVehicles = get().vehicles.map((vehicle) =>
      vehicle.id === vehicleId
        ? {
            ...vehicle,
            status: 'on_duty' as VehicleStatus,
            currentTaskId: taskId,
            driverName,
          }
        : vehicle
    );
    set({ vehicles: newVehicles });
    get()._persist(newVehicles);
  },

  releaseFromTask: (vehicleId, mileage) => {
    const newVehicles = get().vehicles.map((vehicle) => {
      if (vehicle.id === vehicleId) {
        const updatedMileage = mileage
          ? vehicle.currentMileage + mileage
          : vehicle.currentMileage;
        return {
          ...vehicle,
          status: 'idle' as VehicleStatus,
          currentTaskId: undefined,
          currentMileage: updatedMileage,
        };
      }
      return vehicle;
    });
    set({ vehicles: newVehicles });
    get()._persist(newVehicles);
  },
}));
