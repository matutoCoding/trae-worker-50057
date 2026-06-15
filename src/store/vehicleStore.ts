import { create } from 'zustand';
import { mockVehicles } from '@/data/vehicles';
import type { Vehicle, VehicleStatus } from '@/types';

interface VehicleStore {
  vehicles: Vehicle[];
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  updateVehicleStatus: (id: string, status: VehicleStatus) => void;
  getVehicleById: (id: string) => Vehicle | undefined;
  getAvailableVehicles: () => Vehicle[];
  getVehiclesByStatus: (status: VehicleStatus) => Vehicle[];
}

export const useVehicleStore = create<VehicleStore>((set, get) => ({
  vehicles: mockVehicles,
  
  addVehicle: (vehicleData) => {
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: Date.now().toString(),
    };
    set((state) => ({ vehicles: [...state.vehicles, newVehicle] }));
  },
  
  updateVehicle: (id, updates) => {
    set((state) => ({
      vehicles: state.vehicles.map((vehicle) =>
        vehicle.id === id ? { ...vehicle, ...updates } : vehicle
      ),
    }));
  },
  
  updateVehicleStatus: (id, status) => {
    set((state) => ({
      vehicles: state.vehicles.map((vehicle) =>
        vehicle.id === id ? { ...vehicle, status } : vehicle
      ),
    }));
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
}));
