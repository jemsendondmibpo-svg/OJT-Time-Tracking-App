import { useEffect, useState } from 'react';
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
import { Clock, Save, CalendarClock, NotebookPen, BadgeAlert } from 'lucide-react';
import { toast } from 'sonner';

interface TimeLogFormProps {
  editingLog?: DailyLog | null;
  onCancelEdit?: () => void;
  onSave: (log: DailyLog) => void;
}

export function TimeLogForm({ editingLog, onCancelEdit, onSave }: TimeLogFormProps) {
  const today = new Date().toISOString().split('T')[0];
  const currentUser = getCurrentUser();

  const [date, setDate] = useState(today);
  const [timeIn, setTimeIn] = useState('');
  const [timeOut, setTimeOut] = useState('');
  const [lunchStart, setLunchStart] = useState('');
  const [lunchEnd, setLunchEnd] = useState('');
  const [isOvertime, setIsOvertime] = useState(false);
  const [isHoliday, setIsHoliday] = useState(false);
  const [isPresent, setIsPresent] = useState(true);
  const [accomplishment, setAccomplishment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editingLog) {
      setDate(editingLog.date);
      setTimeIn(editingLog.timeIn || '');
      setTimeOut(editingLog.timeOut || '');
      setLunchStart(editingLog.lunchStart || '');
      setLunchEnd(editingLog.lunchEnd || '');
      setIsOvertime(Boolean(editingLog.isOvertime));
      setIsHoliday(Boolean(editingLog.isHoliday));
      setIsPresent(editingLog.isPresent);
      setAccomplishment(editingLog.accomplishment || '');
      return;
    }

    setDate(today);
    setTimeIn('');
    setTimeOut('');
    setLunchStart('');
    setLunchEnd('');
    setIsOvertime(false);
    setIsHoliday(false);
    setAccomplishment('');
    setIsPresent(true);
  }, [editingLog, today]);

  const baseHoursWorked = calculateHoursWorked(timeIn, timeOut, lunchStart, lunchEnd);
  const hoursWorked = isHoliday ? baseHoursWorked * 2 : baseHoursWorked;

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

    if (isPresent && ((lunchStart && !lunchEnd) || (!lunchStart && lunchEnd))) {
      toast.error('Please enter both lunch break start and end time');
      return;
    }

    if (isPresent && lunchStart && lunchEnd && lunchEnd <= lunchStart) {
      toast.error('Lunch break end time must be after lunch break start time');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        user_id: currentUser?.id,
        date,
        is_present: isPresent,
        time_in: isPresent ? timeIn : null,
        time_out: isPresent ? timeOut : null,
        lunch_start: isPresent && lunchStart ? lunchStart : null,
        lunch_end: isPresent && lunchEnd ? lunchEnd : null,
        is_overtime: isPresent ? isOvertime : false,
        overtime_hours: 0,
        is_holiday: isPresent ? isHoliday : false,
        hours_worked: isPresent ? hoursWorked : 0,
        accomplishment: accomplishment || null,
      };

      const query = editingLog
        ? supabase
            .from('time_logs')
            .update(payload)
            .eq('id', editingLog.id)
            .eq('user_id', currentUser?.id)
        : supabase.from('time_logs').insert(payload);

      const { error } = await query;

      if (error) {
        if (!editingLog && error.code === '23505') {
          toast.error('A log for this date already exists');
        } else {
          toast.error(error.message || 'Failed to save log');
        }
        setIsLoading(false);
        return;
      }

      toast.success(editingLog ? 'Time log updated successfully!' : 'Time log saved successfully!');
      onSave({} as DailyLog);

      setDate(today);
      setTimeIn('');
      setTimeOut('');
      setLunchStart('');
      setLunchEnd('');
      setIsOvertime(false);
      setIsHoliday(false);
      setAccomplishment('');
      setIsPresent(true);
      setIsLoading(false);
      onCancelEdit?.();
    } catch (error) {
      console.error('Save log error:', error);
      toast.error('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden border border-white/70 bg-white/85 shadow-[0_18px_60px_-34px_rgba(15,23,42,0.38)] backdrop-blur-xl">
      <CardHeader className="border-b border-slate-200/70 bg-[linear-gradient(135deg,_rgba(15,118,110,0.08),_rgba(14,165,233,0.08))] pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <Clock className="w-5 h-5 text-teal-600" />
          {editingLog ? 'Edit Time Log' : 'Log Daily Time'}
        </CardTitle>
        <CardDescription className="text-sm text-slate-600">
          {editingLog ? 'Update an existing attendance record' : 'Record your daily attendance and hours worked'}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-5 pt-5 sm:px-6">
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
              className="h-12 rounded-2xl border-slate-200 bg-white shadow-sm focus:border-teal-600 focus:ring-teal-600"
            />
          </div>

          <div className="flex items-center space-x-3 rounded-[1.25rem] border border-teal-200 bg-teal-50/80 p-4">
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
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="timeIn" className="text-sm font-medium text-slate-700">Time In *</Label>
                  <Input
                    id="timeIn"
                    type="time"
                    value={timeIn}
                    onChange={(e) => setTimeIn(e.target.value)}
                    required={isPresent}
                    className="h-12 rounded-2xl border-slate-200 bg-white shadow-sm focus:border-teal-600 focus:ring-teal-600"
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
                    className="h-12 rounded-2xl border-slate-200 bg-white shadow-sm focus:border-teal-600 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4">
                <div className="mb-3">
                  <p className="text-sm font-medium text-slate-900">Lunch Break</p>
                  <p className="text-xs text-slate-500">Optional. Enter only if the intern had a lunch break for this schedule.</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="lunchStart" className="text-sm font-medium text-slate-700">Lunch Start</Label>
                    <Input
                      id="lunchStart"
                      type="time"
                      value={lunchStart}
                      onChange={(e) => setLunchStart(e.target.value)}
                      className="h-12 rounded-2xl border-slate-200 bg-white shadow-sm focus:border-teal-600 focus:ring-teal-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lunchEnd" className="text-sm font-medium text-slate-700">Lunch End</Label>
                    <Input
                      id="lunchEnd"
                      type="time"
                      value={lunchEnd}
                      onChange={(e) => setLunchEnd(e.target.value)}
                      className="h-12 rounded-2xl border-slate-200 bg-white shadow-sm focus:border-teal-600 focus:ring-teal-600"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 rounded-[1.25rem] border border-amber-200 bg-amber-50/80 p-4 sm:items-center">
                <Checkbox
                  id="holiday"
                  checked={isHoliday}
                  onCheckedChange={(checked) => setIsHoliday(checked as boolean)}
                  className="h-5 w-5"
                />
                <label
                  htmlFor="holiday"
                  className="flex flex-1 cursor-pointer items-start gap-3 text-sm font-medium leading-none text-slate-900"
                >
                  <BadgeAlert className="mt-0.5 h-4 w-4 text-amber-600" />
                  <span>
                    Mark as Holiday
                    <span className="mt-1 block text-xs font-normal text-slate-600">
                      If checked, this log will count as double hours.
                    </span>
                  </span>
                </label>
              </div>

              <div className="flex items-start space-x-3 rounded-[1.25rem] border border-violet-200 bg-violet-50/80 p-4 sm:items-center">
                <Checkbox
                  id="overtime"
                  checked={isOvertime}
                  onCheckedChange={(checked) => setIsOvertime(checked as boolean)}
                  className="h-5 w-5"
                />
                <label
                  htmlFor="overtime"
                  className="flex flex-1 cursor-pointer items-start gap-3 text-sm font-medium leading-none text-slate-900"
                >
                  <Clock className="mt-0.5 h-4 w-4 text-violet-600" />
                  <span>
                    Mark as Overtime
                    <span className="mt-1 block text-xs font-normal text-slate-600">
                      This tags the log as overtime, but the total hours still come from the actual time range.
                    </span>
                  </span>
                </label>
              </div>

              {timeIn && timeOut && (
                <div className="flex flex-col gap-4 rounded-[1.25rem] bg-gradient-to-r from-emerald-600 to-teal-600 p-4 shadow-lg shadow-emerald-700/20 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-white/75">Calculated total</p>
                    <p className="text-sm font-medium text-white">Hours worked for this entry</p>
                    <p className="mt-1 text-xs text-white/75">
                      {lunchStart && lunchEnd
                        ? `Lunch break from ${lunchStart} to ${lunchEnd} is excluded.`
                        : 'No lunch break deduction is applied unless you enter lunch times.'}
                    </p>
                    {isHoliday && (
                      <p className="mt-1 text-xs text-white/85">
                        Holiday is enabled, so {baseHoursWorked.toFixed(2)} base hours become {hoursWorked.toFixed(2)} credited hours.
                      </p>
                    )}
                    {isOvertime && (
                      <p className="mt-1 text-xs text-white/85">
                        Overtime is saved as a tag only and is not added to total worked hours.
                      </p>
                    )}
                  </div>
                  <p className="text-left text-2xl font-semibold text-white sm:text-right">{hoursWorked.toFixed(2)}h</p>
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
                  className="min-h-28 resize-none rounded-2xl border-slate-200 bg-white shadow-sm focus:border-teal-600 focus:ring-teal-600"
                />
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <NotebookPen className="h-3.5 w-3.5" />
                  Add a short summary so your history stays useful later.
                </div>
              </div>
            </>
          )}

          {!isPresent && (
            <div className="rounded-[1.25rem] border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-orange-900 font-medium">
                This day will be marked as absent. No hours will be recorded.
              </p>
            </div>
          )}

          <div className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50/80 p-3">
            <div className="mb-3 flex items-center gap-2 text-sm text-slate-600">
              <CalendarClock className="h-4 w-4 text-teal-600" />
              Save today&apos;s attendance and optionally deduct the actual lunch break for that schedule.
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-700/20 hover:from-teal-700 hover:to-cyan-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : editingLog ? 'Update Time Log' : 'Save Time Log'}
            </Button>
            {editingLog && onCancelEdit && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancelEdit}
                className="mt-3 w-full h-12 rounded-2xl"
              >
                Cancel Edit
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
