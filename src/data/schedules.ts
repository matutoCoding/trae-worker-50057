import type { ScheduleRecord } from "@/types";

function getDateString(offset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().split('T')[0];
}

export const mockSchedules: ScheduleRecord[] = [
  { id: '1', staffId: '1', staffName: '陈建国', date: getDateString(0), shiftType: 'morning', isNightShift: false },
  { id: '2', staffId: '2', staffName: '刘德明', date: getDateString(0), shiftType: 'morning', isNightShift: false },
  { id: '3', staffId: '3', staffName: '张伟强', date: getDateString(0), shiftType: 'morning', isNightShift: false },
  { id: '4', staffId: '4', staffName: '李明辉', date: getDateString(0), shiftType: 'afternoon', isNightShift: false },
  { id: '5', staffId: '5', staffName: '王志强', date: getDateString(0), shiftType: 'afternoon', isNightShift: false },
  { id: '6', staffId: '6', staffName: '赵文博', date: getDateString(0), shiftType: 'afternoon', isNightShift: false },
  { id: '7', staffId: '14', staffName: '徐晓东', date: getDateString(0), shiftType: 'night', isNightShift: true },
  { id: '8', staffId: '15', staffName: '何志远', date: getDateString(0), shiftType: 'night', isNightShift: true },
  { id: '9', staffId: '11', staffName: '黄丽华', date: getDateString(0), shiftType: 'morning', isNightShift: false },
  { id: '10', staffId: '12', staffName: '林美玲', date: getDateString(0), shiftType: 'night', isNightShift: true },
  { id: '11', staffId: '7', staffName: '孙建华', date: getDateString(0), shiftType: 'day_off', isNightShift: false },
  { id: '12', staffId: '8', staffName: '周海涛', date: getDateString(0), shiftType: 'day_off', isNightShift: false },
  
  { id: '13', staffId: '1', staffName: '陈建国', date: getDateString(1), shiftType: 'afternoon', isNightShift: false },
  { id: '14', staffId: '2', staffName: '刘德明', date: getDateString(1), shiftType: 'afternoon', isNightShift: false },
  { id: '15', staffId: '3', staffName: '张伟强', date: getDateString(1), shiftType: 'afternoon', isNightShift: false },
  { id: '16', staffId: '4', staffName: '李明辉', date: getDateString(1), shiftType: 'morning', isNightShift: false },
  { id: '17', staffId: '5', staffName: '王志强', date: getDateString(1), shiftType: 'morning', isNightShift: false },
  { id: '18', staffId: '6', staffName: '赵文博', date: getDateString(1), shiftType: 'morning', isNightShift: false },
  { id: '19', staffId: '9', staffName: '吴大勇', date: getDateString(1), shiftType: 'night', isNightShift: true },
  { id: '20', staffId: '10', staffName: '郑晓峰', date: getDateString(1), shiftType: 'night', isNightShift: true },
  
  { id: '21', staffId: '7', staffName: '孙建华', date: getDateString(2), shiftType: 'morning', isNightShift: false },
  { id: '22', staffId: '8', staffName: '周海涛', date: getDateString(2), shiftType: 'morning', isNightShift: false },
  { id: '23', staffId: '9', staffName: '吴大勇', date: getDateString(2), shiftType: 'morning', isNightShift: false },
  { id: '24', staffId: '10', staffName: '郑晓峰', date: getDateString(2), shiftType: 'afternoon', isNightShift: false },
  { id: '25', staffId: '1', staffName: '陈建国', date: getDateString(2), shiftType: 'day_off', isNightShift: false },
  { id: '26', staffId: '2', staffName: '刘德明', date: getDateString(2), shiftType: 'day_off', isNightShift: false },
];
