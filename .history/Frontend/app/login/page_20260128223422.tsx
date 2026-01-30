'use client';

import React from "react"
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, BookOpen, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState<'student' | 'teacher' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { data: session } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else if (result?.ok) {
        // Redirect based on user role
        const response = await fetch('/api/auth/session');
        const session = await response.json();
        
        if (session?.user?.role === 'TEACHER') {
          router.push('/teacher-dashboard');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
    hover: {
      scale: 1.05,
      boxShadow: '0 20px 40px rgba(79, 70, 229, 0.2)',
      transition: { duration: 0.3 },
    },
  };

  if (!userRole) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <motion.nav 
          className="border-b border-border/30 py-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="flex items-center gap-2 w-fit"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <Code className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl">EduPlatform</span>
              </Link>
            </motion.div>
          </div>
        </motion.nav>

        <div className="flex-1 flex items-center justify-center py-12 px-4">
          <motion.div 
            className="w-full max-w-2xl"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div 
              className="text-center mb-12"
              variants={itemVariants}
            >
              <motion.h1 
                className="text-4xl font-bold mb-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                Welcome Back
              </motion.h1>
              <motion.p 
                className="text-muted-foreground text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                Select your portal to continue
              </motion.p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              variants={containerVariants}
            >
              {/* Student Portal */}
              <motion.div 
                variants={cardVariants}
                whileHover="hover"
                onClick={() => setUserRole('student')}
              >
                <Card className="border border-border/50 bg-card/50 p-8 cursor-pointer h-full">
                  <motion.div 
                    className="flex flex-col items-center text-center space-y-4"
                    whileHover={{ scale: 1.02 }}
                  >
                    <motion.div 
                      className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center"
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <BookOpen className="w-8 h-8 text-primary" />
                    </motion.div>
                    <div>
                      <h2 className="text-xl font-bold">Student Portal</h2>
                      <p className="text-muted-foreground text-sm mt-2">Learn, compete, and master new skills</p>
                    </div>
                  </motion.div>
                </Card>
              </motion.div>

              {/* Teacher Portal */}
              <motion.div 
                variants={cardVariants}
                whileHover="hover"
                onClick={() => setUserRole('teacher')}
              >
                <Card className="border border-border/50 bg-card/50 p-8 cursor-pointer h-full">
                  <motion.div 
                    className="flex flex-col items-center text-center space-y-4"
                    whileHover={{ scale: 1.02 }}
                  >
                    <motion.div 
                      className="w-16 h-16 bg-accent/20 rounded-xl flex items-center justify-center"
                      whileHover={{ rotate: -10, scale: 1.1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <Users className="w-8 h-8 text-accent" />
                    </motion.div>
                    <div>
                      <h2 className="text-xl font-bold">Teacher Portal</h2>
                      <p className="text-muted-foreground text-sm mt-2">Manage classes and track student progress</p>
                    </div>
                  </motion.div>
                </Card>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <motion.nav 
        className="border-b border-border/30 py-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <motion.div 
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">EduPlatform</span>
            </motion.div>
          </Link>
          <motion.button 
            onClick={() => setUserRole(null)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            Back
          </motion.button>
        </div>
      </motion.nav>

      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="w-full max-w-md border-border/50 bg-card/50 p-8">
            <motion.div 
              className="space-y-6"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <motion.div 
                className="space-y-2"
                variants={itemVariants}
              >
                <h1 className="text-2xl font-bold">
                  {userRole === 'teacher' ? 'Teacher' : 'Student'} Login
                </h1>
                <p className="text-muted-foreground">Sign in to your {userRole === 'teacher' ? 'educator' : 'student'} account</p>
                {error && (
                  <div className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-md p-2">
                    {error}
                  </div>
                )}
              </motion.div>

              <motion.form 
                onSubmit={handleSubmit} 
                className="space-y-4"
                variants={containerVariants}
              >
                <motion.div className="space-y-2" variants={itemVariants}>
                  <Label htmlFor="email">Email</Label>
                  <motion.div whileHover={{ scale: 1.02 }} whileFocus={{ scale: 1.02 }}>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-card/50 border-border/50"
                      required
                    />
                  </motion.div>
                </motion.div>

                <motion.div className="space-y-2" variants={itemVariants}>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <Link href="#" className="text-sm text-primary hover:underline">
                        Forgot?
                      </Link>
                    </motion.div>
                  </div>
                  <motion.div whileHover={{ scale: 1.02 }} whileFocus={{ scale: 1.02 }}>
                    <Input
                      id="password"
                      type="password"
                      placeholder="ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-card/50 border-border/50"
                      required
                    />
                  </motion.div>
                </motion.div>

                <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </motion.div>
              </motion.form>

              <motion.div className="relative" variants={itemVariants}>
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/30" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card/50 text-muted-foreground">Or continue with</span>
                </div>
              </motion.div>

              <motion.div 
                className="grid grid-cols-2 gap-3"
                variants={containerVariants}
              >
                {['Google', 'GitHub'].map((provider) => (
                  <motion.div key={provider} variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" className="w-full border-border/50 bg-transparent">
                      {provider}
                    </Button>
                  </motion.div>
                ))}
              </motion.div>

              <motion.p 
                className="text-center text-sm text-muted-foreground"
                variants={itemVariants}
              >
                Don't have an account?{' '}
                <Link href="/signup" className="text-primary hover:underline font-semibold">
                  Sign up
                </Link>
              </motion.p>
            </motion.div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}