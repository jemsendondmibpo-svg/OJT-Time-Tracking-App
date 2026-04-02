import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Clock, Target, Calendar, TrendingUp, CheckCircle2 } from 'lucide-react';
import { CalculatedStats } from '../types';

interface StatsCardsProps {
  stats: CalculatedStats;
  totalRequired: number;
}

export function StatsCards({ stats, totalRequired }: StatsCardsProps) {
  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <Target className="w-5 h-5 text-indigo-600" />
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-slate-700">
              {stats.totalHoursCompleted.toFixed(1)} / {totalRequired} hours
            </span>
            <span className="font-semibold text-indigo-600">
              {stats.percentageCompleted.toFixed(1)}%
            </span>
          </div>
          <Progress value={stats.percentageCompleted} className="h-2.5 bg-indigo-100" />
          <p className="text-xs text-slate-500">
            {stats.remainingHours.toFixed(1)} hours remaining
          </p>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="shadow-sm border border-emerald-200 bg-emerald-50">
          <CardContent className="pt-4 pb-4">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <p className="text-xs text-emerald-700 font-medium">Hours Completed</p>
                <div className="p-1.5 bg-emerald-600 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-2xl font-semibold text-emerald-900">
                {stats.totalHoursCompleted.toFixed(1)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-amber-200 bg-amber-50">
          <CardContent className="pt-4 pb-4">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <p className="text-xs text-amber-700 font-medium">Remaining Hours</p>
                <div className="p-1.5 bg-amber-600 rounded-lg">
                  <Clock className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-2xl font-semibold text-amber-900">
                {stats.remainingHours.toFixed(1)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-blue-200 bg-blue-50">
          <CardContent className="pt-4 pb-4">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <p className="text-xs text-blue-700 font-medium">Avg Daily Hours</p>
                <div className="p-1.5 bg-blue-600 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-2xl font-semibold text-blue-900">
                {stats.averageDailyHours.toFixed(1)}
              </p>
              <p className="text-xs text-blue-700">
                {stats.presentDaysCount} days present
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-purple-200 bg-purple-50">
          <CardContent className="pt-4 pb-4">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <p className="text-xs text-purple-700 font-medium">Days to Finish</p>
                <div className="p-1.5 bg-purple-600 rounded-lg">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-2xl font-semibold text-purple-900">
                {stats.daysNeeded}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estimated End Date */}
      <Card className="bg-indigo-600 border-0 shadow-lg">
        <CardContent className="pt-5 pb-5">
          <div className="text-center">
            <p className="text-xs text-indigo-100 mb-2 font-medium">Estimated Completion Date</p>
            <p className="text-xl font-semibold text-white leading-tight">
              {stats.estimatedEndDate}
            </p>
            {stats.percentageCompleted >= 100 && (
              <p className="text-xs text-white mt-3 font-medium bg-white/20 rounded-full py-1.5 px-4 inline-block">
                🎉 Congratulations! You've completed your internship!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}