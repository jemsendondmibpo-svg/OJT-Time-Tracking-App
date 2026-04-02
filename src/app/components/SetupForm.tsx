import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { OJTSetup } from '../types';
import { getCurrentUser } from '../auth-utils';
import { supabase } from '../supabase-client';
import { ClipboardList, ArrowRight, CalendarDays, TimerReset } from 'lucide-react';
import { useToast } from './ui/use-toast';

const DAYS_OF_WEEK = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 0, label: 'Sunday' },
];

export function SetupForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUser] = useState(() => getCurrentUser());
  const [totalRequiredHours, setTotalRequiredHours] = useState('');
  const [previousHours, setPreviousHours] = useState('');
  const [workingDays, setWorkingDays] = useState<number[]>([1, 2, 3, 4, 5]); // Default: Mon-Fri
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSetup, setIsCheckingSetup] = useState(true);
  const hasCheckedSetup = useRef(false);

  // Check if setup already exists - run once
  useEffect(() => {
    if (hasCheckedSetup.current) return;
    hasCheckedSetup.current = true;

    if (!currentUser) {
      navigate('/login', { replace: true });
      return;
    }

    checkExistingSetup();
  }, []);

  const checkExistingSetup = async () => {
    try {
      const { data, error } = await supabase
        .from('ojt_setup')
        .select('*')
        .eq('user_id', currentUser?.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error checking setup:', error);
        setIsCheckingSetup(false);
        return;
      }

      if (data) {
        navigate('/dashboard', { replace: true });
      } else {
        setIsCheckingSetup(false);
      }
    } catch (error) {
      console.error('Error checking setup:', error);
      setIsCheckingSetup(false);
    }
  };

  if (!currentUser || isCheckingSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleWorkingDayToggle = (day: number) => {
    setWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('ojt_setup')
        .insert({
          user_id: currentUser?.id,
          total_required_hours: Number(totalRequiredHours),
          previous_hours: Number(previousHours) || 0,
          working_days: workingDays,
          start_date: new Date().toISOString(),
        });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Setup Failed',
          description: error.message || 'Could not save setup',
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: 'Setup Complete!',
        description: 'Your OJT tracker is ready to use',
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Setup error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred',
      });
      setIsLoading(false);
    }
  };

  const isValid = 
    totalRequiredHours && 
    Number(totalRequiredHours) > 0 && 
    workingDays.length > 0;

  return (
    <div className="min-h-screen flex items-start justify-center p-4 pt-8 bg-transparent md:p-8 md:pt-10">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[1.5rem] mb-4 shadow-lg shadow-teal-700/20 bg-gradient-to-br from-teal-600 to-cyan-600">
            <ClipboardList className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-2">OJT Setup</h1>
          <p className="text-slate-600">Configure your internship tracking preferences with a guided, cleaner layout.</p>
        </div>

        {/* Setup Card */}
        <Card className="overflow-hidden border border-white/70 bg-white/85 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.45)] backdrop-blur-xl">
          <div className="grid gap-0 md:grid-cols-[1.1fr,0.9fr]">
            <div className="border-b border-slate-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-teal-900 p-6 text-white md:border-b-0 md:border-r">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
                <CalendarDays className="h-3.5 w-3.5" />
                One-time configuration
              </div>
              <h2 className="mt-4 text-2xl font-semibold leading-tight">Build your tracking baseline before the first log entry.</h2>
              <p className="mt-3 text-sm leading-6 text-white/75">
                Set your target hours, add any previously completed time, and choose the days you usually report onsite.
              </p>

              <div className="mt-6 space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/60">Why this matters</p>
                  <p className="mt-2 text-sm text-white/85">Your dashboard estimates completion dates and remaining hours from this setup.</p>
                </div>
                <div className="rounded-2xl border border-teal-300/20 bg-teal-300/10 p-4">
                  <div className="flex items-center gap-3">
                    <TimerReset className="h-9 w-9 rounded-xl bg-white/15 p-2 text-white" />
                    <div>
                      <p className="text-sm font-semibold">Need to adjust later?</p>
                      <p className="text-xs text-white/75">You can reset the setup from the dashboard menu.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-slate-900">Initial Configuration</CardTitle>
                <CardDescription className="text-slate-600">
                  Set up your internship details to start tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="totalHours" className="text-sm font-medium text-slate-700">
                  Total Required Hours *
                </Label>
                <Input
                  id="totalHours"
                  type="number"
                  placeholder="e.g., 486"
                  value={totalRequiredHours}
                  onChange={(e) => setTotalRequiredHours(e.target.value)}
                  min="1"
                  required
                  className="h-12 rounded-2xl border-slate-200 bg-white shadow-sm focus:border-teal-600 focus:ring-teal-600"
                />
                <p className="text-xs text-slate-500">
                  Enter the total internship hours required by your program
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="previousHours" className="text-sm font-medium text-slate-700">
                  Previously Completed Hours
                </Label>
                <Input
                  id="previousHours"
                  type="number"
                  placeholder="e.g., 0"
                  value={previousHours}
                  onChange={(e) => setPreviousHours(e.target.value)}
                  min="0"
                  className="h-12 rounded-2xl border-slate-200 bg-white shadow-sm focus:border-teal-600 focus:ring-teal-600"
                />
                <p className="text-xs text-slate-500">
                  If you've already completed hours, enter them here
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700">
                  Working Days *
                </Label>
                <div className="grid gap-2 rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4 sm:grid-cols-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <div key={day.value} className="flex items-center space-x-3 rounded-xl border border-transparent bg-white/80 px-3 py-3 shadow-sm">
                      <Checkbox
                        id={`day-${day.value}`}
                        checked={workingDays.includes(day.value)}
                        onCheckedChange={() => handleWorkingDayToggle(day.value)}
                        className="h-5 w-5"
                      />
                      <label
                        htmlFor={`day-${day.value}`}
                        className="text-sm font-medium cursor-pointer flex-1 text-slate-900"
                      >
                        {day.label}
                      </label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500">
                  Select the days you typically work during your internship
                </p>
              </div>

              <Button
                type="submit"
                disabled={!isValid || isLoading}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-700/20 hover:from-teal-700 hover:to-cyan-700 disabled:opacity-50"
              >
                <span className="flex items-center gap-2">
                  {isLoading ? 'Saving Setup...' : 'Continue to Dashboard'}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Button>
                </form>
              </CardContent>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
