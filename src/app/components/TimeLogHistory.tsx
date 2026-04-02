import {
  DialogClose,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from './ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { DailyLog } from '../types';
import { Calendar, Clock, FileText, Trash2, Eye, Pencil } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';

interface TimeLogHistoryProps {
  logs: DailyLog[];
  onDelete: (id: string) => void;
  onEdit: (log: DailyLog) => void;
}

export function TimeLogHistory({ logs, onDelete, onEdit }: TimeLogHistoryProps) {
  const sortedLogs = [...logs].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (time?: string) => {
    if (!time) return '--:--';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <Card className="overflow-hidden border border-white/70 bg-white/85 shadow-[0_18px_60px_-34px_rgba(15,23,42,0.38)] backdrop-blur-xl">
      <CardHeader className="border-b border-slate-200/70 bg-[linear-gradient(135deg,_rgba(15,118,110,0.06),_rgba(245,158,11,0.08))] pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <FileText className="w-5 h-5 text-teal-600" />
          Time Log History
        </CardTitle>
        <CardDescription className="text-sm text-slate-600">
          View, edit, and manage your daily time entries
        </CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <Calendar className="mx-auto mb-3 h-12 w-12 opacity-50" />
            <p className="text-sm">No time logs yet. Start by logging your daily time.</p>
          </div>
        ) : (
          <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
            {sortedLogs.map((log) => (
              <div
                key={log.id}
                className="rounded-[1.25rem] border border-slate-200/80 bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(248,250,252,0.9))] p-4 transition-all hover:border-teal-200 hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex flex-1 items-center gap-2">
                    <Calendar className="h-4 w-4 flex-shrink-0 text-teal-600" />
                    <span className="text-sm font-medium text-slate-900">{formatDate(log.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {log.isPresent ? (
                      <Badge variant="default" className="bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-medium">
                        Present
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-slate-200 text-slate-700 text-xs font-medium">
                        Absent
                      </Badge>
                    )}
                    {log.isHoliday && (
                      <Badge className="bg-amber-500 text-white hover:bg-amber-600 text-xs font-medium">
                        Holiday
                      </Badge>
                    )}
                    {log.isOvertime && (
                      <Badge className="bg-violet-500 text-white hover:bg-violet-600 text-xs font-medium">
                        Overtime
                      </Badge>
                    )}

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0 hover:bg-teal-50">
                          <Eye className="h-4 w-4 text-teal-600" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-teal-600" />
                            Time Log Details
                          </DialogTitle>
                          <DialogDescription>
                            Full details of this time log entry
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <div className="mb-3 flex items-center justify-between">
                              <span className="text-sm font-medium text-slate-600">Date</span>
                              <span className="text-sm font-semibold text-slate-900">{formatDate(log.date)}</span>
                            </div>
                            <div className="mb-3 flex items-center justify-between">
                              <span className="text-sm font-medium text-slate-600">Status</span>
                              {log.isPresent ? (
                                <Badge className="bg-emerald-600">Present</Badge>
                              ) : (
                                <Badge variant="secondary">Absent</Badge>
                              )}
                            </div>
                            {log.isPresent && (
                              <>
                                <div className="mb-3 flex items-center justify-between">
                                  <span className="text-sm font-medium text-slate-600">Time In</span>
                                  <span className="text-sm font-semibold text-slate-900">{formatTime(log.timeIn)}</span>
                                </div>
                                <div className="mb-3 flex items-center justify-between">
                                  <span className="text-sm font-medium text-slate-600">Time Out</span>
                                  <span className="text-sm font-semibold text-slate-900">{formatTime(log.timeOut)}</span>
                                </div>
                                {log.lunchStart && log.lunchEnd && (
                                  <div className="mb-3 flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-600">Lunch Break</span>
                                    <span className="text-sm font-semibold text-slate-900">
                                      {formatTime(log.lunchStart)} - {formatTime(log.lunchEnd)}
                                    </span>
                                  </div>
                                )}
                                {log.isOvertime && (
                                  <div className="mb-3 flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-600">Overtime</span>
                                    <span className="text-sm font-semibold text-violet-700">
                                      {Number(log.overtimeHours ?? 0).toFixed(2)} hrs
                                    </span>
                                  </div>
                                )}
                                {log.isHoliday && (
                                  <div className="mb-3 flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-600">Holiday Rate</span>
                                    <span className="text-sm font-semibold text-amber-700">Double hours applied</span>
                                  </div>
                                )}
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-slate-600">Hours Worked</span>
                                  <span className="text-sm font-bold text-emerald-700">{log.hoursWorked.toFixed(2)} hrs</span>
                                </div>
                              </>
                            )}
                          </div>
                          {log.accomplishment && (
                            <div>
                              <h4 className="mb-2 text-sm font-semibold text-slate-900">Daily Accomplishment</h4>
                              <div className="rounded-xl border border-teal-200 bg-teal-50 p-4">
                                <p className="text-sm leading-relaxed text-slate-700">{log.accomplishment}</p>
                              </div>
                            </div>
                          )}
                          {log.photoUrl && (
                            <div>
                              <h4 className="mb-2 text-sm font-semibold text-slate-900">Attached Photo</h4>
                              <img src={log.photoUrl} alt="Log attachment" className="w-full rounded-lg border border-slate-200" />
                            </div>
                          )}
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 flex-shrink-0 hover:bg-blue-50"
                      onClick={() => onEdit(log)}
                      title="Edit time log"
                    >
                      <Pencil className="h-4 w-4 text-blue-600" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0 hover:bg-red-50">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="max-w-md">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Time Log</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this time log? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(log.id)} className="bg-red-600 hover:bg-red-700">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                {log.isPresent ? (
                  <>
                    <div className="mb-2 flex flex-wrap items-center gap-3 text-sm text-slate-700">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span>In: {formatTime(log.timeIn)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span>Out: {formatTime(log.timeOut)}</span>
                      </div>
                      {log.lunchStart && log.lunchEnd && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-amber-600" />
                          <span>Lunch: {formatTime(log.lunchStart)} - {formatTime(log.lunchEnd)}</span>
                        </div>
                      )}
                      {log.isOvertime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-violet-600" />
                          <span>OT: {Number(log.overtimeHours ?? 0).toFixed(2)} hrs</span>
                        </div>
                      )}
                      {log.isHoliday && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-amber-600" />
                          <span>Holiday double hours</span>
                        </div>
                      )}
                      <div className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                        {log.hoursWorked.toFixed(2)} hrs
                      </div>
                    </div>

                    {log.accomplishment && (
                      <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50/80 p-3">
                        <p className="text-sm leading-relaxed text-slate-700">{log.accomplishment}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm italic text-slate-500">
                    No time recorded (marked absent)
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
