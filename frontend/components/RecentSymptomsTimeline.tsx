'use client';

import { Card } from '@/components/ui/Card';
import { Clock, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

interface Symptom {
  date: string;
  symptom: string;
  severity: string;
}

interface RecentSymptomsTimelineProps {
  symptoms: Symptom[];
}

export function RecentSymptomsTimeline({ symptoms }: RecentSymptomsTimelineProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Recent Symptoms</h3>
      </div>

      <div className="space-y-4">
        {symptoms.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-gray-400">
            <p className="text-sm">No recent symptoms tracked</p>
          </div>
        ) : (
          symptoms.slice(0, 5).map((symptom, index) => (
            <div key={index} className="flex items-start gap-3 pb-4 border-b border-slate-100 dark:border-dark-border last:border-0">
              <div className="flex-shrink-0 mt-1">
                {getSeverityIcon(symptom.severity)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-white capitalize">
                    {symptom.symptom}
                  </h4>
                  {getSeverityBadge(symptom.severity)}
                </div>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                  {formatDate(symptom.date)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

function getSeverityIcon(severity: string) {
  const severityLower = severity.toLowerCase();
  
  if (severityLower.includes('0-2') || severityLower.includes('minimal')) {
    return (
      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
      </div>
    );
  }
  
  if (severityLower.includes('3-6') || severityLower.includes('moderate')) {
    return (
      <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
        <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
      </div>
    );
  }
  
  return (
    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
    </div>
  );
}

function getSeverityBadge(severity: string) {
  const severityLower = severity.toLowerCase();
  
  if (severityLower.includes('0-2') || severityLower.includes('minimal')) {
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
        Mild
      </span>
    );
  }
  
  if (severityLower.includes('3-6') || severityLower.includes('moderate')) {
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
        Moderate
      </span>
    );
  }
  
  return (
    <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
      Severe
    </span>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
