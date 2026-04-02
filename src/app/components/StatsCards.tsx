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
    <div className="space-y-5">
      <Card className="overflow-hidden border border-white/70 bg-white/85 shadow-[0_18px_60px_-34px_rgba(15,23,42,0.4)] backdrop-blur-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <Target className="w-5 h-5 text-teal-600" />
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-slate-700">
              {stats.totalHoursCompleted.toFixed(1)} / {totalRequired} hours
            </span>
            <span className="font-semibold text-teal-600">
              {stats.percentageCompleted.toFixed(1)}%
            </span>
          </div>
          <div className="rounded-full bg-teal-50 p-1">
            <Progress value={stats.percentageCompleted} className="h-3 bg-teal-100" />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Completed</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.totalHoursCompleted.toFixed(1)}h</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Remaining</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.remainingHours.toFixed(1)}h</p>
            </div>
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/90 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-700">Target</p>
              <p className="mt-2 text-2xl font-semibold text-amber-950">{totalRequired}h</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="border border-emerald-200/80 bg-[linear-gradient(180deg,_rgba(236,253,245,0.95),_rgba(220,252,231,0.88))] shadow-[0_18px_50px_-36px_rgba(5,150,105,0.8)]">
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

        <Card className="border border-amber-200/80 bg-[linear-gradient(180deg,_rgba(255,251,235,0.96),_rgba(254,243,199,0.88))] shadow-[0_18px_50px_-36px_rgba(217,119,6,0.7)]">
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

        <Card className="border border-sky-200/80 bg-[linear-gradient(180deg,_rgba(240,249,255,0.96),_rgba(224,242,254,0.88))] shadow-[0_18px_50px_-36px_rgba(2,132,199,0.7)]">
          <CardContent className="pt-4 pb-4">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <p className="text-xs text-sky-700 font-medium">Avg Daily Hours</p>
                <div className="p-1.5 bg-sky-600 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-2xl font-semibold text-sky-950">
                {stats.averageDailyHours.toFixed(1)}
              </p>
              <p className="text-xs text-sky-700">
                {stats.presentDaysCount} days present
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-teal-200/80 bg-[linear-gradient(180deg,_rgba(240,253,250,0.96),_rgba(204,251,241,0.88))] shadow-[0_18px_50px_-36px_rgba(13,148,136,0.72)]">
          <CardContent className="pt-4 pb-4">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <p className="text-xs text-teal-700 font-medium">Days to Finish</p>
                <div className="p-1.5 bg-teal-600 rounded-lg">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-2xl font-semibold text-teal-950">
                {stats.daysNeeded}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-0 bg-[linear-gradient(135deg,_#0f766e_0%,_#0f5c8d_58%,_#172554_100%)] shadow-[0_24px_60px_-30px_rgba(15,23,42,0.75)]">
        <CardContent className="pt-5 pb-5">
          <div className="text-center">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.22em] text-white/70">Estimated Completion Date</p>
            <p className="text-xl font-semibold text-white leading-tight">
              {stats.estimatedEndDate}
            </p>
            {stats.percentageCompleted >= 100 && (
              <p className="mt-3 inline-block rounded-full bg-white/20 px-4 py-1.5 text-xs font-medium text-white">
                Congratulations! You&apos;ve completed your internship.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
