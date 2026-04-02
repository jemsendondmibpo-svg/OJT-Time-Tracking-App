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
import { ClipboardList, LogOut, Settings, CalendarDays, Clock, History, Home } from 'lucide-react';
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

export function Dashboard() {
  const navigate = useNavigate();
  const [currentUser] = useState(() => getCurrentUser());
  const [setup, setSetup] = useState<OJTSetup | null>(null);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [activeTab, setActiveTab] = useState<TabValue>('home');
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

      // Load setup
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
        totalRequiredHours: setupData.total_required_hours,
        previousHours: setupData.previous_hours,
        workingDays: setupData.working_days,
        startDate: setupData.start_date,
      };
      setSetup(mappedSetup);

      // Load logs
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
          hoursWorked: log.hours_worked,
          accomplishment: log.accomplishment,
          photoUrl: log.photo_url,
        }));
        setLogs(mappedLogs);
      }

      // Load events
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
          color: event.color,
        }));
        setEvents(mappedEvents);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setIsLoading(false);
    }
  };

  const handleSaveLog = async (log: DailyLog) => {
    // Reload data after saving
    await loadData();
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

      const updatedLogs = logs.filter(log => log.id !== id);
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
          color: event.color,
        })
        .select()
        .single();

      if (error || !data) {
        toast.error('Failed to add event');
        return;
      }

      const mappedEvent: CalendarEvent = {
        id: data.id,
        title: data.title,
        date: data.date,
        description: data.description,
        color: data.color,
      };

      setEvents([...events, mappedEvent]);
      toast.success('Event added');
    } catch (error) {
      console.error('Add event error:', error);
      toast.error('Failed to add event');
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
          color: event.color,
        })
        .eq('id', event.id)
        .eq('user_id', currentUser?.id)
        .select()
        .single();

      if (error || !data) {
        toast.error('Failed to update event');
        return;
      }

      const updatedEvents = events.map(e => e.id === event.id ? event : e);
      setEvents(updatedEvents);
      toast.success('Event updated');
    } catch (error) {
      console.error('Update event error:', error);
      toast.error('Failed to update event');
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

      const updatedEvents = events.filter(e => e.id !== id);
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = calculateStats(setup, logs);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-20">
        <div className="px-4 py-4 md:px-6 md:py-5">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg shadow-sm">
                <ClipboardList className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-2xl font-semibold text-slate-900">
                  OJT Time Tracker
                </h1>
                <p className="text-xs md:text-sm text-slate-600 hidden sm:block">
                  Track your internship progress
                </p>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 md:h-10 md:w-10 rounded-full">
                  <Avatar className="h-9 w-9 md:h-10 md:w-10 border-2 border-blue-200">
                    <AvatarFallback className="bg-blue-600 text-white font-medium text-sm">
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
                  <Settings className="w-4 h-4 mr-2" />
                  Reset Setup
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowLogoutDialog(true)} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 md:px-6 md:py-8 space-y-6 max-w-7xl mx-auto">
        {/* Welcome Banner with Date and Time - Only show on Home tab */}
        {activeTab === 'home' && (
          <div className="bg-blue-600 rounded-xl p-6 shadow-lg border border-blue-700">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">
                  {getGreeting()}, {currentUser.fullName.split(' ')[0]} 👋
                </h2>
                <p className="text-sm md:text-base text-blue-100">
                  Ready to track your progress today?
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs font-medium text-blue-100 mb-1">
                      {formatDate(currentTime)}
                    </p>
                    <p className="text-xl md:text-2xl font-semibold text-white tabular-nums">
                      {formatTime(currentTime)}
                    </p>
                  </div>
                  <div className="hidden md:block w-px h-12 bg-white/30" />
                  <Clock className="w-8 h-8 md:w-10 md:h-10 text-white/80 hidden md:block" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Section - Only show on Home tab */}
        {activeTab === 'home' && (
          <StatsCards stats={stats} totalRequired={setup.totalRequiredHours} />
        )}

        {/* Content based on active tab */}
        <div className="pb-safe">
          {activeTab === 'log' && <TimeLogForm onSave={handleSaveLog} />}
          {activeTab === 'history' && <TimeLogHistory logs={logs} onDelete={handleDeleteLog} />}
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

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 md:hidden shadow-lg">
        <div className="grid grid-cols-4 h-16">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center gap-1 transition-all ${
              activeTab === 'home'
                ? 'text-blue-600 bg-blue-50'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">Home</span>
            {activeTab === 'home' && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('log')}
            className={`flex flex-col items-center justify-center gap-1 transition-all ${
              activeTab === 'log'
                ? 'text-blue-600 bg-blue-50'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Clock className="w-6 h-6" />
            <span className="text-xs font-medium">Log</span>
            {activeTab === 'log' && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center justify-center gap-1 transition-all relative ${
              activeTab === 'history'
                ? 'text-blue-600 bg-blue-50'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <div className="relative">
              <History className="w-6 h-6" />
              {logs.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                  {logs.length > 9 ? '9+' : logs.length}
                </span>
              )}
            </div>
            <span className="text-xs font-medium">History</span>
            {activeTab === 'history' && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex flex-col items-center justify-center gap-1 transition-all ${
              activeTab === 'calendar'
                ? 'text-blue-600 bg-blue-50'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <CalendarDays className="w-6 h-6" />
            <span className="text-xs font-medium">Calendar</span>
            {activeTab === 'calendar' && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-600 rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Desktop Tab Navigation (hidden on mobile) */}
      <div className="hidden md:block fixed bottom-8 left-1/2 -translate-x-1/2 z-30">
        <div className="bg-white rounded-full shadow-xl border border-slate-200 px-2 py-2">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all ${
                activeTab === 'home'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium">Home</span>
            </button>

            <button
              onClick={() => setActiveTab('log')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all ${
                activeTab === 'log'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Log Time</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all relative ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <History className="w-4 h-4" />
              <span className="text-sm font-medium">History ({logs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all ${
                activeTab === 'calendar'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span className="text-sm font-medium">Calendar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <LogOut className="w-5 h-5 text-red-600" />
              Confirm Logout
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out? You'll need to sign in again to access your dashboard.
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

      {/* Reset Setup Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-amber-600" />
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