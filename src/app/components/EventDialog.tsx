import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { CalendarEvent } from '../types';
import { Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';

interface EventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  onDelete: (id: string) => void;
  selectedDate: Date | null;
  editingEvent: CalendarEvent | null;
}

export function EventDialog({
  isOpen,
  onClose,
  onSave,
  onDelete,
  selectedDate,
  editingEvent,
}: EventDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [type, setType] = useState<CalendarEvent['type']>('important');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setDescription(editingEvent.description);
      setDate(editingEvent.date);
      setStartTime(editingEvent.startTime);
      setEndTime(editingEvent.endTime);
      setType(editingEvent.type);
      setCompleted(editingEvent.completed);
    } else if (selectedDate) {
      setTitle('');
      setDescription('');
      setDate(format(selectedDate, 'yyyy-MM-dd'));
      setStartTime('09:00');
      setEndTime('10:00');
      setType('important');
      setCompleted(false);
    }
  }, [editingEvent, selectedDate, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!date) {
      toast.error('Please select a date');
      return;
    }

    if (startTime && endTime && endTime <= startTime) {
      toast.error('End time must be later than start time');
      return;
    }

    const event: CalendarEvent = {
      id: editingEvent?.id || `event-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      date,
      startTime,
      endTime,
      type,
      completed,
    };

    onSave(event);
    toast.success(editingEvent ? 'Event updated' : 'Event created');
    handleClose();
  };

  const handleDelete = () => {
    if (editingEvent && window.confirm('Are you sure you want to delete this event?')) {
      onDelete(editingEvent.id);
      toast.success('Event deleted');
      handleClose();
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setDate('');
    setStartTime('09:00');
    setEndTime('10:00');
    setType('important');
    setCompleted(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] w-[95vw] max-w-md overflow-y-auto rounded-3xl p-4 dark:border-slate-700 dark:bg-slate-900/95 sm:w-full sm:p-6">
        <DialogHeader>
          <DialogTitle className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-lg font-bold text-transparent md:text-xl">
            {editingEvent ? 'Edit Event' : 'Add New Event'}
          </DialogTitle>
          <DialogDescription className="text-xs dark:text-slate-400 md:text-sm">
            {editingEvent ? 'Update your event details' : 'Create a new event to track important matters'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
          <div className="space-y-1.5 md:space-y-2">
            <Label htmlFor="title" className="text-xs font-semibold dark:text-slate-300 md:text-sm">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Team Meeting"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="border-2 text-sm focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5 md:space-y-2">
            <Label htmlFor="description" className="text-xs font-semibold dark:text-slate-300 md:text-sm">Description</Label>
            <Textarea
              id="description"
              placeholder="Additional details about this event..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none border-2 text-sm focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5 md:space-y-2">
            <Label htmlFor="type" className="text-xs font-semibold dark:text-slate-300 md:text-sm">Event Type *</Label>
            <Select value={type} onValueChange={(value) => setType(value as CalendarEvent['type'])}>
              <SelectTrigger className="border-2 focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="important">
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-500"></span>
                    Important
                  </span>
                </SelectItem>
                <SelectItem value="meeting">
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-blue-500"></span>
                    Meeting
                  </span>
                </SelectItem>
                <SelectItem value="deadline">
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-orange-500"></span>
                    Deadline
                  </span>
                </SelectItem>
                <SelectItem value="reminder">
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-violet-500"></span>
                    Reminder
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 md:space-y-2">
            <Label htmlFor="date" className="text-xs font-semibold dark:text-slate-300 md:text-sm">Date *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="border-2 text-sm focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 md:gap-3">
            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="startTime" className="text-xs font-semibold dark:text-slate-300 md:text-sm">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="border-2 text-sm focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="endTime" className="text-xs font-semibold dark:text-slate-300 md:text-sm">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="border-2 text-sm focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
              />
            </div>
          </div>

          {editingEvent && (
            <div className="flex items-center space-x-3 rounded-lg border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-2 dark:border-emerald-400/20 dark:from-emerald-500/10 dark:to-green-500/10 md:p-3">
              <Checkbox
                id="completed"
                checked={completed}
                onCheckedChange={(checked) => setCompleted(checked as boolean)}
                className="h-4 w-4 md:h-5 md:w-5"
              />
              <label
                htmlFor="completed"
                className="flex-1 cursor-pointer text-xs font-medium leading-none dark:text-slate-200 md:text-sm"
              >
                Mark as completed
              </label>
            </div>
          )}

          <DialogFooter className="flex-col gap-2 pt-2 sm:flex-row">
            {editingEvent && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                className="w-full text-sm sm:w-auto"
              >
                <Trash2 className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                Delete
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="w-full text-sm sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-violet-600 to-blue-600 text-sm hover:from-violet-700 hover:to-blue-700 sm:w-auto"
            >
              <Save className="mr-2 h-3 w-3 md:h-4 md:w-4" />
              {editingEvent ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
