import { OJTSetup, DailyLog, CalculatedStats } from './types';

export const calculateHoursWorked = (
  timeIn: string,
  timeOut: string,
  lunchStart?: string,
  lunchEnd?: string
): number => {
  if (!timeIn || !timeOut) return 0;

  const [inHours, inMinutes] = timeIn.split(':').map(Number);
  const [outHours, outMinutes] = timeOut.split(':').map(Number);

  const inTotalMinutes = inHours * 60 + inMinutes;
  const outTotalMinutes = outHours * 60 + outMinutes;

  const diffMinutes = outTotalMinutes - inTotalMinutes;
  if (diffMinutes <= 0) return 0;

  if (!lunchStart || !lunchEnd) {
    return diffMinutes / 60;
  }

  const [lunchStartHours, lunchStartMins] = lunchStart.split(':').map(Number);
  const [lunchEndHours, lunchEndMins] = lunchEnd.split(':').map(Number);
  const lunchStartMinutes = lunchStartHours * 60 + lunchStartMins;
  const lunchEndMinutes = lunchEndHours * 60 + lunchEndMins;

  if (lunchEndMinutes <= lunchStartMinutes) {
    return diffMinutes / 60;
  }

  const lunchOverlapMinutes = Math.max(
    0,
    Math.min(outTotalMinutes, lunchEndMinutes) - Math.max(inTotalMinutes, lunchStartMinutes)
  );

  return Math.max(0, (diffMinutes - lunchOverlapMinutes) / 60);
};

export const calculateStats = (
  setup: OJTSetup,
  logs: DailyLog[]
): CalculatedStats => {
  // Calculate total hours from logs
  const loggedHours = logs.reduce((sum, log) => {
    return sum + (log.isPresent ? log.hoursWorked : 0);
  }, 0);

  const totalHoursCompleted = setup.previousHours + loggedHours;
  const remainingHours = Math.max(0, setup.totalRequiredHours - totalHoursCompleted);
  const percentageCompleted = (totalHoursCompleted / setup.totalRequiredHours) * 100;

  // Calculate average daily hours (only present days)
  const presentLogs = logs.filter(log => log.isPresent);
  const presentDaysCount = presentLogs.length;
  const averageDailyHours = presentDaysCount > 0 
    ? loggedHours / presentDaysCount 
    : 0;

  // Calculate days needed to finish
  const daysNeeded = averageDailyHours > 0 
    ? Math.ceil(remainingHours / averageDailyHours) 
    : 0;

  // Calculate estimated end date
  const estimatedEndDate = calculateEndDate(
    new Date(),
    daysNeeded,
    setup.workingDays
  );

  return {
    totalHoursCompleted,
    remainingHours,
    percentageCompleted: Math.min(100, percentageCompleted),
    averageDailyHours,
    daysNeeded,
    estimatedEndDate,
    presentDaysCount,
  };
};

export const calculateEndDate = (
  startDate: Date,
  daysNeeded: number,
  workingDays: number[]
): string => {
  if (daysNeeded === 0) return 'Completed!';
  
  let currentDate = new Date(startDate);
  let workDaysAdded = 0;

  while (workDaysAdded < daysNeeded) {
    currentDate.setDate(currentDate.getDate() + 1);
    const dayOfWeek = currentDate.getDay();
    
    if (workingDays.includes(dayOfWeek)) {
      workDaysAdded++;
    }
  }

  return currentDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

export const isWorkingDay = (date: Date, workingDays: number[]): boolean => {
  return workingDays.includes(date.getDay());
};

export const saveToLocalStorage = (key: string, data: any): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const loadFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};
