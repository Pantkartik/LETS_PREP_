'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Users, 
  Brain, 
  Trophy, 
  Flame, 
  BarChart3, 
  BookOpen,
  Sparkles,
  ArrowRight,
  Code,
  Target,
  CheckCircle
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
  hover: {
    y: -8,
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
    transition: { duration: 0.3 },
  },
};

const navVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <motion.nav 
        initial="hidden"
        animate="visible"
        variants={navVariants}
        className="border-b border-border/30 sticky top-0 z-50 bg-background/80 backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
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
          <div className="flex items-center gap-4">
            <Link href="/login">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost">Login</Button>
              </motion.div>
            </Link>
            <Link href="/signup">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-primary hover:bg-primary/90">Sign Up</Button>
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center space-y-8"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div className="space-y-4" variants={itemVariants}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <Badge className="mx-auto bg-accent/20 text-accent border-accent/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Interactive Learning & Assessment
                </Badge>
              </motion.div>
              
              <motion.h1 
                className="text-5xl sm:text-6xl lg:text-7xl font-bold text-pretty leading-tight"
                variants={itemVariants}
              >
                Engaging Educational 
                <motion.span 
                  className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  Competition Platform
                </motion.span>
              </motion.h1>
              
              <motion.p 
                className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty"
                variants={itemVariants}
              >
                Teachers create game rooms with invite links. Students compete, learn, and track progress with activity heatmaps. Real-time leaderboards and comprehensive analytics.
              </motion.p>
            </motion.div>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
              variants={itemVariants}
            >
              <Link href="/login">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2">
                    Get Started <ArrowRight className="w-4 h-4" />
                  </Button>
                </motion.div>
              </Link>
              <Link href="#features">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" variant="outline" className="border-border/50 bg-transparent">
                    Learn More
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div 
              className="grid grid-cols-3 gap-4 pt-12"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {[
                { value: '500+', label: 'Active Classes' },
                { value: '10K+', label: 'Students' },
                { value: '100K+', label: 'Competitions' },
              ].map((stat, i) => (
                <motion.div key={i} className="space-y-2" variants={itemVariants}>
                  <motion.div 
                    className="text-2xl sm:text-3xl font-bold text-accent"
                    whileInView={{ scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    {stat.value}
                  </motion.div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-card/30 border-y border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center space-y-4 mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.h2 
              className="text-4xl font-bold"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Platform Features
            </motion.h2>
            <motion.p 
              className="text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Tools for teachers to create engaging competitions and for students to learn collaboratively
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: true }}
          >
            {[
              {
                icon: Zap,
                title: 'Game Rooms',
                desc: 'Teachers create competitions with invite links. Students join and compete in real-time.',
                colorClass: 'bg-primary/20 text-primary',
              },
              {
                icon: BarChart3,
                title: 'Activity Heatmaps',
                desc: 'Visual representation of student activity and participation. Track engagement at a glance.',
                colorClass: 'bg-accent/20 text-accent',
              },
              {
                icon: Sparkles,
                title: 'Invite Links',
                desc: 'Easy-to-share competition links. Students join with one click and start competing.',
                colorClass: 'bg-primary/20 text-primary',
              },
              {
                icon: Trophy,
                title: 'Real-Time Leaderboards',
                desc: 'Live rankings for each competition. Students see their position and progress instantly.',
                colorClass: 'bg-accent/20 text-accent',
              },
              {
                icon: Users,
                title: 'Role-Based Access',
                desc: 'Dedicated teacher and student portals. Separate dashboards for managing and learning.',
                colorClass: 'bg-primary/20 text-primary',
              },
              {
                icon: Brain,
                title: 'Performance Insights',
                desc: 'Teachers monitor student progress with analytics. Identify struggling students easily.',
                colorClass: 'bg-accent/20 text-accent',
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div key={i} variants={itemVariants}>
                  <motion.div 
                    variants={cardVariants}
                    whileHover="hover"
                  >
                    <Card className="border-border/50 bg-card/50 h-full p-6 cursor-pointer">
                      <div className="flex items-start gap-4">
                        <motion.div 
                          className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${feature.colorClass}`}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          <Icon className="w-6 h-6" />
                        </motion.div>
                        <div className="space-y-2">
                          <h3 className="font-bold text-lg">{feature.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {feature.desc}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20">
        <motion.div 
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold">Ready to Engage Your Students?</h2>
            <p className="text-lg text-muted-foreground">
              Create dynamic learning competitions and track student engagement with activity heatmaps.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/login">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Login to Your Portal <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-12 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <Code className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold">EduPlatform</span>
              </div>
              <p className="text-sm text-muted-foreground">Create engaging competitions and track student progress.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition">Features</Link></li>
                <li><Link href="#" className="hover:text-foreground transition">Pricing</Link></li>
                <li><Link href="#" className="hover:text-foreground transition">Blog</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition">About</Link></li>
                <li><Link href="#" className="hover:text-foreground transition">Contact</Link></li>
                <li><Link href="#" className="hover:text-foreground transition">Community</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition">Privacy</Link></li>
                <li><Link href="#" className="hover:text-foreground transition">Terms</Link></li>
                <li><Link href="#" className="hover:text-foreground transition">Cookies</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/30 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 EduPlatform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
