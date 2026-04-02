import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CalendarEvent } from '../types';
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
  parseISO
} from 'date-fns';
import { EventDialog } from './EventDialog';
import { Badge } from './ui/badge';

interface CalendarProps {
  events: CalendarEvent[];
  onAddEvent: (event: CalendarEvent) => void;
  onUpdateEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
}

export function Calendar({ events, onAddEvent, onUpdateEvent, onDeleteEvent }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

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
    return events.filter(event => event.date === dateStr);
  };

  const getEventColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'important':
        return 'bg-red-500 hover:bg-red-600';
      case 'meeting':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'deadline':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'reminder':
        return 'bg-violet-500 hover:bg-violet-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const renderDays = () => {
    const days = [];
    const dateFormat = 'EEEEEE';
    const startDate = startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center text-[10px] md:text-xs font-semibold text-gray-600 py-1 md:py-2">
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }

    return <div className="grid grid-cols-7 gap-0.5 md:gap-1 mb-1 md:mb-2">{days}</div>;
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
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());

        days.push(
          <div
            key={day.toString()}
            className={`min-h-[60px] md:min-h-[80px] p-0.5 md:p-1 border border-gray-200 rounded-md md:rounded-lg cursor-pointer transition-all hover:bg-violet-50 ${
              !isCurrentMonth ? 'bg-gray-50 opacity-50' : 'bg-white'
            } ${isToday ? 'ring-1 md:ring-2 ring-violet-500' : ''}`}
            onClick={() => handleDateClick(cloneDay)}
          >
            <div className={`text-[10px] md:text-sm font-medium mb-0.5 md:mb-1 text-center md:text-left ${isToday ? 'text-violet-600 font-bold' : 'text-gray-700'}`}>
              {formattedDate}
            </div>
            <div className="space-y-0.5 md:space-y-1">
              {dayEvents.slice(0, 2).map((event) => (
                <div
                  key={event.id}
                  onClick={(e) => handleEventClick(event, e)}
                  className={`text-[8px] md:text-xs p-0.5 md:p-1 rounded text-white truncate ${getEventColor(event.type)} ${
                    event.completed ? 'opacity-60 line-through' : ''
                  }`}
                >
                  {event.title}
                </div>
              ))}
              {dayEvents.length > 2 && (
                <div className="text-[8px] md:text-xs text-gray-500 font-medium text-center">
                  +{dayEvents.length - 2}
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-0.5 md:gap-1 mb-0.5 md:mb-1" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  const upcomingEvents = events
    .filter(event => {
      const eventDate = parseISO(event.date);
      return eventDate >= new Date() && !event.completed;
    })
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-3 md:space-y-4">
      <Card className="border-2 border-violet-100 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader className="pb-2 md:pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base md:text-xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
              {format(currentMonth, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex items-center gap-1 md:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevMonth}
                className="h-7 w-7 md:h-8 md:w-8 p-0"
              >
                <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextMonth}
                className="h-7 w-7 md:h-8 md:w-8 p-0"
              >
                <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setSelectedDate(new Date());
                  setEditingEvent(null);
                  setIsDialogOpen(true);
                }}
                className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 h-7 md:h-8 text-xs md:text-sm px-2 md:px-3"
              >
                <Plus className="h-3 w-3 md:h-4 md:w-4 mr-0 md:mr-1" />
                <span className="hidden sm:inline">Add Event</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderDays()}
          {renderCells()}
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <Card className="border-2 border-blue-100 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-base md:text-lg font-bold text-gray-800">
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 md:space-y-3">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={(e) => handleEventClick(event, e)}
                  className="p-2 md:p-3 bg-gradient-to-br from-violet-50 to-blue-50 rounded-lg border-2 border-violet-200 cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-1 md:mb-2 gap-2">
                    <h4 className="font-semibold text-sm md:text-base text-gray-800 flex-1">{event.title}</h4>
                    <Badge className={`${getEventColor(event.type)} text-white text-[10px] md:text-xs shrink-0`}>
                      {event.type}
                    </Badge>
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2 line-clamp-2">{event.description}</p>
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 text-[10px] md:text-xs text-gray-500">
                    <span>📅 {format(parseISO(event.date), 'MMM dd, yyyy')}</span>
                    <span>🕐 {event.startTime} - {event.endTime}</span>
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