'use client';

import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, Youtube, FileText, Download, ExternalLink, Code, Layers, Database, Cpu, Search, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';

const roadmaps = [
    {
        title: "Full Stack Developer",
        description: "From HTML/CSS to scalable backend systems.",
        progress: 35,
        icon: Layers,
        color: "text-blue-500"
    },
    {
        title: "Data Structures & Algorithms",
        description: "Master the fundamentals for technical interviews.",
        progress: 12,
        icon: Code,
        color: "text-green-500"
    },
    {
        title: "System Design Access",
        description: "Architect scalable distributed systems.",
        progress: 0,
        icon: Database,
        color: "text-purple-500"
    }
];

const cheatSheets = [
    { title: "Big O Notation", type: "PDF", size: "1.2 MB" },
    { title: "React Hooks Reference", type: "PDF", size: "0.8 MB" },
    { title: "SQL Commands", type: "PNG", size: "2.4 MB" },
    { title: "Git Commands", type: "PDF", size: "0.5 MB" },
];

const videoResources = [
    {
        title: "Dynamic Programming Patterns",
        channel: "NeetCode",
        duration: "45 min",
        thumbnail: "from-primary/20",
        views: "1.2M"
    },
    {
        title: "System Design: WhatsApp",
        channel: "Gaurav Sen",
        duration: "28 min",
        thumbnail: "from-purple-500/20",
        views: "890K"
    },
    {
        title: "Graph Algorithms Explained",
        channel: "FreeCodeCamp",
        duration: "2h 10m",
        thumbnail: "from-orange-500/20",
        views: "2.5M"
    }
];

export default function ResourcesPage() {
    return (
        <div className="flex h-screen bg-background text-foreground">
            <DashboardSidebar />
            <main className="flex-1 overflow-auto bg-gradient-to-br from-background to-background/50">
                <div className="p-8 space-y-10 max-w-7xl mx-auto">

                    {/* Header */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border border-violet-500/10 p-10">
                        <div className="absolute top-0 right-0 p-10 opacity-10">
                            <BookOpen className="w-64 h-64 text-primary" />
                        </div>
                        <div className="relative z-10 max-w-2xl">
                            <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">Learning Hub</Badge>
                            <h1 className="text-4xl font-bold tracking-tight mb-4">
                                Master Your Craft
                            </h1>
                            <p className="text-lg text-muted-foreground mb-6">
                                Curated learning paths, cheat sheets, and video tutorials to help you ace your interviews and build better software.
                            </p>
                            <div className="flex gap-4">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search resources..." className="pl-10 bg-background/50 backdrop-blur-sm border-primary/20" />
                                </div>
                                <Button>Search</Button>
                            </div>
                        </div>
                    </div>

                    <Tabs defaultValue="all" className="space-y-8">
                        <TabsList className="bg-card/50 backdrop-blur-sm p-1">
                            <TabsTrigger value="all">Everything</TabsTrigger>
                            <TabsTrigger value="roadmaps">Roadmaps</TabsTrigger>
                            <TabsTrigger value="videos">Videos</TabsTrigger>
                            <TabsTrigger value="sheets">Cheat Sheets</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

                            {/* Learning Paths */}
                            <section className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                        Featured Learning Paths
                                    </h2>
                                    <Button variant="ghost" className="text-muted-foreground">View all path</Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {roadmaps.map((map) => (
                                        <Card key={map.title} className="group hover:border-primary/50 transition-all hover:shadow-lg bg-card/40 backdrop-blur-sm">
                                            <CardHeader>
                                                <div className={`w-12 h-12 rounded-lg bg-background flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${map.color}`}>
                                                    <map.icon className="w-6 h-6" />
                                                </div>
                                                <CardTitle>{map.title}</CardTitle>
                                                <CardDescription>{map.description}</CardDescription>
                                            </CardHeader>
                                            <CardFooter className="pt-0">
                                                <div className="w-full space-y-2">
                                                    <div className="flex justify-between text-xs text-muted-foreground">
                                                        <span>Progress</span>
                                                        <span>{map.progress}%</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                                        <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${map.progress}%` }} />
                                                    </div>
                                                </div>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            </section>

                            {/* Resource Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                                {/* Videos */}
                                <div className="lg:col-span-2 space-y-4">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <Youtube className="w-5 h-5 text-red-500" />
                                        Popular Tutorials
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {videoResources.map((video) => (
                                            <Card key={video.title} className="overflow-hidden hover:ring-1 hover:ring-primary/50 transition-all cursor-pointer border-0 shadow-md bg-card">
                                                <div className={`h-32 w-full bg-gradient-to-br ${video.thumbnail} to-background relative flex items-center justify-center`}>
                                                    <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                                                        <div className="ml-1 w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent" />
                                                    </div>
                                                    <Badge className="absolute bottom-2 right-2 bg-black/80 hover:bg-black/80">{video.duration}</Badge>
                                                </div>
                                                <CardContent className="p-4">
                                                    <h3 className="font-semibold line-clamp-1">{video.title}</h3>
                                                    <p className="text-sm text-muted-foreground">{video.channel} • {video.views}</p>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>

                                {/* Cheat Sheets */}
                                <div className="space-y-4">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-blue-500" />
                                        Quick Reference
                                    </h2>
                                    <Card className="bg-card/50">
                                        <CardContent className="p-0">
                                            <ScrollArea className="h-[300px]">
                                                <div className="divide-y divide-border/50">
                                                    {cheatSheets.map((sheet) => (
                                                        <div key={sheet.title} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer group">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                                    {sheet.type}
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium text-sm group-hover:text-primary transition-colors">{sheet.title}</div>
                                                                    <div className="text-xs text-muted-foreground">{sheet.size}</div>
                                                                </div>
                                                            </div>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Download className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                        </CardContent>
                                        <CardFooter className="p-4 border-t border-border/50">
                                            <Button variant="outline" className="w-full gap-2">
                                                View all cheat sheets
                                                <ExternalLink className="w-3 h-3" />
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </div>
                            </div>

                        </TabsContent>
                    </Tabs>

                </div>
            </main>
        </div>
    );
}
