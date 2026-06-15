export type TaskStatus = 
  | 'pending' 
  | 'dispatched' 
  | 'in_transit' 
  | 'arrived' 
  | 'transferring' 
  | 'returning' 
  | 'completed' 
  | 'cancelled';

export type VehicleStatus = 'idle' | 'on_duty' | 'maintenance' | 'offline';

export type StaffRole = 'driver' | 'assistant' | 'dispatcher' | 'manager';

export type StaffStatus = 'on_duty' | 'off_duty' | 'leave' | 'night_shift';

export type ShiftType = 'morning' | 'afternoon' | 'night' | 'day_off';

export type StorageUnitStatus = 'empty' | 'occupied' | 'reserved' | 'maintenance';

export type AnomalyType = 
  | 'wait' 
  | 'reassign' 
  | 'cancel' 
  | 'address_change' 
  | 'delay' 
  | 'other';

export type AnomalyStatus = 'pending' | 'processing' | 'resolved';

export type ExpiryStatus = 'normal' | 'approaching' | 'overdue';

export interface DeceasedInfo {
  name: string;
  gender: 'male' | 'female';
  age: number;
  idCard: string;
  causeOfDeath: string;
  hospital?: string;
}

export interface FamilyInfo {
  name: string;
  relation: string;
  phone: string;
}

export interface AnomalyEvent {
  id: string;
  taskId: string;
  type: AnomalyType;
  typeName: string;
  description: string;
  occurTime: string;
  operatorName: string;
  handlingResult?: string;
  status: AnomalyStatus;
  responsiblePerson?: string;
  resolvedTime?: string;
}

export interface TransportTask {
  id: string;
  taskNo: string;
  status: TaskStatus;
  deceased: DeceasedInfo;
  family: FamilyInfo;
  pickupAddress: string;
  destination: string;
  scheduledTime: string;
  actualStartTime?: string;
  arrivalTime?: string;
  transferTime?: string;
  returnTime?: string;
  actualEndTime?: string;
  mileage?: number;
  vehicleId?: string;
  driverId?: string;
  assistantId?: string;
  handlerId?: string;
  remarks?: string;
  anomalyEvents: AnomalyEvent[];
  createdAt: string;
}

export interface Vehicle {
  id: string;
  plateNo: string;
  model: string;
  status: VehicleStatus;
  capacity: number;
  currentMileage: number;
  driverName?: string;
  currentTaskId?: string;
  lastMaintenanceDate: string;
}

export interface Staff {
  id: string;
  name: string;
  role: StaffRole;
  phone: string;
  status: StaffStatus;
}

export interface ScheduleRecord {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  shiftType: ShiftType;
  isNightShift: boolean;
}

export interface TransferRecord {
  id: string;
  taskId: string;
  taskNo: string;
  deceasedName: string;
  transferTime: string;
  transferPlace: string;
  handlerName: string;
  familyName: string;
  familyRelation: string;
  familyConfirmed: boolean;
  hasSignature: boolean;
  notes: string;
}

export interface ColdStorageUnit {
  id: string;
  cabinetNo: string;
  layer: number;
  unitNo: number;
  status: StorageUnitStatus;
  taskId?: string;
  deceasedName?: string;
  storageTime?: string;
  expectedPickupTime?: string;
  expiryStatus?: ExpiryStatus;
  daysRemaining?: number;
}

export interface StorageRecord {
  id: string;
  unitId: string;
  cabinetNo: string;
  deceasedName: string;
  taskId?: string;
  type: 'in' | 'out';
  operateTime: string;
  operator?: string;
}

export interface StatisticsData {
  date: string;
  taskCount: number;
  mileage: number;
}

export interface TaskVehicleReconciliation {
  taskId: string;
  taskNo: string;
  deceasedName: string;
  taskVehicleId?: string;
  taskVehiclePlate?: string;
  vehicleId?: string;
  vehiclePlate?: string;
  vehicleTaskId?: string;
  isMatch: boolean;
  issue: 'task_no_vehicle' | 'vehicle_no_task' | 'mismatch' | 'ok';
  issueDesc: string;
}

export interface VehicleUsageDetail {
  vehicleId: string;
  plateNo: string;
  totalTasks: number;
  totalMileage: number;
  totalDurationMinutes: number;
  utilizationRate: number;
}

export interface StaffWorkloadDetail {
  staffId: string;
  name: string;
  role: StaffRole;
  roleName: string;
  taskCount: number;
  totalMileage: number;
  totalDurationMinutes: number;
}

export interface StageTimeoutInfo {
  stage: string;
  stageLabel: string;
  startTime: string;
  limitMinutes: number;
  elapsedMinutes: number;
  isTimeout: boolean;
}

export interface TaskTimeoutInfo {
  taskId: string;
  taskNo: string;
  deceasedName: string;
  currentStage: string;
  currentStageLabel: string;
  timeoutStages: StageTimeoutInfo[];
  hasTimeout: boolean;
}
