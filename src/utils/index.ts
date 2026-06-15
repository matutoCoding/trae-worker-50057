import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { TaskStatus, VehicleStatus, StaffStatus, ShiftType, StorageUnitStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function formatTime(date: string | Date): string {
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function generateTaskNo(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `JY${year}${month}${day}${random}`;
}

export const taskStatusMap: Record<TaskStatus, { label: string; color: string }> = {
  pending: { label: '待派发', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  dispatched: { label: '已派发', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  in_transit: { label: '接运中', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  arrived: { label: '已到达', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  transferring: { label: '交接中', color: 'bg-pink-100 text-pink-800 border-pink-200' },
  returning: { label: '返程中', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-800 border-green-200' },
  cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-800 border-gray-200' },
};

export const vehicleStatusMap: Record<VehicleStatus, { label: string; color: string }> = {
  idle: { label: '空闲', color: 'bg-green-100 text-green-800' },
  on_duty: { label: '执勤中', color: 'bg-blue-100 text-blue-800' },
  maintenance: { label: '维修中', color: 'bg-orange-100 text-orange-800' },
  offline: { label: '离线', color: 'bg-gray-100 text-gray-800' },
};

export const staffStatusMap: Record<StaffStatus, { label: string; color: string }> = {
  on_duty: { label: '在岗', color: 'bg-green-100 text-green-800' },
  off_duty: { label: '离岗', color: 'bg-gray-100 text-gray-800' },
  leave: { label: '请假', color: 'bg-yellow-100 text-yellow-800' },
  night_shift: { label: '夜班', color: 'bg-indigo-100 text-indigo-800' },
};

export const shiftTypeMap: Record<ShiftType, { label: string; color: string }> = {
  morning: { label: '早班', color: 'bg-sky-100 text-sky-800' },
  afternoon: { label: '中班', color: 'bg-amber-100 text-amber-800' },
  night: { label: '夜班', color: 'bg-indigo-100 text-indigo-800' },
  day_off: { label: '休息', color: 'bg-gray-100 text-gray-800' },
};

export const storageUnitStatusMap: Record<StorageUnitStatus, { label: string; color: string; bgColor: string }> = {
  empty: { label: '空置', color: 'text-green-600', bgColor: 'bg-green-50 border-green-200' },
  occupied: { label: '已占用', color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200' },
  reserved: { label: '已预约', color: 'text-yellow-600', bgColor: 'bg-yellow-50 border-yellow-200' },
  maintenance: { label: '维护中', color: 'text-gray-600', bgColor: 'bg-gray-50 border-gray-200' },
};

export const roleMap = {
  driver: '司机',
  assistant: '接运员',
  dispatcher: '调度员',
  manager: '管理员',
};
