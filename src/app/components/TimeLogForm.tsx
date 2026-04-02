import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { DailyLog } from '../types';
import { calculateHoursWorked } from '../utils';
import { supabase } from '../supabase-client';
import { getCurrentUser } from '../auth-utils';
import { Clock, Save } from 'lucide-react';
import { toast } from 'sonner';

interface TimeLogFormProps {
  onSave: (log: DailyLog) => void;
}

export function TimeLogForm({ onSave }: TimeLogFormProps) {
  const today = new Date().toISOString().split('T')[0];
  const currentUser = getCurrentUser();
  
  const [date, setDate] = useState(today);
  const [timeIn, setTimeIn] = useState('');
  const [timeOut, setTimeOut] = useState('');
  const [isPresent, setIsPresent] = useState(true);
  const [accomplishment, setAccomplishment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const hoursWorked = calculateHoursWorked(timeIn, timeOut);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      toast.error('Please select a date');
      return;
    }

    if (isPresent && (!timeIn || !timeOut)) {
      toast.error('Please enter both time in and time out');
      return;
    }

    if (isPresent && hoursWorked <= 0) {
      toast.error('Time out must be after time in');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('time_logs')
        .insert({
          user_id: currentUser?.id,
          date,
          is_present: isPresent,
          time_in: isPresent ? timeIn : null,
          time_out: isPresent ? timeOut : null,
          hours_worked: isPresent ? hoursWorked : 0,
          accomplishment: accomplishment || null,
        });

      if (error) {
        // Check if it's a duplicate entry
        if (error.code === '23505') {
          toast.error('A log for this date already exists');
        } else {
          toast.error(error.message || 'Failed to save log');
        }
        setIsLoading(false);
        return;
      }

      toast.success('Time log saved successfully!');
      
      // Notify parent to refresh data
      onSave({} as DailyLog);
      
      // Reset form
      setDate(today);
      setTimeIn('');
      setTimeOut('');
      setAccomplishment('');
      setIsPresent(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Save log error:', error);
      toast.error('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <Clock className="w-5 h-5 text-blue-600" />
          Log Daily Time
        </CardTitle>
        <CardDescription className="text-sm text-slate-600">
          Record your daily attendance and hours worked
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium text-slate-700">Date *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={today}
              required
              className="h-11 border-slate-300 focus:border-blue-600 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Checkbox
              id="present"
              checked={isPresent}
              onCheckedChange={(checked) => setIsPresent(checked as boolean)}
              className="h-5 w-5"
            />
            <label
              htmlFor="present"
              className="text-sm font-medium leading-none cursor-pointer flex-1 text-slate-900"
            >
              Mark as Present
            </label>
          </div>

          {isPresent && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="timeIn" className="text-sm font-medium text-slate-700">Time In *</Label>
                  <Input
                    id="timeIn"
                    type="time"
                    value={timeIn}
                    onChange={(e) => setTimeIn(e.target.value)}
                    required={isPresent}
                    className="h-11 border-slate-300 focus:border-blue-600 focus:ring-blue-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeOut" className="text-sm font-medium text-slate-700">Time Out *</Label>
                  <Input
                    id="timeOut"
                    type="time"
                    value={timeOut}
                    onChange={(e) => setTimeOut(e.target.value)}
                    required={isPresent}
                    className="h-11 border-slate-300 focus:border-blue-600 focus:ring-blue-600"
                  />
                </div>
              </div>

              {timeIn && timeOut && (
                <div className="p-4 bg-emerald-600 rounded-lg shadow-sm">
                  <p className="text-sm font-medium text-white">
                    Hours Worked: <span className="text-xl font-semibold">{hoursWorked.toFixed(2)}</span> hours
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="accomplishment" className="text-sm font-medium text-slate-700">Daily Accomplishment</Label>
                <Textarea
                  id="accomplishment"
                  placeholder="What did you accomplish today?"
                  value={accomplishment}
                  onChange={(e) => setAccomplishment(e.target.value)}
                  rows={3}
                  className="resize-none border-slate-300 focus:border-blue-600 focus:ring-blue-600"
                />
              </div>
            </>
          )}

          {!isPresent && (
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-900 font-medium">
                This day will be marked as absent. No hours will be recorded.
              </p>
            </div>
          )}

          <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <Save className="w-4 h-4 mr-2" />
            Save Time Log
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}