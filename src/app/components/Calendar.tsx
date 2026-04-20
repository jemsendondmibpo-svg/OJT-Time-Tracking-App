import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CalendarEvent, DailyLog } from '../types';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
} from 'date-fns';
import { EventDialog } from './EventDialog';
import { Badge } from './ui/badge';

type PhilippineHolidayType =
  | 'regular'
  | 'special-non-working'
  | 'additional-special-non-working'
  | 'special-working';

interface PhilippineHoliday {
  date: string;
  name: string;
  type: PhilippineHolidayType;
}

const PHILIPPINE_HOLIDAYS_2026: PhilippineHoliday[] = [
  { date: '2026-01-01', name: "New Year's Day", type: 'regular' },
  { date: '2026-02-17', name: 'Chinese New Year', type: 'additional-special-non-working' },
  { date: '2026-02-25', name: 'EDSA People Power Revolution Anniversary', type: 'special-working' },
  { date: '2026-03-20', name: "Eid'l Fitr", type: 'regular' },
  { date: '2026-04-02', name: 'Maundy Thursday', type: 'regular' },
  { date: '2026-04-03', name: 'Good Friday', type: 'regular' },
  { date: '2026-04-04', name: 'Black Saturday', type: 'additional-special-non-working' },
  { date: '2026-04-09', name: 'Araw ng Kagitingan', type: 'regular' },
  { date: '2026-05-01', name: 'Labor Day', type: 'regular' },
  { date: '2026-06-12', name: 'Independence Day', type: 'regular' },
  { date: '2026-08-21', name: 'Ninoy Aquino Day', type: 'special-non-working' },
  { date: '2026-08-31', name: 'National Heroes Day', type: 'regular' },
  { date: '2026-11-01', name: "All Saints' Day", type: 'special-non-working' },
  { date: '2026-11-02', name: "All Souls' Day", type: 'additional-special-non-working' },
  { date: '2026-11-30', name: 'Bonifacio Day', type: 'regular' },
  { date: '2026-12-08', name: 'Feast of the Immaculate Conception of Mary', type: 'special-non-working' },
  { date: '2026-12-24', name: 'Christmas Eve', type: 'additional-special-non-working' },
  { date: '2026-12-25', name: 'Christmas Day', type: 'regular' },
  { date: '2026-12-30', name: 'Rizal Day', type: 'regular' },
  { date: '2026-12-31', name: 'Last Day of the Year', type: 'special-non-working' },
];

const getHolidayBadgeClasses = (type: PhilippineHolidayType) => {
  switch (type) {
    case 'regular':
      return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-100';
    case 'special-non-working':
      return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-100';
    case 'additional-special-non-working':
      return 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-400/30 dark:bg-orange-500/10 dark:text-orange-100';
    case 'special-working':
      return 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200';
    default:
      return 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200';
  }
};

interface CalendarProps {
  events: CalendarEvent[];
  logs: DailyLog[];
  onAddEvent: (event: CalendarEvent) => void;
  onUpdateEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
}

export function Calendar({ events, logs, onAddEvent, onUpdateEvent, onDeleteEvent }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    setEditingEvent(null);
    setIsDialogOpen(true);
  };

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEvent(event);
    setSelectedDate(parseISO(event.date));
    setIsDialogOpen(true);
  };

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.filter((event) => event.date === dateStr);
  };

  const getHoursForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return logs
      .filter((log) => log.date === dateStr && log.isPresent)
      .reduce((total, log) => total + log.hoursWorked, 0);
  };

  const getPhilippineHolidayForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return PHILIPPINE_HOLIDAYS_2026.find((holiday) => holiday.date === dateStr) ?? null;
  };

  const getEventColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'important':
        return 'bg-rose-500 hover:bg-rose-600';
      case 'meeting':
        return 'bg-sky-500 hover:bg-sky-600';
      case 'deadline':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'reminder':
        return 'bg-teal-500 hover:bg-teal-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const formatEventType = (type: CalendarEvent['type']) =>
    type.charAt(0).toUpperCase() + type.slice(1);

  const renderDays = () => {
    const days = [];
    const dateFormat = 'EEEEEE';
    const weekdayStart = startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="py-1 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 md:py-2 md:text-xs">
          {format(addDays(weekdayStart, i), dateFormat)}
        </div>
      );
    }

    return <div className="mb-1 grid min-w-[42rem] grid-cols-7 gap-1 md:mb-2">{days}</div>;
  };

  const renderCells = () => {
    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, 'd');
        const cloneDay = day;
        const dayEvents = getEventsForDate(day);
        const hoursWorked = getHoursForDate(day);
        const holiday = getPhilippineHolidayForDate(day);
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());
        const isRealHoliday = holiday && holiday.type !== 'special-working';

        days.push(
          <div
            key={day.toString()}
            className={`min-h-[78px] cursor-pointer rounded-xl border p-1.5 transition-all md:min-h-[92px] md:rounded-2xl md:p-2 ${
              !isCurrentMonth
                ? 'border-slate-200 bg-slate-50/80 opacity-50 dark:border-slate-800 dark:bg-slate-900/70'
                : isRealHoliday
                  ? 'border-rose-200/90 bg-rose-50/70 hover:border-rose-300 hover:bg-rose-50 dark:border-rose-400/30 dark:bg-rose-500/10 dark:hover:border-rose-300/40 dark:hover:bg-rose-500/15'
                  : 'border-slate-200/90 bg-white/90 hover:border-teal-200 hover:bg-teal-50/40 dark:border-slate-700 dark:bg-slate-900/75 dark:hover:border-teal-400/30 dark:hover:bg-teal-500/10'
            } ${isToday ? 'ring-2 ring-teal-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900' : ''} ${isRealHoliday ? 'ring-1 ring-rose-400 ring-offset-2 ring-offset-rose-50 dark:ring-offset-slate-900' : holiday?.type === 'special-working' ? 'ring-1 ring-slate-300 ring-offset-2 ring-offset-slate-50 dark:ring-slate-600 dark:ring-offset-slate-900' : ''}`}
            onClick={() => handleDateClick(cloneDay)}
          >
            <div className={`mb-1 text-center text-[10px] font-medium md:text-left md:text-sm ${isToday ? 'font-bold text-teal-700 dark:text-teal-300' : isRealHoliday ? 'font-semibold text-rose-700 dark:text-rose-300' : holiday?.type === 'special-working' ? 'font-semibold text-slate-700 dark:text-slate-300' : 'text-slate-700 dark:text-slate-300'}`}>
              {formattedDate}
            </div>
            {holiday && (
              <div className={`mb-1 truncate rounded-md border px-1 py-0.5 text-center text-[8px] font-semibold md:text-[10px] ${getHolidayBadgeClasses(holiday.type)}`}>
                {holiday.name}
              </div>
            )}
            <div className="space-y-1">
              {hoursWorked > 0 && (
                <div className="rounded-md bg-emerald-100 px-1 py-0.5 text-center text-[8px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 md:rounded-lg md:px-2 md:py-1 md:text-[11px]">
                  {hoursWorked.toFixed(hoursWorked % 1 === 0 ? 0 : 1)}h worked
                </div>
              )}
              {dayEvents.slice(0, 2).map((event) => (
                <div
                  key={event.id}
                  onClick={(e) => handleEventClick(event, e)}
                  className={`truncate rounded-md px-1 py-0.5 text-[8px] text-white md:rounded-lg md:px-2 md:py-1 md:text-xs ${getEventColor(event.type)} ${
                    event.completed ? 'opacity-60 line-through' : ''
                  }`}
                >
                  {event.title}
                </div>
              ))}
              {dayEvents.length > 2 && (
                <div className="text-center text-[8px] font-medium text-slate-500 dark:text-slate-400 md:text-xs">
                  +{dayEvents.length - 2}
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }

      rows.push(
        <div className="mb-1 grid min-w-[42rem] grid-cols-7 gap-1" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }

    return <div>{rows}</div>;
  };

  const upcomingEvents = events
    .filter((event) => {
      const eventDate = parseISO(event.date);
      return eventDate >= new Date() && !event.completed;
    })
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-3 md:space-y-4">
      <Card className="border border-white/70 bg-white/85 shadow-[0_18px_60px_-34px_rgba(15,23,42,0.38)] backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/70 dark:shadow-[0_20px_70px_-35px_rgba(2,6,23,0.9)]">
        <CardHeader className="pb-2 md:pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="bg-gradient-to-r from-teal-700 via-cyan-700 to-sky-700 bg-clip-text text-base font-bold text-transparent md:text-xl">
              {format(currentMonth, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrevMonth} className="h-8 w-8 p-0">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleNextMonth} className="h-8 w-8 p-0">
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setSelectedDate(new Date());
                  setEditingEvent(null);
                  setIsDialogOpen(true);
                }}
                className="h-8 bg-gradient-to-r from-teal-600 to-cyan-600 px-2 text-xs text-white hover:from-teal-700 hover:to-cyan-700 md:px-3 md:text-sm"
              >
                <Plus className="mr-0 h-4 w-4 md:mr-1" />
                <span className="hidden sm:inline">Add Event</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-3 pb-4 pt-2 sm:px-6">
          <div className="-mx-1 overflow-x-auto pb-1">
            <div className="min-w-[42rem] px-1">
              {renderDays()}
              {renderCells()}
            </div>
          </div>
        </CardContent>
      </Card>

      {upcomingEvents.length > 0 && (
        <Card className="border border-white/70 bg-white/85 shadow-[0_18px_60px_-34px_rgba(15,23,42,0.38)] backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/70 dark:shadow-[0_20px_70px_-35px_rgba(2,6,23,0.9)]">
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-base font-bold text-gray-800 dark:text-slate-100 md:text-lg">
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 md:space-y-3">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={(e) => handleEventClick(event, e)}
                  className="cursor-pointer rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,_rgba(240,253,250,0.96),_rgba(239,246,255,0.92))] p-3 transition-all hover:border-teal-200 hover:shadow-md md:p-4 dark:border-slate-700 dark:bg-[linear-gradient(180deg,_rgba(15,23,42,0.94),_rgba(17,24,39,0.88))] dark:hover:border-teal-400/30"
                >
                  <div className="mb-1 flex items-start justify-between gap-2 md:mb-2">
                    <h4 className="flex-1 text-sm font-semibold text-gray-800 dark:text-slate-100 md:text-base">{event.title}</h4>
                    <Badge className={`${getEventColor(event.type)} shrink-0 text-[10px] text-white md:text-xs`}>
                      {formatEventType(event.type)}
                    </Badge>
                  </div>
                  <p className="mb-1 line-clamp-2 text-xs text-gray-600 dark:text-slate-300 md:mb-2 md:text-sm">{event.description}</p>
                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-500 dark:text-slate-400 md:gap-3 md:text-xs">
                    <span>{format(parseISO(event.date), 'MMM dd, yyyy')}</span>
                    <span>{event.startTime} - {event.endTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <EventDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingEvent(null);
        }}
        onSave={(event) => {
          if (editingEvent) {
            onUpdateEvent(event);
          } else {
            onAddEvent(event);
          }
          setIsDialogOpen(false);
          setEditingEvent(null);
        }}
        onDelete={onDeleteEvent}
        selectedDate={selectedDate}
        editingEvent={editingEvent}
      />
    </div>
  );
}
