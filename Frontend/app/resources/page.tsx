'use client';

import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, Youtube, FileText, Download, ExternalLink, Code, Layers, Database, Cpu, Search, Star, Globe, Github } from 'lucide-react';
import { Input } from '@/components/ui/input';

const roadmaps = [
    {
        title: "Full Stack JavaScript",
        description: "The Odin Project's complete path from HTML/CSS to Node.js and React.",
        icon: Layers,
        color: "text-yellow-500",
        url: "https://www.theodinproject.com/paths/full-stack-javascript",
        provider: "The Odin Project"
    },
    {
        title: "Full Stack Open 2024",
        description: "Deep dive into modern web development with React, Redux, Node.js, GraphQL.",
        icon: Globe,
        color: "text-blue-500",
        url: "https://fullstackopen.com/en/",
        provider: "University of Helsinki"
    },
    {
        title: "System Design Primer",
        description: "The comprehensive guide to designing large-scale distributed systems.",
        icon: Database,
        color: "text-purple-500",
        url: "https://github.com/donnemartin/system-design-primer",
        provider: "GitHub"
    },
    {
        title: "NeetCode Roadmap",
        description: "A structured guide to LeetCode patterns for interview preparation.",
        icon: Code,
        color: "text-green-500",
        url: "https://neetcode.io/roadmap",
        provider: "NeetCode"
    }
];

const cheatSheets = [
    { title: "Big-O Complexity Chart", type: "Web", size: "Interactive", url: "https://bigocheatsheet.com/" },
    { title: "React TypeScript Guide", type: "GitHub", size: "Repo", url: "https://github.com/typescript-cheatsheets/react" },
    { title: "Official Git Cheat Sheet", type: "PDF", size: "Download", url: "https://education.github.com/git-cheat-sheet-education.pdf" },
    { title: "Flexbox Froggy", type: "Game", size: "Interactive", url: "https://flexboxfroggy.com/" },
    { title: "Grid Garden", type: "Game", size: "Interactive", url: "https://cssgridgarden.com/" },
    { title: "SQL Bolt (Interactive SQL)", type: "Web", size: "Interactive", url: "https://sqlbolt.com/" }
];

const videoResources = [
    {
        title: "MIT 6.006 Intro to Algorithms",
        channel: "MIT OpenCourseWare",
        duration: "47 Lectures",
        thumbnail: "from-red-900/40",
        views: "5M+",
        url: "https://www.youtube.com/playlist?list=PLUl4u3cNGP63EdVPNLG3ToM6La6P7E1"
    },
    {
        title: "System Design Course for Beginners",
        channel: "FreeCodeCamp",
        duration: "1h 5m",
        thumbnail: "from-blue-900/40",
        views: "2.3M",
        url: "https://www.youtube.com/watch?v=m8Icp_Cid5o"
    },
    {
        title: "Namaste JavaScript",
        channel: "Akshay Saini",
        duration: "Series",
        thumbnail: "from-yellow-900/40",
        views: "top-rated",
        url: "https://www.youtube.com/playlist?list=PLlasXeu85E9cQ32gLCvAvr9vNaUccPVNP"
    },
    {
        title: "Harvard CS50 2024",
        channel: "Harvard University",
        duration: "Full Course",
        thumbnail: "from-red-800/40",
        views: "Global",
        url: "https://www.youtube.com/watch?v=malhqZs8IIY"
    }
];

const openSourceRepos = [
    { title: "build-your-own-x", owner: "codecrafters-io", description: "Master programming by recreating your favorite technologies from scratch.", stars: "250k", url: "https://github.com/codecrafters-io/build-your-own-x" },
    { title: "tech-interview-handbook", owner: "yangshun", description: "Curated coding interview preparation materials for busy software engineers.", stars: "110k", url: "https://github.com/yangshun/tech-interview-handbook" },
    { title: "developer-roadmap", owner: "kamranahmedse", description: "Interactive roadmaps, guides and other educational content.", stars: "280k", url: "https://roadmap.sh/" }
];

export default function ResourcesPage() {
    return (
        <div className="flex h-screen bg-background text-foreground">
            <DashboardSidebar />
            <main className="flex-1 overflow-auto bg-gradient-to-br from-background via-background/90 to-primary/5">
                <div className="p-8 space-y-10 max-w-7xl mx-auto">

                    {/* Header */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border border-violet-500/10 p-10 shadow-2xl shadow-primary/5">
                        <div className="absolute top-0 right-0 p-10 opacity-10 animate-pulse">
                            <BookOpen className="w-64 h-64 text-primary" />
                        </div>
                        <div className="relative z-10 max-w-3xl">
                            <Badge variant="secondary" className="mb-4 bg-primary/20 text-primary border-primary/30  px-3 py-1">Curated Learning Hub</Badge>
                            <h1 className="text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                                Master Your Craft
                            </h1>
                            <p className="text-xl text-muted-foreground mb-8 text-balance">
                                Hand-picked, high-quality resources from MIT, Google, and the open-source community to accelerate your engineering journey.
                            </p>

                            <div className="flex gap-4">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search libraries, frameworks, guides..." className="pl-10 h-10 bg-background/50 backdrop-blur-md border-primary/20 focus:ring-primary/50" />
                                </div>
                                <Button className="shadow-lg shadow-primary/25">Find Resource</Button>
                            </div>
                        </div>
                    </div>

                    <Tabs defaultValue="all" className="space-y-8">
                        <TabsList className="bg-muted/50 backdrop-blur-sm p-1 border border-border/50">
                            <TabsTrigger value="all">Featured</TabsTrigger>
                            <TabsTrigger value="roadmaps">Roadmaps</TabsTrigger>
                            <TabsTrigger value="videos">University Lectures</TabsTrigger>
                            <TabsTrigger value="sheets">Cheat Sheets</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

                            {/* Learning Paths */}
                            <section className="space-y-6">
                                <div className="flex items-center justify-between border-b pb-4 border-border/40">
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                        <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                                        Structured Learning Paths
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {roadmaps.map((map) => (
                                        <a key={map.title} href={map.url} target="_blank" rel="noopener noreferrer" className="block h-full">
                                            <Card className="group h-full hover:border-primary/50 transition-all hover:shadow-lg hover:-translate-y-1 bg-card/40 backdrop-blur-sm">
                                                <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                                                    <div className={`w-12 h-12 rounded-xl bg-background/80 flex items-center justify-center group-hover:scale-110 transition-transform ${map.color} shadow-sm border border-border/50`}>
                                                        <map.icon className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-lg group-hover:text-primary transition-colors">{map.title}</CardTitle>
                                                        <Badge variant="outline" className="mt-1 font-normal text-xs text-muted-foreground">{map.provider}</Badge>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <CardDescription className="text-base">{map.description}</CardDescription>
                                                </CardContent>
                                            </Card>
                                        </a>
                                    ))}
                                </div>
                            </section>

                            {/* Resource Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                                {/* Videos */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="flex items-center gap-2 border-b pb-4 border-border/40 mb-6">
                                        <Youtube className="w-6 h-6 text-red-500" />
                                        <h2 className="text-2xl font-bold">University & Expert Lectures</h2>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {videoResources.map((video) => (
                                            <a key={video.title} href={video.url} target="_blank" rel="noopener noreferrer">
                                                <Card className="overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer border-0 shadow-md bg-card group">
                                                    <div className={`h-40 w-full bg-gradient-to-br ${video.thumbnail} to-background relative flex items-center justify-center overflow-hidden`}>
                                                        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform">
                                                            <div className="ml-1 w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent" />
                                                        </div>
                                                        <Badge className="absolute bottom-2 right-2 bg-black/80 hover:bg-black/80 backdrop-blur-sm">{video.duration}</Badge>
                                                    </div>
                                                    <CardContent className="p-4">
                                                        <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">{video.title}</h3>
                                                        <p className="text-sm text-muted-foreground">{video.channel} • {video.views}</p>
                                                    </CardContent>
                                                </Card>
                                            </a>
                                        ))}
                                    </div>
                                </div>

                                {/* Cheat Sheets & Tools */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 border-b pb-4 border-border/40 mb-6">
                                        <FileText className="w-6 h-6 text-blue-500" />
                                        <h2 className="text-2xl font-bold">Quick Ref</h2>
                                    </div>

                                    <Card className="bg-card/50 shadow-inner">
                                        <CardContent className="p-0">
                                            <ScrollArea className="h-[400px]">
                                                <div className="divide-y divide-border/30">
                                                    {cheatSheets.map((sheet) => (
                                                        <a key={sheet.title} href={sheet.url} target="_blank" rel="noopener noreferrer" className="block">
                                                            <div className="p-4 flex items-center justify-between hover:bg-primary/5 transition-colors cursor-pointer group">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-xs ring-1 ring-primary/20">
                                                                        {sheet.type}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-medium text-sm group-hover:text-primary transition-colors">{sheet.title}</div>
                                                                        <div className="text-xs text-muted-foreground">{sheet.size}</div>
                                                                    </div>
                                                                </div>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <ExternalLink className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                        </CardContent>
                                        <CardFooter className="p-4 border-t border-border/50 bg-muted/20">
                                            <p className="text-xs text-muted-foreground w-full text-center">Resources are curated weekly.</p>
                                        </CardFooter>
                                    </Card>

                                    {/* Open Source Spotlight */}
                                    <Card className="bg-gradient-to-br from-card to-background border-primary/10">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                                                <Github className="w-4 h-4" /> Open Source Spotlight
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {openSourceRepos.map(repo => (
                                                <a key={repo.title} href={repo.url} target="_blank" rel="noopener noreferrer" className="block group">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="font-semibold group-hover:text-primary transition-colors">{repo.title}</div>
                                                            <div className="text-xs text-muted-foreground line-clamp-1">{repo.description}</div>
                                                        </div>
                                                        <div className="flex items-center text-xs font-mono text-yellow-600 dark:text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded">
                                                            ★ {repo.stars}
                                                        </div>
                                                    </div>
                                                </a>
                                            ))}
                                        </CardContent>
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
