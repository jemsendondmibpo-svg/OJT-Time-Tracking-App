export interface OJTSetup {
  internName: string;
  course: string;
  schoolName: string;
  companyName: string;
  assignedDepartment: string;
  immediateSupervisor: string;
  totalRequiredHours: number;
  previousHours: number;
  workingDays: number[]; // 0 = Sunday, 1 = Monday, etc.
  startDate: string;
}

export interface DailyLog {
  id: string;
  date: string;
  timeIn: string;
  timeOut: string;
  lunchStart?: string;
  lunchEnd?: string;
  isPresent: boolean;
  accomplishment: string;
  hoursWorked: number;
  photoUrl?: string;
}

export interface CalculatedStats {
  totalHoursCompleted: number;
  remainingHours: number;
  percentageCompleted: number;
  averageDailyHours: number;
  daysNeeded: number;
  estimatedEndDate: string;
  presentDaysCount: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string
  startTime: string;
  endTime: string;
  type: 'important' | 'meeting' | 'deadline' | 'reminder';
  completed: boolean;
}
