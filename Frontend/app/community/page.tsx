'use client';

import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, MessageSquare, ThumbsUp, Eye, Share2, Plus, Filter, TrendingUp, HelpCircle } from 'lucide-react';

const mockDiscussions = [
    {
        id: 1,
        title: "Best resources for Dynamic Programming?",
        author: "Alex Chen",
        avatar: "AC",
        category: "Algorithms",
        likes: 45,
        comments: 12,
        views: 340,
        time: "2 hours ago",
        tags: ["dp", "optimization", "interview-prep"]
    },
    {
        id: 2,
        title: "How to handle system design interview anxiety?",
        author: "Sarah Jones",
        avatar: "SJ",
        category: "Interview Tips",
        likes: 128,
        comments: 43,
        views: 1205,
        time: "5 hours ago",
        tags: ["soft-skills", "anxiety", "system-design"]
    },
    {
        id: 3,
        title: "Optimization techniques for React rendering",
        author: "Mike Ross",
        avatar: "MR",
        category: "Frontend",
        likes: 89,
        comments: 24,
        views: 890,
        time: "1 day ago",
        tags: ["react", "javascript", "performance"]
    },
    {
        id: 4,
        title: "Is LeetCode enough for FAANG?",
        author: "Jessica Wu",
        avatar: "JW",
        category: "Career",
        likes: 230,
        comments: 156,
        views: 5600,
        time: "2 days ago",
        tags: ["career", "faang", "leetcode"]
    }
];

const categories = ["All", "Algorithms", "System Design", "Frontend", "Backend", "Career", "Interview Tips"];

export default function CommunityPage() {
    return (
        <div className="flex h-screen bg-background text-foreground">
            <DashboardSidebar />
            <main className="flex-1 overflow-auto bg-gradient-to-br from-background to-background/50">
                <div className="p-8 space-y-8 max-w-7xl mx-auto">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                                Community Hub
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Connect, discuss, and grow with fellow developers.
                            </p>
                        </div>
                        <Button className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                            <Plus className="w-4 h-4" />
                            New Discussion
                        </Button>
                    </div>

                    {/* Search &Filter */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search discussions, topics, or users..." className="pl-10 h-10 bg-card/50 backdrop-blur-sm" />
                        </div>
                        <Button variant="outline" className="gap-2">
                            <Filter className="w-4 h-4" />
                            Filters
                        </Button>
                    </div>

                    {/* Main Content Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                        {/* Left Column: Feed */}
                        <div className="lg:col-span-3 space-y-6">

                            <Tabs defaultValue="trending" className="w-full">
                                <TabsList className="bg-card/50 backdrop-blur-sm p-1">
                                    <TabsTrigger value="trending" className="gap-2">
                                        <TrendingUp className="w-4 h-4" /> Trending
                                    </TabsTrigger>
                                    <TabsTrigger value="latest">Latest</TabsTrigger>
                                    <TabsTrigger value="unanswered">Unanswered</TabsTrigger>
                                </TabsList>

                                <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
                                    {categories.map((cat) => (
                                        <Badge
                                            key={cat}
                                            variant={cat === "All" ? "default" : "secondary"}
                                            className="cursor-pointer hover:opacity-80 transition-opacity whitespace-nowrap"
                                        >
                                            {cat}
                                        </Badge>
                                    ))}
                                </div>

                                <TabsContent value="trending" className="space-y-4 mt-0">
                                    {mockDiscussions.map((post) => (
                                        <Card key={post.id} className="group hover:border-primary/50 transition-colors cursor-pointer bg-card/40 backdrop-blur-sm">
                                            <CardContent className="p-6">
                                                <div className="flex gap-4">
                                                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-green-500">
                                                            <ThumbsUp className="w-4 h-4" />
                                                        </Button>
                                                        <span className="font-semibold text-sm">{post.likes}</span>
                                                    </div>

                                                    <div className="flex-1 space-y-2">
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <Avatar className="h-5 w-5 border border-primary/20">
                                                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${post.author}`} />
                                                                <AvatarFallback>{post.avatar}</AvatarFallback>
                                                            </Avatar>
                                                            <span className="font-medium text-primary/80">{post.author}</span>
                                                            <span>•</span>
                                                            <span>{post.time}</span>
                                                            <Badge variant="outline" className="ml-auto text-[10px] h-5">{post.category}</Badge>
                                                        </div>

                                                        <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                                                            {post.title}
                                                        </h3>

                                                        <div className="flex flex-wrap gap-2 pt-2">
                                                            {post.tags.map(tag => (
                                                                <span key={tag} className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                                                                    #{tag}
                                                                </span>
                                                            ))}
                                                        </div>

                                                        <div className="flex gap-4 pt-2 text-sm text-muted-foreground">
                                                            <div className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                                                                <MessageSquare className="w-4 h-4" />
                                                                {post.comments} answers
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <Eye className="w-4 h-4" />
                                                                {post.views} views
                                                            </div>
                                                            <Button variant="ghost" size="sm" className="h-auto p-0 ml-auto hover:text-foreground">
                                                                <Share2 className="w-4 h-4 mr-1" /> Share
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </TabsContent>

                                <TabsContent value="latest">
                                    <div className="text-center py-10 text-muted-foreground">Latest posts coming soon...</div>
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Right Column: Widgets */}
                        <div className="space-y-6">
                            <Card className="bg-gradient-to-br from-card to-primary/5 border-primary/10">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <HelpCircle className="w-5 h-5 text-primary" />
                                        Community Guidelines
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-muted-foreground space-y-2">
                                    <p>1. Be respectful and kind.</p>
                                    <p>2. Search before posting.</p>
                                    <p>3. Use proper code formatting.</p>
                                </CardContent>
                                <CardFooter>
                                    <Button variant="link" className="p-0 text-primary">Read full guidelines</Button>
                                </CardFooter>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Top Contributors</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback>U{i}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="text-sm font-medium">User {i}</div>
                                                    <div className="text-xs text-muted-foreground">1,2{i}0 pts</div>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-yellow-500 border-yellow-500/20">Top {i}</Badge>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
