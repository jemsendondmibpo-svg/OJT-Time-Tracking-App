import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { setCurrentUser } from '../auth-utils';
import { supabase } from '../supabase-client';
import { GraduationCap, Mail, Lock, LogIn, Eye, EyeOff, Sparkles, TrendingUp, Clock, ShieldCheck } from 'lucide-react';
import { useToast } from './ui/use-toast';

export function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Use Supabase client-side auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.session) {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: error?.message || 'Invalid email or password',
        });
        setIsLoading(false);
        return;
      }

      // Wait a moment for session to be fully established
      await new Promise(resolve => setTimeout(resolve, 100));

      // Get user profile from database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError) {
        console.error('Error fetching user profile:', userError);
      }

      // Save user and token
      const user = {
        id: data.user.id,
        email: data.user.email || email,
        fullName: userData?.full_name || data.user.user_metadata?.full_name || 'User',
      };

      setCurrentUser(user, data.session.access_token);

      toast({
        title: 'Welcome back!',
        description: `Logged in as ${user.email}`,
      });

      // Small delay before navigation to ensure state is saved
      await new Promise(resolve => setTimeout(resolve, 100));
      navigate('/setup');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-transparent">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-[1.25rem] mb-4 shadow-lg shadow-teal-700/20 bg-gradient-to-br from-teal-600 to-cyan-600">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-white/80 px-3 py-1 text-xs font-medium text-teal-700 shadow-sm backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Built for internship tracking
            </div>
            <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-2">Welcome Back</h1>
            <p className="text-base text-slate-600">Sign in to continue your OJT progress with a clearer, faster dashboard.</p>
          </div>

          {/* Login Card */}
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
            <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.45)] backdrop-blur-xl md:p-8">
              <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Daily tracking hub</p>
                  <p className="text-xs text-slate-500">Hours, logs, and milestones in one place</p>
                </div>
                <ShieldCheck className="h-9 w-9 rounded-xl bg-emerald-100 p-2 text-emerald-700" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email Address
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors group-focus-within:text-teal-600" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 rounded-2xl border-slate-200/90 bg-white/90 shadow-sm focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors group-focus-within:text-teal-600" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-11 h-12 rounded-2xl border-slate-200/90 bg-white/90 shadow-sm focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-700/25 transition-all duration-200 hover:from-teal-700 hover:to-cyan-700 hover:shadow-xl hover:shadow-teal-700/35 font-medium text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </span>
                )}
              </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-slate-600">
                  Don't have an account?{' '}
                  <Link 
                    to="/signup" 
                    className="font-semibold text-teal-700 hover:text-teal-800 hover:underline transition-colors"
                  >
                    Create one
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_28%),linear-gradient(145deg,_#0f766e_0%,_#0f5c8d_54%,_#162f43_100%)] p-12 items-center justify-center relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-amber-300/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute inset-x-12 bottom-12 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        
        <div className="relative z-10 max-w-lg text-white">
          <div className="mb-8 animate-in fade-in slide-in-from-right-6 duration-700">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Track Your Progress</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Internship Progress
            </h2>
            <p className="text-lg text-teal-50/90 mb-8">
              Monitor hours, record accomplishments, and keep your completion timeline visible at a glance.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-700 delay-300">
            <div className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-emerald-500 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Real-time Analytics</h3>
                  <p className="text-sm text-teal-50/80">See completed hours, remaining targets, and daily pace with less clutter.</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-amber-500 rounded-lg">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Smart Time Tracking</h3>
                  <p className="text-sm text-teal-50/80">Capture attendance quickly and keep your internship history organized.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
