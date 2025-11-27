'use client';

import { Card } from '@/components/ui/Card';
import { Lightbulb, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';

interface HealthInsightsCardProps {
  symptomCount: number;
  mostCommonSymptom: string;
  averageSeverity: number;
  trend: 'improving' | 'stable' | 'worsening';
}

export function HealthInsightsCard({ 
  symptomCount, 
  mostCommonSymptom, 
  averageSeverity,
  trend 
}: HealthInsightsCardProps) {
  const insights = generateInsights(symptomCount, mostCommonSymptom, averageSeverity, trend);

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Health Insights</h3>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-white/50 dark:bg-dark-surface/50 rounded-lg">
            <div className="flex-shrink-0 mt-0.5">
              {insight.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-700 dark:text-gray-300">
                {insight.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
        <p className="text-xs text-slate-600 dark:text-gray-400 text-center">
          💡 These insights are generated based on your symptom patterns
        </p>
      </div>
    </Card>
  );
}

function generateInsights(
  symptomCount: number,
  mostCommonSymptom: string,
  averageSeverity: number,
  trend: 'improving' | 'stable' | 'worsening'
) {
  const insights = [];

  // Trend insight
  if (trend === 'improving') {
    insights.push({
      icon: <TrendingDown className="w-4 h-4 text-green-600 dark:text-green-400" />,
      text: "Great news! Your symptom severity is trending downward. Keep up the good work!"
    });
  } else if (trend === 'worsening') {
    insights.push({
      icon: <TrendingUp className="w-4 h-4 text-red-600 dark:text-red-400" />,
      text: "Your symptoms are increasing. Consider consulting a healthcare professional if this continues."
    });
  } else {
    insights.push({
      icon: <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      text: "Your symptoms are stable. Continue monitoring and maintaining your current health routine."
    });
  }

  // Frequency insight
  if (symptomCount > 5) {
    insights.push({
      icon: <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />,
      text: `You've tracked ${symptomCount} symptoms recently. Consider identifying common triggers.`
    });
  } else if (symptomCount > 0) {
    insights.push({
      icon: <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      text: `You've tracked ${symptomCount} symptom${symptomCount > 1 ? 's' : ''}. Regular tracking helps identify patterns.`
    });
  }

  // Most common symptom insight
  if (mostCommonSymptom && mostCommonSymptom !== 'Unknown') {
    insights.push({
      icon: <Lightbulb className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
      text: `${mostCommonSymptom} is your most frequent symptom. Consider lifestyle factors that might contribute.`
    });
  }

  // Severity insight
  if (averageSeverity > 6) {
    insights.push({
      icon: <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />,
      text: "Your average symptom severity is high. Please consult a healthcare professional."
    });
  } else if (averageSeverity < 4) {
    insights.push({
      icon: <TrendingDown className="w-4 h-4 text-green-600 dark:text-green-400" />,
      text: "Your symptoms are generally mild. Continue your current health practices."
    });
  }

  return insights.slice(0, 3); // Return max 3 insights
}
