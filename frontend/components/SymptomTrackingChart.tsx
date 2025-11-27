'use client';

import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card } from '@/components/ui/Card';

interface SymptomData {
  date: string;
  severity: number;
  symptom: string;
}

interface SymptomTrackingChartProps {
  data: SymptomData[];
  timeRange: string;
}

export function SymptomTrackingChart({ data, timeRange }: SymptomTrackingChartProps) {
  // Convert severity text to numbers
  const processedData = data.map(item => ({
    ...item,
    severityValue: getSeverityValue(item.severity),
    date: formatDate(item.date)
  }));

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-white">Symptom Severity Trends</h3>
          <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">
            Track your symptom severity over {timeRange}
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={processedData}>
          <defs>
            <linearGradient id="colorSeverity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
          <XAxis 
            dataKey="date" 
            stroke="#64748b"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#64748b"
            style={{ fontSize: '12px' }}
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ stroke: '#14b8a6', strokeWidth: 2 }}
          />
          <Area 
            type="monotone" 
            dataKey="severityValue" 
            stroke="#14b8a6" 
            strokeWidth={3}
            fill="url(#colorSeverity)" 
            name="Severity"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-slate-600 dark:text-gray-300">Mild (0-3)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span className="text-slate-600 dark:text-gray-300">Moderate (4-6)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-slate-600 dark:text-gray-300">Severe (7-10)</span>
        </div>
      </div>
    </Card>
  );
}

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg shadow-lg p-3">
        <p className="text-sm font-semibold text-slate-800 dark:text-white mb-1">
          {data.symptom}
        </p>
        <p className="text-xs text-slate-600 dark:text-gray-300 mb-1">
          {data.date}
        </p>
        <p className="text-sm font-medium text-primary">
          Severity: {data.severityValue}/10
        </p>
      </div>
    );
  }
  return null;
}

function getSeverityValue(severity: string | number): number {
  if (typeof severity === 'number') return severity;
  
  const severityStr = severity.toLowerCase();
  if (severityStr.includes('0-2') || severityStr.includes('minimal')) return 1;
  if (severityStr.includes('3-6') || severityStr.includes('moderate')) return 5;
  if (severityStr.includes('7-10') || severityStr.includes('severe')) return 8;
  return 5; // default
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
