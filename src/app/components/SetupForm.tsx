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
import { ClipboardList, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen flex items-start justify-center p-4 pt-8 bg-slate-50">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <ClipboardList className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-semibold text-slate-900 mb-2">OJT Setup</h1>
          <p className="text-slate-600">Configure your internship tracking preferences</p>
        </div>

        {/* Setup Card */}
        <Card className="border border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">Initial Configuration</CardTitle>
            <CardDescription className="text-slate-600">
              Set up your internship details to start tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                  className="h-11 border-slate-300 focus:border-blue-600 focus:ring-blue-600"
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
                  className="h-11 border-slate-300 focus:border-blue-600 focus:ring-blue-600"
                />
                <p className="text-xs text-slate-500">
                  If you've already completed hours, enter them here
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700">
                  Working Days *
                </Label>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <div key={day.value} className="flex items-center space-x-3">
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
                disabled={!isValid}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50"
              >
                <span className="flex items-center gap-2">
                  Continue to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}