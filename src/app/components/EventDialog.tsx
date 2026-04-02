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
      <DialogContent className="max-w-md w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
            {editingEvent ? 'Edit Event' : 'Add New Event'}
          </DialogTitle>
          <DialogDescription className="text-xs md:text-sm">
            {editingEvent ? 'Update your event details' : 'Create a new event to track important matters'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
          <div className="space-y-1.5 md:space-y-2">
            <Label htmlFor="title" className="font-semibold text-xs md:text-sm">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Team Meeting"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="border-2 focus:border-violet-500 text-sm"
            />
          </div>

          <div className="space-y-1.5 md:space-y-2">
            <Label htmlFor="description" className="font-semibold text-xs md:text-sm">Description</Label>
            <Textarea
              id="description"
              placeholder="Additional details about this event..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none border-2 focus:border-violet-500 text-sm"
            />
          </div>

          <div className="space-y-1.5 md:space-y-2">
            <Label htmlFor="type" className="font-semibold text-xs md:text-sm">Event Type *</Label>
            <Select value={type} onValueChange={(value) => setType(value as CalendarEvent['type'])}>
              <SelectTrigger className="border-2 focus:border-violet-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="important">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    Important
                  </span>
                </SelectItem>
                <SelectItem value="meeting">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                    Meeting
                  </span>
                </SelectItem>
                <SelectItem value="deadline">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                    Deadline
                  </span>
                </SelectItem>
                <SelectItem value="reminder">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-violet-500 rounded-full"></span>
                    Reminder
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 md:space-y-2">
            <Label htmlFor="date" className="font-semibold text-xs md:text-sm">Date *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="border-2 focus:border-violet-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 md:gap-3">
            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="startTime" className="font-semibold text-xs md:text-sm">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="border-2 focus:border-violet-500 text-sm"
              />
            </div>

            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="endTime" className="font-semibold text-xs md:text-sm">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="border-2 focus:border-violet-500 text-sm"
              />
            </div>
          </div>

          {editingEvent && (
            <div className="flex items-center space-x-3 p-2 md:p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
              <Checkbox
                id="completed"
                checked={completed}
                onCheckedChange={(checked) => setCompleted(checked as boolean)}
                className="h-4 w-4 md:h-5 md:w-5"
              />
              <label
                htmlFor="completed"
                className="text-xs md:text-sm font-medium leading-none cursor-pointer flex-1"
              >
                Mark as completed
              </label>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
            {editingEvent && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                className="w-full sm:w-auto text-sm"
              >
                <Trash2 className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                Delete
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="w-full sm:w-auto text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-sm"
            >
              <Save className="w-3 h-3 md:w-4 md:h-4 mr-2" />
              {editingEvent ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}