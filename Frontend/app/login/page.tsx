'use client';

import React, { useState, useEffect } from "react"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Terminal, Sparkles, ArrowRight, User, Lock, Mail, Bot, Zap, Trophy, Loader2, Check, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import { SupabaseClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

function AdvancedLoader() {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Faster sequence (2s total)
    const messages = [
      { text: "Initializing handshake...", delay: 50 },
      { text: "Verifying credentials...", delay: 150 },
      { text: "Decrypting session token...", delay: 300 },
      { text: "Handshaking with server...", delay: 450 },
      { text: "Establishing secure tunnel...", delay: 600 },
      { text: "Access Granted.", delay: 750 },
    ];

    let timeouts: NodeJS.Timeout[] = [];

    // Faster progress bar
    const progressInterval = setInterval(() => {
      setProgress(p => (p >= 100 ? 100 : p + 5));
    }, 20);

    messages.forEach(({ text, delay }, index) => {
      const t = setTimeout(() => {
        setLogs(prev => [...prev.slice(-4), `> ${text}`]);
      }, delay);
      timeouts.push(t);
    });

    return () => {
      timeouts.forEach(clearTimeout);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/90 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-8 font-mono border-l border-white/10"
    >
      {/* Holographic Spinner */}
      <div className="relative mb-8">
        <motion.div
          className="w-24 h-24 rounded-full border-b-2 border-l-2 border-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-2 rounded-full border-t-2 border-r-2 border-blue-500"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Bot className="w-8 h-8 text-white animate-pulse" />
        </div>
      </div>

      {/* Status Text */}
      <div className="w-full max-w-xs space-y-4">
        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="min-h-[100px] text-xs text-green-400 font-mono space-y-1">
          {logs.map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {log}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function AuthCompanion({ state }: { state: 'idle' | 'typing' | 'success' | 'error' }) {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute -top-16 right-0 md:-right-4 md:top-0 bg-black/80 backdrop-blur border border-primary/30 p-3 rounded-xl shadow-[0_0_20px_rgba(var(--primary),0.2)] flex items-center gap-3 z-20"
    >
      <div className="relative">
        <motion.div
          animate={state === 'typing' ? { rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] } : {}}
          transition={{ repeat: Infinity, duration: 0.5 }}
        >
          {state === 'idle' && <Bot className="w-8 h-8 text-gray-400" />}
          {state === 'typing' && <Bot className="w-8 h-8 text-blue-400" />}
          {state === 'success' && <Bot className="w-8 h-8 text-green-400" />}
          {state === 'error' && <Bot className="w-8 h-8 text-red-500" />}
        </motion.div>
        {state === 'typing' && (
          <motion.div
            className="absolute -top-1 -right-1"
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity }}
          >
            <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          </motion.div>
        )}
      </div>
      <div className="text-xs font-mono">
        {state === 'idle' && <span className="text-gray-400">System Standing By...</span>}
        {state === 'typing' && <span className="text-blue-400">Processing Input...</span>}
        {state === 'success' && <span className="text-green-400">Access Granted!</span>}
        {state === 'error' && <span className="text-red-500">Access Denied!</span>}
      </div>
    </motion.div>
  );
}

function XPBar({ progress }: { progress: number }) {
  return (
    <div className="w-full h-1.5 bg-gray-800 rounded-full mt-2 overflow-hidden relative">
      <motion.div
        className="h-full bg-gradient-to-r from-blue-500 via-primary to-purple-500"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ type: "spring", stiffness: 50, damping: 10 }}
      />
      <motion.div
        className="absolute top-0 bottom-0 w-4 bg-white/50 blur-sm"
        animate={{ left: ['-10%', '110%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 1 }}
      />
    </div>
  );
}

function CodePreview() {
  return (
    <div className="h-full bg-[#1e1e1e] p-6 font-mono text-xs leading-relaxed text-gray-400 overflow-hidden relative select-none hidden md:block rounded-l-xl border-r border-white/5">
      <div className="absolute top-0 left-0 right-0 h-8 bg-[#252526] flex items-center px-4 space-x-2 border-b border-[#333]">
        <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
        <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
        <span className="ml-4 text-gray-500">adventure.ts</span>
      </div>
      <div className="mt-8 space-y-1 opacity-80">
        <div><span className="text-[#569cd6]">import</span> {'{'} <span className="text-[#4ec9b0]">Hero</span> {'}'} <span className="text-[#569cd6]">from</span> <span className="text-[#ce9178]">'./universe'</span>;</div>
        <div>&nbsp;</div>
        <div><span className="text-[#6a9955]">// Begin your journey</span></div>
        <div><span className="text-[#569cd6]">const</span> <span className="text-[#4fc1ff]">user</span> = <span className="text-[#569cd6]">new</span> <span className="text-[#4ec9b0]">Developer</span>();</div>
        <div>&nbsp;</div>
        <div><span className="text-[#c586c0]">async function</span> <span className="text-[#dcdcaa]">startBattle</span>() {'{'}</div>
        <div>&nbsp;&nbsp;<span className="text-[#c586c0]">await</span> <span className="text-[#4fc1ff]">user</span>.<span className="text-[#dcdcaa]">login</span>();</div>
        <div>&nbsp;&nbsp;<span className="text-[#4fc1ff]">console</span>.<span className="text-[#dcdcaa]">log</span>(<span className="text-[#ce9178]">'Ready to code!'</span>);</div>
        <div>{'}'}</div>
      </div>

      {/* Animated Typing Cursor Effect */}
      <motion.div
        className="absolute bottom-10 right-10 p-4 bg-[#252526] rounded-lg border border-[#333] shadow-xl max-w-[200px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-white font-bold">System Online</span>
        </div>
        <p className="text-[10px] text-gray-400">Environment configured. Waiting for pilot authentication...</p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState<'student' | 'teacher' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [botState, setBotState] = useState<'idle' | 'typing' | 'success' | 'error'>('idle');

  const router = useRouter();
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  // Gamification: Calculate progress
  const progress = (
    (userRole ? 33 : 0) +
    (email.length > 5 ? 33 : 0) +
    (password.length > 5 ? 34 : 0)
  );

  useEffect(() => {
    try {
      const client = createClient();
      setSupabase(client);
    } catch (error) {
      console.error('Supabase not configured:', error);
      setError('System Error: Auth env vars missing. Restart server?');
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (error) setBotState('error');
    else if (focusedField) setBotState('typing');
    else setBotState('idle');
  }, [focusedField, error, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setBotState('typing'); // Force typing state during load
    setError('');

    if (!supabase) {
      setError('System Error: Auth module not initialized.');
      setIsLoading(false);
      return;
    }

    try {
      // Snappy feel - wait only long enough to show the transition
      const minDelay = new Promise(resolve => setTimeout(resolve, 400));
      const authPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });

      const [authResult] = await Promise.all([authPromise, minDelay]);
      const { data, error } = authResult;

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password.');
        } else {
          setError(error.message);
        }
        setBotState('error');
        setIsLoading(false); // Manually stop loader to show error
      } else if (data.user) {
        setBotState('success');

        // Fetch User Profile
        let { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        // Auto-create profile if missing (Fallback)
        if (!profile && (profileError?.code === 'PGRST116' || !profileError)) {
          const emailPrefix = data.user.email?.split('@')[0] || 'User';
          const properName = data.user.user_metadata?.full_name ||
            data.user.user_metadata?.name ||
            (emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1));

          const newProfile = {
            id: data.user.id,
            email: data.user.email || '',
            username: data.user.user_metadata?.username || emailPrefix,
            full_name: properName,
            role: userRole ? userRole.toUpperCase() : 'STUDENT',
            xp: 0,
            level: 1,
            total_battles: 0,
            total_wins: 0,
          };

          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert([newProfile])
            .select()
            .single();

          if (createError) {
            setError('Profile generation failed.');
            setIsLoading(false);
            return;
          }
          profile = createdProfile;
        }

        // Brief 500ms delay to register success before redirect
        setTimeout(() => {
          if (profile?.role === 'TEACHER') {
            router.push('/teacher-dashboard');
          } else {
            router.push('/dashboard');
          }
        }, 500);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred.');
      setBotState('error');
      setIsLoading(false);
    }
  };

  if (!userRole) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4 relative overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] animate-pulse" />

        <div className="w-full max-w-4xl bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col md:flex-row h-[70vh] min-h-[600px]">
          {/* Left Side: Visual */}
          <div className="w-full md:w-1/2 p-10 bg-gradient-to-br from-gray-900 to-black relative flex flex-col justify-between overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900 via-black to-black" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 mb-8">
                <Code className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-4 leading-tight">Master<br />Algorithms.</h1>
              <p className="text-gray-400 text-lg">Choose your path and start your journey to coding mastery.</p>
            </div>

            <div className="relative z-10 grid gap-4">
              <motion.button
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setUserRole('student')}
                className="group flex items-center p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/50 transition-all cursor-pointer text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="font-bold text-white group-hover:text-blue-400 transition-colors">Student</div>
                  <div className="text-xs text-gray-500">I want to learn and compete</div>
                </div>
                <ArrowRight className="ml-auto w-5 h-5 text-gray-600 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setUserRole('teacher')}
                className="group flex items-center p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-purple-500/50 transition-all cursor-pointer text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                  <Terminal className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="font-bold text-white group-hover:text-purple-400 transition-colors">Teacher</div>
                  <div className="text-xs text-gray-500">I want to manage classes</div>
                </div>
                <ArrowRight className="ml-auto w-5 h-5 text-gray-600 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100" />
              </motion.button>
            </div>
          </div>

          {/* Right Side: Simple animation */}
          <div className="w-full md:w-1/2 p-8 bg-[#0a0a0a] flex items-center justify-center relative">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[80px]" />
            </div>
            <div className="relative text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="inline-flex mb-6 rounded-full border border-white/10 bg-white/5 p-4"
              >
                <Sparkles className="w-8 h-8 text-primary" />
              </motion.div>
              <h3 className="text-xl font-medium text-gray-300">Welcome to LetsPrep</h3>
              <p className="text-sm text-gray-500 mt-2">Select a role to get started</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4 relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-5xl bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-visible z-10 flex flex-col md:flex-row h-auto md:h-[600px]">

        {/* Left Side: Code Visual (Interactive Vibe) */}
        <div className="w-full md:w-5/12 hidden md:block border-r border-white/5">
          <CodePreview />
        </div>

        {/* Right Side: Form (Simplified) */}
        <div className="w-full md:w-7/12 p-8 md:p-12 bg-[#0a0a0a]/50 flex flex-col justify-center relative">
          <AnimatePresence>
            {isLoading && <AdvancedLoader />}
          </AnimatePresence>

          <AuthCompanion state={botState} />

          <div className="absolute top-6 left-6 md:left-auto md:right-6">
            <button
              onClick={() => setUserRole(null)}
              className="text-xs text-gray-500 hover:text-white transition-colors flex items-center"
            >
              <ArrowRight className="w-3 h-3 mr-1 rotate-180" /> Change Role
            </button>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-end mb-2">
              <div>
                <h2 className="text-2xl font-bold">Welcome Back</h2>
                <p className="text-gray-400 text-sm">Sign in to your <span className="text-primary font-medium">{userRole}</span> account</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-primary font-mono flex items-center gap-1">
                  <Trophy className="w-3 h-3" />
                  SYNC: {progress}%
                </div>
              </div>
            </div>
            <XPBar progress={progress} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div
              className="space-y-2"
              animate={focusedField === 'email' ? { x: 5 } : { x: 0 }}
            >
              <Label htmlFor="email" className={focusedField === 'email' ? 'text-primary' : ''}>Email</Label>
              <div className="relative group">
                <Mail className={`absolute left-3 top-3 h-4 w-4 transition-colors ${focusedField === 'email' ? 'text-primary' : 'text-gray-500'}`} />
                <Input
                  id="email"
                  type="email"
                  placeholder="hello@example.com"
                  className="bg-white/5 border-white/10 pl-10 focus:border-primary/50 transition-all h-10 focus:bg-white/10 focus:shadow-[0_0_15px_rgba(var(--primary),0.2)]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                />
              </div>
            </motion.div>

            <motion.div
              className="space-y-2"
              animate={focusedField === 'password' ? { x: 5 } : { x: 0 }}
            >
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className={focusedField === 'password' ? 'text-primary' : ''}>Password</Label>
                <Link href="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className={`absolute left-3 top-3 h-4 w-4 transition-colors ${focusedField === 'password' ? 'text-primary' : 'text-gray-500'}`} />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="bg-white/5 border-white/10 pl-10 focus:border-primary/50 transition-all h-10 focus:bg-white/10 focus:shadow-[0_0_15px_rgba(var(--primary),0.2)]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                />
              </div>
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, scale: 0.9 }}
                  animate={{ opacity: 1, height: 'auto', scale: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-xs flex items-center gap-2"
                >
                  <Bot className="w-4 h-4" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium h-10 relative overflow-hidden group"
                disabled={isLoading}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center justify-center gap-2">
                  {isLoading ? 'Authenticating...' : 'Initialize Session'}
                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                </span>
              </Button>
            </motion.div>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-gray-500">
              Don't have an account?{' '}
              <Link href="/signup" className="text-white hover:text-primary transition-colors font-medium">Create Free Account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}