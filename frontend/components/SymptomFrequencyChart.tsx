'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card } from '@/components/ui/Card';

interface SymptomFrequency {
  symptom: string;
  count: number;
}

interface SymptomFrequencyChartProps {
  data: SymptomFrequency[];
}

const COLORS = ['#14b8a6', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b'];

export function SymptomFrequencyChart({ data }: SymptomFrequencyChartProps) {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-white">Most Common Symptoms</h3>
        <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">
          Your symptom frequency over the last 30 days
        </p>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
          <XAxis type="number" stroke="#64748b" style={{ fontSize: '12px' }} />
          <YAxis 
            dataKey="symptom" 
            type="category" 
            stroke="#64748b" 
            style={{ fontSize: '12px' }}
            width={100}
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(20, 184, 166, 0.1)' }}
          />
          <Bar dataKey="count" radius={[0, 8, 8, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg shadow-lg p-3">
        <p className="text-sm font-semibold text-slate-800 dark:text-white">
          {payload[0].payload.symptom}
        </p>
        <p className="text-sm text-primary font-medium mt-1">
          {payload[0].value} occurrences
        </p>
      </div>
    );
  }
  return null;
}
