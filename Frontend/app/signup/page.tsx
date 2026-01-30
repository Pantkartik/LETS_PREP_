'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Terminal, Sparkles, Folder, FileCode, CheckCircle, User, Mail, Lock, Shield, Zap, Sword, Brain, Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';

function AdvancedLoader() {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Faster sequence (2s)
    const messages = [
      { text: "Initializing new character...", delay: 100 },
      { text: "Allocating server spaces...", delay: 400 },
      { text: "Hashing secure password...", delay: 800 },
      { text: "Generating API keys...", delay: 1200 },
      { text: "Finalizing profile setup...", delay: 1500 },
      { text: "Hero created. Welcome.", delay: 1900 },
    ];

    let timeouts: NodeJS.Timeout[] = [];

    // Faster progress bar
    const progressInterval = setInterval(() => {
      setProgress(p => (p >= 100 ? 100 : p + 2.5));
    }, 30);

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
          className="w-24 h-24 rounded-full border-b-2 border-l-2 border-purple-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-2 rounded-full border-t-2 border-r-2 border-primary"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Shield className="w-8 h-8 text-white animate-pulse" />
        </div>
      </div>

      {/* Status Text */}
      <div className="w-full max-w-xs space-y-4">
        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-purple-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="min-h-[100px] text-xs text-purple-400 font-mono space-y-1">
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

function XPBar({ progress }: { progress: number }) {
  return (
    <div className="w-full h-1.5 bg-gray-800 rounded-full mt-2 overflow-hidden relative">
      <motion.div
        className="h-full bg-gradient-to-r from-purple-500 via-primary to-blue-500"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ type: "spring", stiffness: 50, damping: 10 }}
      />
    </div>
  );
}

function StatBadge({ icon: Icon, value, label }: { icon: any, value: string, label: string }) {
  return (
    <div className="bg-black/40 rounded p-1.5 flex items-center gap-2 border border-white/5 text-[10px]">
      <Icon className="w-3 h-3 text-primary" />
      <span className="text-gray-400">{label}:</span>
      <span className="text-white font-mono">{value}</span>
    </div>
  )
}

function CodePreview() {
  return (
    <div className="h-full bg-[#1e1e1e] p-6 font-mono text-xs leading-relaxed text-gray-400 overflow-hidden relative select-none hidden md:block rounded-l-xl border-r border-white/5">
      <div className="absolute top-0 left-0 right-0 h-8 bg-[#252526] flex items-center px-4 space-x-2 border-b border-[#333]">
        <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
        <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
        <span className="ml-4 text-gray-500">profile_init.ts</span>
      </div>
      <div className="mt-8 space-y-1 opacity-80">
        <div><span className="text-[#c586c0]">interface</span> <span className="text-[#4ec9b0]">NewUser</span> {'{'}</div>
        <div>&nbsp;&nbsp;name: <span className="text-[#4ec9b0]">string</span>;</div>
        <div>&nbsp;&nbsp;role: <span className="text-[#ce9178]">'student'</span> | <span className="text-[#ce9178]">'teacher'</span>;</div>
        <div>{'}'}</div>
        <div>&nbsp;</div>
        <div><span className="text-[#6a9955]">// Initialize your profile</span></div>
        <div><span className="text-[#569cd6]">const</span> <span className="text-[#4fc1ff]">profile</span>: <span className="text-[#4ec9b0]">NewUser</span> = {'{'}</div>
        <div>&nbsp;&nbsp;name: <span className="text-[#ce9178]">'Future Master'</span>,</div>
        <div>&nbsp;&nbsp;role: <span className="text-[#ce9178]">'student'</span></div>
        <div>{'}'};</div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-10 left-6 right-6">
        <div className="flex items-center gap-2 text-gray-500 mb-2">
          <Terminal className="w-3 h-3" />
          <span>Terminal</span>
        </div>
        <div className="bg-[#000] rounded p-3 font-mono text-[10px] text-gray-400 border border-white/5">
          <div><span className="text-green-500">➜</span> <span className="text-blue-400">~/letsprep</span> npm install skills</div>
          <div className="mt-1">
            <span className="text-gray-500">[1/4]</span> 🔍 Resolving packages...<br />
            <span className="text-gray-500">[2/4]</span> 🚚 Fetching knowledge...<br />
            <span className="text-gray-500">[3/4]</span> 🔗 Linking dependencies...<br />
            <span className="text-white">Done in 0.42s.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState('student');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Gamification: Progress
  const progress = (
    (formData.name.length > 2 ? 25 : 0) +
    (formData.email.length > 5 ? 25 : 0) +
    (formData.password.length > 5 ? 25 : 0) +
    (formData.confirmPassword === formData.password && formData.password.length > 0 ? 25 : 0)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      // Adjusted delay to 2.0s for quicker feel
      const minDelay = new Promise(resolve => setTimeout(resolve, 2000));
      const authPromise = supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: userType.toUpperCase(),
          },
        },
      });

      const [authResult] = await Promise.all([authPromise, minDelay]);
      const { data, error } = authResult;

      if (error) {
        setError(error.message);
        setIsLoading(false);
      } else if (data.user) {
        setSuccess('Account created successfully!');

        // 500ms Buffer before redirect
        setTimeout(() => {
          router.push('/login');
        }, 500);
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4 relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-5xl bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col md:flex-row h-auto md:min-h-[650px]">

        {/* Left Side: Code Visual */}
        <div className="w-full md:w-5/12 hidden md:block border-r border-white/5">
          <CodePreview />
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-7/12 p-8 md:p-12 bg-[#0a0a0a]/50 flex flex-col justify-center relative">
          <AnimatePresence>
            {isLoading && <AdvancedLoader />}
          </AnimatePresence>

          <div className="mb-6">
            <div className="flex justify-between items-end mb-2">
              <div>
                <h2 className="text-2xl font-bold">New Character</h2>
                <p className="text-gray-400 text-sm">Join the party and start leveling up.</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-primary font-mono flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  SETUP: {progress}%
                </div>
              </div>
            </div>
            <XPBar progress={progress} />
          </div>

          {/* Role Toggle Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <motion.div
              onClick={() => setUserType('student')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`cursor-pointer rounded-xl border p-3 transition-all ${userType === 'student' ? 'bg-primary/10 border-primary' : 'bg-white/5 border-white/5 border-transparent hover:bg-white/10'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <User className={`w-4 h-4 ${userType === 'student' ? 'text-primary' : 'text-gray-400'}`} />
                <span className={`font-bold text-sm ${userType === 'student' ? 'text-white' : 'text-gray-400'}`}>Student</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <StatBadge icon={Brain} label="INT" value="10" />
                <StatBadge icon={Zap} label="SPD" value="8" />
              </div>
            </motion.div>

            <motion.div
              onClick={() => setUserType('teacher')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`cursor-pointer rounded-xl border p-3 transition-all ${userType === 'teacher' ? 'bg-purple-600/10 border-purple-500' : 'bg-white/5 border-white/5 border-transparent hover:bg-white/10'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Terminal className={`w-4 h-4 ${userType === 'teacher' ? 'text-purple-400' : 'text-gray-400'}`} />
                <span className={`font-bold text-sm ${userType === 'teacher' ? 'text-white' : 'text-gray-400'}`}>Teacher</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <StatBadge icon={Brain} label="WIS" value="12" />
                <StatBadge icon={Sword} label="STR" value="6" />
              </div>
            </motion.div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="space-y-2">
              <Label htmlFor="name" className={focusedField === 'name' ? 'text-primary' : ''}>Full Name</Label>
              <div className="relative">
                <User className={`absolute left-3 top-3 h-4 w-4 transition-colors ${focusedField === 'name' ? 'text-primary' : 'text-gray-500'}`} />
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  className="bg-white/5 border-white/10 pl-10 focus:border-primary/50 transition-colors h-10 focus:bg-white/10"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className={focusedField === 'email' ? 'text-primary' : ''}>Email Address</Label>
              <div className="relative">
                <Mail className={`absolute left-3 top-3 h-4 w-4 transition-colors ${focusedField === 'email' ? 'text-primary' : 'text-gray-500'}`} />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  className="bg-white/5 border-white/10 pl-10 focus:border-primary/50 transition-colors h-10 focus:bg-white/10"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password" className={focusedField === 'password' ? 'text-primary' : ''}>Password</Label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-3 h-4 w-4 transition-colors ${focusedField === 'password' ? 'text-primary' : 'text-gray-500'}`} />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••"
                    className="bg-white/5 border-white/10 pl-10 focus:border-primary/50 transition-colors h-10 focus:bg-white/10"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className={focusedField === 'confirmPassword' ? 'text-primary' : ''}>Confirm</Label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-3 h-4 w-4 transition-colors ${focusedField === 'confirmPassword' ? 'text-primary' : 'text-gray-500'}`} />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••"
                    className="bg-white/5 border-white/10 pl-10 focus:border-primary/50 transition-colors h-10 focus:bg-white/10"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                </div>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-400 text-xs p-3 bg-red-500/10 border border-red-500/20 rounded-md"
                >
                  Error: {error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-green-400 text-xs p-3 bg-green-500/10 border border-green-500/20 rounded-md flex items-center gap-2"
                >
                  <Trophy className="w-4 h-4" />
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                className={`w-full text-white font-medium h-10 mt-2 relative overflow-hidden group ${userType === 'teacher' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-primary hover:bg-primary/90'}`}
                disabled={isLoading}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative z-10">{isLoading ? 'Creating Character...' : 'Start Adventure'}</span>
              </Button>
            </motion.div>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-gray-500">
              Don't have an account?{' '}
              <Link href="/login" className="text-white hover:text-primary transition-colors font-medium">Log In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}