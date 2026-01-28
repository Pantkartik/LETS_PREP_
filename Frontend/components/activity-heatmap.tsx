'use client';

import { Card } from '@/components/ui/card';

interface HeatmapData {
  date: string;
  count: number;
}

interface ActivityHeatmapProps {
  data: HeatmapData[];
  title?: string;
  maxCount?: number;
}

export default function ActivityHeatmap({ data, title = 'Activity', maxCount = 10 }: ActivityHeatmapProps) {
  const getColor = (count: number) => {
    const percentage = (count / maxCount) * 100;
    if (count === 0) return 'bg-card/30';
    if (percentage <= 25) return 'bg-primary/20';
    if (percentage <= 50) return 'bg-primary/40';
    if (percentage <= 75) return 'bg-primary/60';
    return 'bg-primary/90';
  };

  // Group data by weeks
  const weeks: HeatmapData[][] = [];
  let currentWeek: HeatmapData[] = [];

  data.forEach((item) => {
    currentWeek.push(item);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className="border-border/50 bg-card/50 p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        
        <div className="overflow-x-auto">
          <div className="flex gap-1">
            {/* Legend */}
            <div className="flex flex-col justify-end gap-1 mr-4">
              {dayLabels.map((day) => (
                <div key={day} className="text-xs text-muted-foreground w-8 h-8 flex items-center justify-center">
                  {day}
                </div>
              ))}
            </div>

            {/* Heatmap Grid */}
            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((item, dayIndex) => {
                    const date = new Date(item.date);
                    return (
                      <div
                        key={item.date}
                        className={`w-8 h-8 rounded border border-border/20 ${getColor(item.count)} cursor-pointer hover:border-primary/50 transition-all duration-200 group relative`}
                        title={`${item.date}: ${item.count} activities`}
                      >
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-foreground/90 text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          {item.date}: {item.count}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/20">
          <span>Less</span>
          <div className="flex gap-1 items-center">
            <div className="w-3 h-3 rounded bg-card/30 border border-border/20" />
            <div className="w-3 h-3 rounded bg-primary/20 border border-border/20" />
            <div className="w-3 h-3 rounded bg-primary/40 border border-border/20" />
            <div className="w-3 h-3 rounded bg-primary/60 border border-border/20" />
            <div className="w-3 h-3 rounded bg-primary/90 border border-border/20" />
          </div>
          <span>More</span>
        </div>
      </div>
    </Card>
  );
}
