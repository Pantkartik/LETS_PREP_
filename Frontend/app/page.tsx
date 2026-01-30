'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring, useInView, useMotionValue, useVelocity } from 'framer-motion';
import {
  Zap,
  Users,
  Trophy,
  BarChart3,
  Sparkles,
  ArrowRight,
  Code,
  CheckCircle2,
  Globe,
  MonitorPlay,
  Rocket,
  Menu,
  Star,
  Github,
  Twitter,
  Linkedin,
  Cpu,
  Layers,
  Shield
} from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

// --- 3D Components ---

function FloatingCard({ children, delay = 0, index = 0 }: { children: React.ReactNode, delay?: number, index?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 100, rotateX: -15, z: -100 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0, z: 0 } : {}}
      transition={{
        duration: 0.8,
        delay: delay,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{
        y: -10,
        rotateY: 5,
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      className="transform-gpu"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </motion.div>
  );
}

function ParallaxText({ children, baseVelocity = 100 }: { children: React.ReactNode, baseVelocity?: number }) {
  return (
    <div className="overflow-hidden whitespace-nowrap flex">
      <div className="flex gap-8 animate-marquee">
        {children}
        {children}
        {children}
        {children}
      </div>
    </div>
  );
}

function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 bg-background pointer-events-none">
      {/* Gradient Orbs - Simplified animation */}
      <motion.div
        animate={{
          opacity: [0.2, 0.4, 0.2],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[100px]"
      />
      <motion.div
        animate={{
          opacity: [0.2, 0.4, 0.2],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[0%] right-[-5%] w-[400px] h-[400px] rounded-full bg-accent/10 blur-[100px]"
      />

      {/* Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:64px_64px]" />
    </div>
  );
}

function Hero3D() {
  const containerRef = useRef(null);
  /* Removed scroll animations for performance */

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
      >
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left z-10">
            <div>
              <Badge variant="outline" className="mb-6 py-2 px-4 rounded-full border-primary/30 bg-primary/10 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                Next-Gen Learning Platform
              </Badge>
            </div>

            <h1
              className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight mb-6 leading-[1.1]"
            >
              <span className="block">Master DSA</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-accent animate-gradient">
                In 3D Reality
              </span>
            </h1>

            <p
              className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
            >
              Experience competitive programming like never before. Immersive battles, real-time analytics, and AI-powered insights.
            </p>

            <div
              className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
            >
              <Link href="/signup">
                <Button size="lg" className="rounded-full h-14 px-10 text-lg shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-105 group">
                  Launch Experience
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#demo">
                <Button size="lg" variant="outline" className="rounded-full h-14 px-10 text-lg hover:bg-muted/50 transition-all border-border/50 backdrop-blur-sm">
                  <MonitorPlay className="mr-2 w-5 h-5" /> Watch Demo
                </Button>
              </Link>
            </div>

            <div
              className="mt-12 flex items-center justify-center lg:justify-start gap-8 text-sm"
            >
              {[
                { icon: CheckCircle2, text: "Free Forever" },
                { icon: Cpu, text: "AI Powered" },
                { icon: Shield, text: "Secure" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-muted-foreground">
                  <item.icon className="w-4 h-4 text-primary" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3D Visual */}
          <div className="flex-1 w-full max-w-[600px] perspective-[1000px] hidden lg:block">
            <div
              className="relative"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Floating Cards */}
              <div className="relative h-[500px]">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="absolute transition-transform duration-500 hover:scale-105"
                    style={{
                      left: `${i * 25}%`,
                      top: `${i * 15}%`,
                      zIndex: 3 - i,
                    }}
                  >
                    <div className="w-64 h-80 rounded-2xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-white/10 shadow-2xl p-6 transform-gpu">
                      <div className="h-full flex flex-col justify-between">
                        <div>
                          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                            {i === 0 && <Code className="w-6 h-6 text-primary" />}
                            {i === 1 && <Trophy className="w-6 h-6 text-yellow-500" />}
                            {i === 2 && <BarChart3 className="w-6 h-6 text-blue-500" />}
                          </div>
                          <h3 className="text-lg font-bold mb-2">
                            {i === 0 && "Live Coding"}
                            {i === 1 && "Compete"}
                            {i === 2 && "Analytics"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {i === 0 && "Real-time collaboration"}
                            {i === 1 && "Global leaderboards"}
                            {i === 2 && "AI insights"}
                          </p>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {[...Array(6)].map((_, j) => (
                            <div
                              key={j}
                              className="h-8 rounded bg-white/5"
                              style={{ opacity: (j + 1) * 0.15 }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features3D() {
  const features = [
    {
      icon: Zap,
      title: "Instant Rooms",
      description: "Create battle rooms in milliseconds with zero configuration",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: BarChart3,
      title: "Live Analytics",
      description: "Real-time performance tracking with AI-powered insights",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Users,
      title: "Team Battles",
      description: "Collaborate or compete with peers in real-time",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Trophy,
      title: "Leaderboards",
      description: "Global rankings updated every second",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Globe,
      title: "Global Community",
      description: "Join thousands of developers worldwide",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Layers,
      title: "Multi-Language",
      description: "Support for Python, Java, C++, and JavaScript",
      color: "from-indigo-500 to-purple-500"
    }
  ];

  return (
    <section className="py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold mb-6">
            Powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Innovation</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the future of competitive programming with cutting-edge features
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div key={i}>
              <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/40 backdrop-blur-sm p-8 h-full hover:bg-card/60 transition-all duration-500 hover:-translate-y-2">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} p-0.5 mb-6`}>
                    <div className="w-full h-full rounded-2xl bg-background flex items-center justify-center">
                      <feature.icon className="w-7 h-7 text-primary" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>

                {/* Decorative elements */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-all duration-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const stats = [
    { value: "10k+", label: "Active Users" },
    { value: "500+", label: "Daily Battles" },
    { value: "98%", label: "Success Rate" },
    { value: "24/7", label: "Uptime" }
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />

      <ParallaxText baseVelocity={-2}>
        {stats.map((stat, i) => (
          <div key={i} className="inline-flex items-center gap-4 px-8">
            <div className="text-center">
              <div className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider mt-2">
                {stat.label}
              </div>
            </div>
            <div className="w-px h-16 bg-border" />
          </div>
        ))}
      </ParallaxText>
    </section>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <AnimatedBackground />

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 w-full z-40 border-b border-white/10 bg-background/60 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <Code className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">LET'S PREP</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Testimonials', 'FAQ'].map((item) => (
              <Link key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                {item}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">Login</Link>
            <Link href="/signup">
              <Button className="rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                Get Started
              </Button>
            </Link>
          </div>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-8">
                  {['Features', 'Testimonials', 'FAQ'].map((item) => (
                    <Link key={item} href={`#${item.toLowerCase()}`} className="text-lg font-medium hover:text-primary transition-colors">
                      {item}
                    </Link>
                  ))}
                  <div className="h-px bg-border my-2" />
                  <Link href="/login" className="text-lg font-medium hover:text-primary transition-colors">Login</Link>
                  <Link href="/signup" className="text-lg font-medium text-primary">Sign Up</Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </motion.nav>

      <Hero3D />
      <StatsSection />
      <Features3D />

      {/* CTA */}
      <section className="py-32 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto px-4 text-center"
        >
          <div className="relative rounded-3xl border border-border/50 bg-card/40 backdrop-blur-xl p-16 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />

            <div className="relative z-10">
              <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <Rocket className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-5xl font-bold mb-6">Ready to Elevate?</h2>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Join thousands of developers mastering algorithms in the most immersive way possible
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="h-14 px-10 text-lg rounded-full shadow-2xl shadow-primary/30">
                    Start Free Trial
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-full">
                    Teacher Access
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl">LET'S PREP</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Empowering the next generation of software engineers through immersive 3D learning experiences.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6">Product</h4>
              <ul className="space-y-4 text-muted-foreground">
                <li><Link href="#features" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="#testimonials" className="hover:text-primary transition-colors">Testimonials</Link></li>
                <li><Link href="#faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Connect</h4>
              <ul className="space-y-4 text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-2"><Twitter className="w-4 h-4" /> Twitter</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-2"><Github className="w-4 h-4" /> GitHub</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-2"><Linkedin className="w-4 h-4" /> LinkedIn</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>&copy; 2024 Let's Prep Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-foreground">Privacy</Link>
              <Link href="#" className="hover:text-foreground">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
