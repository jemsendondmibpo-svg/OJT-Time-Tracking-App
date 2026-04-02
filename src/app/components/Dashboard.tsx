import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { StatsCards } from './StatsCards';
import { TimeLogForm } from './TimeLogForm';
import { TimeLogHistory } from './TimeLogHistory';
import { Calendar } from './Calendar';
import { DailyLog, CalendarEvent, OJTSetup } from '../types';
import { calculateStats } from '../utils';
import { getCurrentUser, clearCurrentUser } from '../auth-utils';
import { supabase } from '../supabase-client';
import {
  ClipboardList,
  LogOut,
  Settings,
  CalendarDays,
  Clock,
  History,
  Home,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  GraduationCap,
  Building2,
  BriefcaseBusiness,
} from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Button } from './ui/button';
import { toast } from 'sonner';

type TabValue = 'home' | 'log' | 'history' | 'calendar';

const getEventErrorMessage = (error: any, fallback: string) => {
  const message = error?.message || fallback;

  if (
    message.includes('start_time') ||
    message.includes('end_time') ||
    message.includes('completed') ||
    message.includes('type')
  ) {
    return 'Calendar event fields are missing in Supabase. Run supabase/add_calendar_event_fields.sql first.';
  }

  return message;
};

export function Dashboard() {
  const navigate = useNavigate();
  const [currentUser] = useState(() => getCurrentUser());
  const [setup, setSetup] = useState<OJTSetup | null>(null);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [activeTab, setActiveTab] = useState<TabValue>('home');
  const [editingLog, setEditingLog] = useState<DailyLog | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { replace: true });
      return;
    }

    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      const { data: setupData, error: setupError } = await supabase
        .from('ojt_setup')
        .select('*')
        .eq('user_id', currentUser?.id)
        .maybeSingle();

      if (setupError) {
        console.error('Setup load error:', setupError);
        navigate('/setup', { replace: true });
        return;
      }

      if (!setupData) {
        navigate('/setup', { replace: true });
        return;
      }

      const mappedSetup: OJTSetup = {
        internName: setupData.intern_name ?? currentUser.fullName,
        course: setupData.course ?? '',
        schoolName: setupData.school_name ?? '',
        companyName: setupData.company_name ?? '',
        assignedDepartment: setupData.assigned_department ?? '',
        immediateSupervisor: setupData.immediate_supervisor ?? '',
        totalRequiredHours: setupData.total_required_hours,
        previousHours: setupData.previous_hours,
        workingDays: setupData.working_days,
        startDate: setupData.start_date,
      };
      setSetup(mappedSetup);

      const { data: logsData, error: logsError } = await supabase
        .from('time_logs')
        .select('*')
        .eq('user_id', currentUser?.id)
        .order('date', { ascending: false });

      if (!logsError && logsData) {
        const mappedLogs: DailyLog[] = logsData.map((log: any) => ({
          id: log.id,
          date: log.date,
          isPresent: log.is_present,
          timeIn: log.time_in,
          timeOut: log.time_out,
          lunchStart: log.lunch_start,
          lunchEnd: log.lunch_end,
          isOvertime: log.is_overtime ?? false,
          overtimeHours: Number(log.overtime_hours ?? 0),
          isHoliday: log.is_holiday ?? false,
          hoursWorked: log.hours_worked,
          accomplishment: log.accomplishment,
          photoUrl: log.photo_url,
        }));
        setLogs(mappedLogs);
      }

      const { data: eventsData, error: eventsError } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', currentUser?.id)
        .order('date', { ascending: true });

      if (!eventsError && eventsData) {
        const mappedEvents: CalendarEvent[] = eventsData.map((event: any) => ({
          id: event.id,
          title: event.title,
          date: event.date,
          description: event.description,
          startTime: event.start_time ?? '09:00',
          endTime: event.end_time ?? '10:00',
          type: event.type ?? 'important',
          completed: event.completed ?? false,
        }));
        setEvents(mappedEvents);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setIsLoading(false);
    }
  };

  const handleSaveLog = async (_log: DailyLog) => {
    setEditingLog(null);
    await loadData();
  };

  const handleEditLog = (log: DailyLog) => {
    setEditingLog(log);
    setActiveTab('log');
  };

  const handleCancelEditLog = () => {
    setEditingLog(null);
  };

  const handleDeleteLog = async (id: string) => {
    try {
      const { error } = await supabase
        .from('time_logs')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUser?.id);

      if (error) {
        toast.error('Failed to delete log');
        return;
      }

      const updatedLogs = logs.filter((log) => log.id !== id);
      setLogs(updatedLogs);
      toast.success('Time log deleted');
    } catch (error) {
      console.error('Delete log error:', error);
      toast.error('Failed to delete log');
    }
  };

  const handleAddEvent = async (event: CalendarEvent) => {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          user_id: currentUser?.id,
          title: event.title,
          date: event.date,
          description: event.description,
          start_time: event.startTime,
          end_time: event.endTime,
          type: event.type,
          completed: event.completed,
        })
        .select()
        .single();

      if (error || !data) {
        console.error('Add event error:', error);
        toast.error(getEventErrorMessage(error, 'Failed to add event'));
        return;
      }

      const mappedEvent: CalendarEvent = {
        id: data.id,
        title: data.title,
        date: data.date,
        description: data.description,
        startTime: data.start_time ?? event.startTime,
        endTime: data.end_time ?? event.endTime,
        type: data.type ?? event.type,
        completed: data.completed ?? event.completed,
      };

      setEvents([...events, mappedEvent]);
      toast.success('Event added');
    } catch (error) {
      console.error('Add event error:', error);
      toast.error(getEventErrorMessage(error, 'Failed to add event'));
    }
  };

  const handleUpdateEvent = async (event: CalendarEvent) => {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .update({
          title: event.title,
          date: event.date,
          description: event.description,
          start_time: event.startTime,
          end_time: event.endTime,
          type: event.type,
          completed: event.completed,
        })
        .eq('id', event.id)
        .eq('user_id', currentUser?.id)
        .select()
        .single();

      if (error || !data) {
        console.error('Update event error:', error);
        toast.error(getEventErrorMessage(error, 'Failed to update event'));
        return;
      }

      const updatedEvents = events.map((e) => (e.id === event.id ? event : e));
      setEvents(updatedEvents);
      toast.success('Event updated');
    } catch (error) {
      console.error('Update event error:', error);
      toast.error(getEventErrorMessage(error, 'Failed to update event'));
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUser?.id);

      if (error) {
        toast.error('Failed to delete event');
        return;
      }

      const updatedEvents = events.filter((e) => e.id !== id);
      setEvents(updatedEvents);
      toast.success('Event deleted');
    } catch (error) {
      console.error('Delete event error:', error);
      toast.error('Failed to delete event');
    }
  };

  const handleResetSetup = async () => {
    setShowResetDialog(false);
    try {
      const { error } = await supabase
        .from('ojt_setup')
        .delete()
        .eq('user_id', currentUser?.id);

      if (error) {
        toast.error('Failed to reset setup');
        return;
      }
      toast.success('Setup reset successfully');
      navigate('/setup');
    } catch (error) {
      console.error('Reset setup error:', error);
      toast.error('Failed to reset setup');
    }
  };

  const handleLogout = () => {
    setShowLogoutDialog(false);
    clearCurrentUser();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  if (isLoading || !setup || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = calculateStats(setup, logs);

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

  return (
    <div className="min-h-screen overflow-x-hidden bg-transparent pb-20 md:pb-6">
      <div className="sticky top-0 z-20 border-b border-white/70 bg-white/75 shadow-sm backdrop-blur-xl">
        <div className="px-4 py-4 md:px-6 md:py-5">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-600 p-2 shadow-lg shadow-teal-700/20">
                <ClipboardList className="h-5 w-5 text-white md:h-6 md:w-6" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-semibold text-slate-900 md:text-2xl">
                  OJT Time Tracker
                </h1>
                <p className="hidden text-xs text-slate-600 sm:block md:text-sm">
                  Track your internship progress
                </p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full md:h-10 md:w-10">
                  <Avatar className="h-9 w-9 border-2 border-teal-200 md:h-10 md:w-10">
                    <AvatarFallback className="bg-teal-600 text-sm font-medium text-white">
                      {getInitials(currentUser.fullName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{currentUser.fullName}</p>
                    <p className="text-xs text-slate-500">{currentUser.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowResetDialog(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Reset Setup
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowLogoutDialog(true)} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-6 md:py-8">
        {activeTab === 'home' && (
          <div className="overflow-hidden rounded-[2rem] border border-white/60 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_26%),linear-gradient(135deg,_#0f766e_0%,_#0f5c8d_55%,_#172554_100%)] p-5 shadow-[0_30px_80px_-36px_rgba(15,23,42,0.7)] sm:p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:justify-between">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/85">
                  <Sparkles className="h-3.5 w-3.5" />
                  Progress command center
                </div>
                <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
                  {getGreeting()}, {currentUser.fullName.split(' ')[0]}
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-cyan-50/85 md:text-base">
                  Keep your internship hours, daily accomplishments, and completion outlook visible in one place.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                    <div className="mb-2 flex items-center gap-2 text-white/70">
                      <Target className="h-4 w-4" />
                      <span className="text-xs uppercase tracking-[0.18em]">Target</span>
                    </div>
                    <p className="text-2xl font-semibold text-white">{setup.totalRequiredHours}h</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                    <div className="mb-2 flex items-center gap-2 text-white/70">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-xs uppercase tracking-[0.18em]">Entries</span>
                    </div>
                    <p className="text-2xl font-semibold text-white">{logs.length}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                    <div className="mb-2 flex items-center gap-2 text-white/70">
                      <CalendarDays className="h-4 w-4" />
                      <span className="text-xs uppercase tracking-[0.18em]">Events</span>
                    </div>
                    <p className="text-2xl font-semibold text-white">{events.length}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/20 bg-white/10 p-4 backdrop-blur-sm sm:p-5 lg:min-w-[280px]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:flex-col lg:items-stretch">
                  <div className="sm:text-right lg:text-left">
                    <p className="mb-1 text-xs font-medium text-cyan-50/75">
                      {formatDate(currentTime)}
                    </p>
                    <p className="tabular-nums text-xl font-semibold text-white md:text-2xl">
                      {formatTime(currentTime)}
                    </p>
                  </div>
                  <div className="hidden h-12 w-px bg-white/30 sm:block lg:hidden" />
                  <Clock className="h-8 w-8 text-white/80 sm:block md:h-10 md:w-10" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'home' && (
          <StatsCards stats={stats} totalRequired={setup.totalRequiredHours} />
        )}

        {activeTab === 'home' && (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-[0_18px_60px_-34px_rgba(15,23,42,0.38)] backdrop-blur-xl">
              <div className="mb-4 flex items-center gap-2">
                <UserRound className="h-5 w-5 text-teal-600" />
                <h3 className="text-base font-semibold text-slate-900">Intern Profile</h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Name of Intern</p>
                  <p className="mt-2 break-words text-sm font-semibold text-slate-900">{setup.internName}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <GraduationCap className="h-4 w-4" />
                    <p className="text-xs uppercase tracking-[0.16em]">Course</p>
                  </div>
                  <p className="mt-2 break-words text-sm font-semibold text-slate-900">{setup.course}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Building2 className="h-4 w-4" />
                    <p className="text-xs uppercase tracking-[0.16em]">School Name</p>
                  </div>
                  <p className="mt-2 break-words text-sm font-semibold text-slate-900">{setup.schoolName}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Building2 className="h-4 w-4" />
                    <p className="text-xs uppercase tracking-[0.16em]">Company Name</p>
                  </div>
                  <p className="mt-2 break-words text-sm font-semibold text-slate-900">{setup.companyName}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <BriefcaseBusiness className="h-4 w-4" />
                    <p className="text-xs uppercase tracking-[0.16em]">Assigned Department</p>
                  </div>
                  <p className="mt-2 break-words text-sm font-semibold text-slate-900">{setup.assignedDepartment}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-[0_18px_60px_-34px_rgba(15,23,42,0.38)] backdrop-blur-xl">
              <div className="mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5 text-amber-600" />
                <h3 className="text-base font-semibold text-slate-900">Placement Details</h3>
              </div>
              <div className="space-y-3">
                <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-amber-700">Immediate Supervisor</p>
                  <p className="mt-2 break-words text-sm font-semibold text-amber-950">{setup.immediateSupervisor}</p>
                </div>
                <div className="rounded-2xl border border-teal-200 bg-teal-50/70 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-teal-700">Work Schedule</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {setup.workingDays.length} working day{setup.workingDays.length === 1 ? '' : 's'} selected
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Starting Baseline</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {setup.previousHours.toFixed(1)} previous hour{setup.previousHours === 1 ? '' : 's'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="pb-safe">
          {activeTab === 'log' && (
            <TimeLogForm
              editingLog={editingLog}
              onCancelEdit={handleCancelEditLog}
              onSave={handleSaveLog}
            />
          )}
          {activeTab === 'history' && (
            <TimeLogHistory
              logs={logs}
              onDelete={handleDeleteLog}
              onEdit={handleEditLog}
            />
          )}
          {activeTab === 'calendar' && (
            <Calendar
              events={events}
              onAddEvent={handleAddEvent}
              onUpdateEvent={handleUpdateEvent}
              onDeleteEvent={handleDeleteEvent}
            />
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/70 bg-white/85 shadow-lg backdrop-blur-xl md:hidden">
        <div className="grid h-16 grid-cols-4">
          <button
            onClick={() => setActiveTab('home')}
            className={`relative flex flex-col items-center justify-center gap-1 transition-all ${
              activeTab === 'home' ? 'bg-teal-50 text-teal-700' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Home className="h-6 w-6" />
            <span className="text-xs font-medium">Home</span>
            {activeTab === 'home' && (
              <div className="absolute top-0 left-1/2 h-1 w-12 -translate-x-1/2 rounded-full bg-teal-600" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('log')}
            className={`relative flex flex-col items-center justify-center gap-1 transition-all ${
              activeTab === 'log' ? 'bg-teal-50 text-teal-700' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Clock className="h-6 w-6" />
            <span className="text-xs font-medium">Log</span>
            {activeTab === 'log' && (
              <div className="absolute top-0 left-1/2 h-1 w-12 -translate-x-1/2 rounded-full bg-teal-600" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`relative flex flex-col items-center justify-center gap-1 transition-all ${
              activeTab === 'history' ? 'bg-teal-50 text-teal-700' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <div className="relative">
              <History className="h-6 w-6" />
              {logs.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
                  {logs.length > 9 ? '9+' : logs.length}
                </span>
              )}
            </div>
            <span className="text-xs font-medium">History</span>
            {activeTab === 'history' && (
              <div className="absolute top-0 left-1/2 h-1 w-12 -translate-x-1/2 rounded-full bg-teal-600" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`relative flex flex-col items-center justify-center gap-1 transition-all ${
              activeTab === 'calendar' ? 'bg-teal-50 text-teal-700' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <CalendarDays className="h-6 w-6" />
            <span className="text-xs font-medium">Calendar</span>
            {activeTab === 'calendar' && (
              <div className="absolute top-0 left-1/2 h-1 w-12 -translate-x-1/2 rounded-full bg-teal-600" />
            )}
          </button>
        </div>
      </div>

      <div className="fixed bottom-8 left-1/2 z-30 hidden -translate-x-1/2 md:block">
        <div className="rounded-full border border-white/70 bg-white/85 px-2 py-2 shadow-xl backdrop-blur-xl">
          <div className="flex flex-wrap justify-center gap-1">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 transition-all ${
                activeTab === 'home'
                  ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Home className="h-4 w-4" />
              <span className="text-sm font-medium">Home</span>
            </button>

            <button
              onClick={() => setActiveTab('log')}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 transition-all ${
                activeTab === 'log'
                  ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Log Time</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`relative flex items-center gap-2 rounded-full px-5 py-2.5 transition-all ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <History className="h-4 w-4" />
              <span className="text-sm font-medium">History ({logs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 transition-all ${
                activeTab === 'calendar'
                  ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <CalendarDays className="h-4 w-4" />
              <span className="text-sm font-medium">Calendar</span>
            </button>
          </div>
        </div>
      </div>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-red-600" />
              Confirm Logout
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out? You&apos;ll need to sign in again to access your dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
              Log Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-amber-600" />
              Reset Setup
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset your setup? This will clear all your OJT data including time logs and events. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetSetup} className="bg-amber-600 hover:bg-amber-700">
              Reset Setup
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
