import {
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
import { useState } from 'react';

interface TimeLogHistoryProps {
  logs: DailyLog[];
  onDelete: (id: string) => void;
  onEdit?: (log: DailyLog) => void;
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

  const formatTime = (time: string) => {
    if (!time) return '--:--';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const [selectedLog, setSelectedLog] = useState<DailyLog | null>(null);

  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <FileText className="w-5 h-5 text-indigo-600" />
          Time Log History
        </CardTitle>
        <CardDescription className="text-sm text-slate-600">
          View and manage your daily time entries
        </CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No time logs yet. Start by logging your daily time!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {sortedLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 border border-slate-200 rounded-lg bg-white hover:border-indigo-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <Calendar className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span className="font-medium text-sm text-slate-900">{formatDate(log.date)}</span>
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
                    
                    {/* View Dialog */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0 hover:bg-indigo-50">
                          <Eye className="w-4 h-4 text-indigo-600" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-indigo-600" />
                            Time Log Details
                          </DialogTitle>
                          <DialogDescription>
                            Full details of this time log entry
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-slate-600">Date</span>
                              <span className="text-sm font-semibold text-slate-900">{formatDate(log.date)}</span>
                            </div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-slate-600">Status</span>
                              {log.isPresent ? (
                                <Badge className="bg-emerald-600">Present</Badge>
                              ) : (
                                <Badge variant="secondary">Absent</Badge>
                              )}
                            </div>
                            {log.isPresent && (
                              <>
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-sm font-medium text-slate-600">Time In</span>
                                  <span className="text-sm font-semibold text-slate-900">{formatTime(log.timeIn)}</span>
                                </div>
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-sm font-medium text-slate-600">Time Out</span>
                                  <span className="text-sm font-semibold text-slate-900">{formatTime(log.timeOut)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-slate-600">Hours Worked</span>
                                  <span className="text-sm font-bold text-emerald-700">{log.hoursWorked.toFixed(2)} hrs</span>
                                </div>
                              </>
                            )}
                          </div>
                          {log.accomplishment && (
                            <div>
                              <h4 className="text-sm font-semibold text-slate-900 mb-2">Daily Accomplishment</h4>
                              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <p className="text-sm text-slate-700 leading-relaxed">{log.accomplishment}</p>
                              </div>
                            </div>
                          )}
                          {log.photoUrl && (
                            <div>
                              <h4 className="text-sm font-semibold text-slate-900 mb-2">Attached Photo</h4>
                              <img src={log.photoUrl} alt="Log attachment" className="w-full rounded-lg border border-slate-200" />
                            </div>
                          )}
                        </div>
                        <DialogFooter>
                          <Button variant="outline">Close</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* Edit Button - Note: Edit functionality to be implemented */}
                    {onEdit && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 flex-shrink-0 hover:bg-blue-50"
                        onClick={() => onEdit(log)}
                      >
                        <Pencil className="w-4 h-4 text-blue-600" />
                      </Button>
                    )}

                    {/* Delete Dialog */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0 hover:bg-red-50">
                          <Trash2 className="w-4 h-4 text-red-600" />
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

                {log.isPresent && (
                  <>
                    <div className="flex items-center gap-3 text-sm text-slate-700 mb-2 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span>In: {formatTime(log.timeIn)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span>Out: {formatTime(log.timeOut)}</span>
                      </div>
                      <div className="font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-xs">
                        {log.hoursWorked.toFixed(2)} hrs
                      </div>
                    </div>

                    {log.accomplishment && (
                      <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-sm text-slate-700 leading-relaxed">{log.accomplishment}</p>
                      </div>
                    )}
                  </>
                )}

                {!log.isPresent && (
                  <p className="text-sm text-slate-500 italic">
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