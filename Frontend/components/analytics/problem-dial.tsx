'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';

interface ProblemDialProps {
    easy: number;
    medium: number;
    hard: number;
    total: number;
    size?: 'sm' | 'md' | 'lg';
}

export function ProblemDial({ easy, medium, hard, total, size = 'md' }: ProblemDialProps) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const difficultyData = [
        { name: 'Easy', value: easy, color: '#22c55e', accuracy: 92 }, // Mock accuracy for now
        { name: 'Medium', value: medium, color: '#eab308', accuracy: 78 },
        { name: 'Hard', value: hard, color: '#ef4444', accuracy: 64 },
    ];
    // Filter out zero values to avoid rendering issues
    const activeData = difficultyData.filter(d => d.value > 0);

    const onPieEnter = (_: any, index: number) => setActiveIndex(index);
    const onPieLeave = () => setActiveIndex(null);

    const activeItem = activeIndex !== null ? activeData[activeIndex] : null;

    // Adjust sizes based on prop (Reduced radii & increased container for maximum safety)
    const config = {
        sm: { inner: 25, outer: 40, width: 160 },
        md: { inner: 45, outer: 65, width: 240 },
        lg: { inner: 55, outer: 75, width: 280 },
    }[size];

    const renderActiveShape = (props: any) => {
        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
        return (
            <g>
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius + (size === 'sm' ? 4 : 8)}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                />
                <Sector
                    cx={cx} // Highlight Inner Ring
                    cy={cy}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    innerRadius={innerRadius - 4}
                    outerRadius={innerRadius - 2}
                    fill={fill}
                />
            </g>
        );
    };

    return (
        <div className={`flex flex-col ${size === 'sm' ? 'gap-2' : 'md:flex-row gap-8'} items-center justify-center p-2`}>
            {/* The Dial */}
            <div className="relative flex items-center justify-center" style={{ width: config.width, height: config.width }}>
                <div className="absolute inset-0 z-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                activeIndex={activeIndex !== null ? activeIndex : -1}
                                activeShape={renderActiveShape}
                                data={activeData}
                                cx="50%"
                                cy="50%"
                                innerRadius={config.inner}
                                outerRadius={config.outer}
                                paddingAngle={4}
                                dataKey="value"
                                onMouseEnter={onPieEnter}
                                onMouseLeave={onPieLeave}
                                stroke="none"
                                cornerRadius={4}
                            >
                                {activeData.map((entry) => (
                                    <Cell key={entry.name} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeItem ? activeItem.name : 'total'}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            className="text-center"
                        >
                            {activeItem ? (
                                <>
                                    <p className={`font-medium text-muted-foreground uppercase ${size === 'sm' ? 'text-[10px]' : 'text-xs'}`}>{activeItem.name}</p>
                                    <h3 className={`font-bold leading-none ${size === 'sm' ? 'text-xl' : 'text-3xl'}`} style={{ color: activeItem.color }}>{activeItem.value}</h3>
                                    {size !== 'sm' && (
                                        <div className="mt-1 flex items-center justify-center gap-1 text-[10px] bg-background/80 px-1.5 py-0.5 rounded-full border border-border/50">
                                            <span>{activeItem.accuracy}%</span>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <p className={`font-medium text-muted-foreground uppercase ${size === 'sm' ? 'text-[10px]' : 'text-xs'}`}>Solved</p>
                                    <h3 className={`font-bold leading-none ${size === 'sm' ? 'text-xl' : 'text-3xl'}`}>{total}</h3>
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Legend (Only for larger sizes or distinct layout if needed) */}
            {size !== 'sm' && (
                <div className="space-y-4 w-full max-w-[180px]">
                    {difficultyData.map((item, index) => (
                        <div
                            key={item.name}
                            className={`space-y-1 p-2 rounded-lg transition-colors cursor-pointer ${activeIndex === index ? 'bg-muted/50' : 'hover:bg-muted/20'}`}
                            onMouseEnter={() => setActiveIndex(index)}
                            onMouseLeave={() => setActiveIndex(null)}
                        >
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground font-medium" style={{ color: activeIndex === index ? item.color : undefined }}>
                                    {item.name}
                                </span>
                                <span className="font-mono font-medium">{item.value}</span>
                            </div>
                            <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(item.value / total) * 100}%` }}
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: item.color }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
