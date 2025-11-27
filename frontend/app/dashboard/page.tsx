'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MessageSquare, FileText, Pill, BookOpen, TrendingUp, Calendar, Activity, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { SymptomTrackingChart } from '@/components/SymptomTrackingChart';
import { SymptomFrequencyChart } from '@/components/SymptomFrequencyChart';
import { RecentSymptomsTimeline } from '@/components/RecentSymptomsTimeline';
import { HealthInsightsCard } from '@/components/HealthInsightsCard';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [symptomHistory, setSymptomHistory] = useState<any[]>([]);
  const [symptomFrequency, setSymptomFrequency] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState('30');
  const [isLoading, setIsLoading] = useState(true);
  const [healthInsights, setHealthInsights] = useState({
    symptomCount: 0,
    mostCommonSymptom: 'Unknown',
    averageSeverity: 5,
    trend: 'stable' as 'improving' | 'stable' | 'worsening'
  });

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch stats
      const statsRes = await fetch('http://localhost:5000/api/symptoms/stats');
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // Fetch symptom history
      const historyRes = await fetch(`http://localhost:5000/api/symptoms/history?days=${timeRange}`);
      const historyData = await historyRes.json();
      if (historyData.success) {
        setSymptomHistory(historyData.symptoms);
        
        // Calculate frequency
        const frequency: any = {};
        historyData.symptoms.forEach((s: any) => {
          const symptom = s.symptom || 'Unknown';
          frequency[symptom] = (frequency[symptom] || 0) + 1;
        });
        
        const freqArray = Object.entries(frequency)
          .map(([symptom, count]) => ({ symptom, count: count as number }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        
        setSymptomFrequency(freqArray);

        // Calculate health insights
        const avgSeverity = historyData.symptoms.reduce((acc: number, s: any) => {
          const sev = s.severity.toLowerCase();
          if (sev.includes('0-2')) return acc + 1;
          if (sev.includes('3-6')) return acc + 5;
          if (sev.includes('7-10')) return acc + 8;
          return acc + 5;
        }, 0) / (historyData.symptoms.length || 1);

        setHealthInsights({
          symptomCount: historyData.symptoms.length,
          mostCommonSymptom: freqArray[0]?.symptom || 'Unknown',
          averageSeverity: Math.round(avgSeverity),
          trend: avgSeverity < 4 ? 'improving' : avgSeverity > 6 ? 'worsening' : 'stable'
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-medical dark:bg-dark-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Health Dashboard</h1>
            <p className="text-slate-600 dark:text-gray-300">Welcome back! Here's your health overview.</p>
          </div>
          <Button
            onClick={fetchDashboardData}
            variant="ghost"
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<MessageSquare className="w-6 h-6" />}
            title="Total Consultations"
            value={stats?.total_consultations?.toString() || "0"}
            trend={`+${stats?.recent_consultations || 0} this week`}
            trendUp={true}
            delay={0}
            isLoading={isLoading}
          />
          <StatCard
            icon={<Activity className="w-6 h-6" />}
            title="Health Score"
            value={stats?.health_score?.toString() || "85"}
            trend="+5%"
            trendUp={true}
            delay={0.1}
            isLoading={isLoading}
          />
          <StatCard
            icon={<Pill className="w-6 h-6" />}
            title="Symptoms Tracked"
            value={symptomHistory.length.toString()}
            trend={`Last ${timeRange} days`}
            trendUp={true}
            delay={0.2}
            isLoading={isLoading}
          />
          <StatCard
            icon={<FileText className="w-6 h-6" />}
            title="Messages"
            value={stats?.total_messages?.toString() || "0"}
            trend="+8%"
            trendUp={true}
            delay={0.3}
            isLoading={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Symptom Tracking Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                >
                  <option value="7">Last 7 days</option>
                  <option value="14">Last 14 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                </select>
              </div>
              
              {isLoading ? (
                <Card className="p-6 h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-primary mx-auto mb-2 animate-spin" />
                    <p className="text-slate-600 dark:text-gray-300">Loading symptom data...</p>
                  </div>
                </Card>
              ) : symptomHistory.length > 0 ? (
                <SymptomTrackingChart 
                  data={symptomHistory.map(s => ({
                    date: s.date,
                    severity: s.severity,
                    symptom: s.symptom
                  }))}
                  timeRange={`${timeRange} days`}
                />
              ) : (
                <Card className="p-6 h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <Activity className="w-12 h-12 text-primary mx-auto mb-2" />
                    <p className="text-slate-600 dark:text-gray-300">No symptom data yet</p>
                    <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
                      Start using the AI chat to track your symptoms
                    </p>
                    <Link href="/chat">
                      <Button className="mt-4">Start Chat</Button>
                    </Link>
                  </div>
                </Card>
              )}
            </motion.div>

            {/* Symptom Frequency Chart */}
            {symptomFrequency.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <SymptomFrequencyChart data={symptomFrequency} />
              </motion.div>
            )}

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  <ActivityItem
                    icon={<MessageSquare className="w-5 h-5 text-primary" />}
                    title="AI Consultation"
                    description="Discussed headache and fever symptoms"
                    time="2 hours ago"
                  />
                  <ActivityItem
                    icon={<Pill className="w-5 h-5 text-accent" />}
                    title="Medicine Search"
                    description="Searched for Ibuprofen information"
                    time="5 hours ago"
                  />
                  <ActivityItem
                    icon={<FileText className="w-5 h-5 text-blue-500" />}
                    title="Report Generated"
                    description="Downloaded health consultation report"
                    time="1 day ago"
                  />
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Health Insights */}
            {!isLoading && symptomHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <HealthInsightsCard
                  symptomCount={healthInsights.symptomCount}
                  mostCommonSymptom={healthInsights.mostCommonSymptom}
                  averageSeverity={healthInsights.averageSeverity}
                  trend={healthInsights.trend}
                />
              </motion.div>
            )}

            {/* Recent Symptoms Timeline */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <RecentSymptomsTimeline symptoms={symptomHistory} />
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link href="/chat">
                    <Button variant="ghost" className="w-full justify-start">
                      <MessageSquare className="w-5 h-5" />
                      Start AI Chat
                    </Button>
                  </Link>
                  <Link href="/reports">
                    <Button variant="ghost" className="w-full justify-start">
                      <FileText className="w-5 h-5" />
                      View Reports
                    </Button>
                  </Link>
                  <Link href="/resources">
                    <Button variant="ghost" className="w-full justify-start">
                      <Pill className="w-5 h-5" />
                      Search Medicine
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>

            {/* Health Score */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Card className="p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {stats?.health_score || 85}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">Health Score</h3>
                <p className="text-sm text-slate-600 dark:text-gray-300 mb-4">
                  {healthInsights.trend === 'improving' ? 'Improving! Keep it up' : 
                   healthInsights.trend === 'worsening' ? 'Needs attention' : 
                   'Stable and good'}
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <TrendingUp className="w-4 h-4" />
                  <span>Track symptoms to improve</span>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
  delay: number;
  isLoading?: boolean;
}

function StatCard({ icon, title, value, trend, trendUp, delay, isLoading }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
            {icon}
          </div>
          <span className={`text-sm font-medium ${trendUp ? 'text-green-600 dark:text-green-400' : 'text-slate-600 dark:text-gray-400'}`}>
            {trend}
          </span>
        </div>
        {isLoading ? (
          <div className="h-8 bg-slate-200 dark:bg-dark-surface rounded animate-pulse mb-1"></div>
        ) : (
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">{value}</h3>
        )}
        <p className="text-sm text-slate-600 dark:text-gray-300">{title}</p>
      </Card>
    </motion.div>
  );
}

interface ActivityItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
}

function ActivityItem({ icon, title, description, time }: ActivityItemProps) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-dark-surface transition-colors">
      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-dark-surface flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-slate-800 dark:text-white">{title}</h4>
        <p className="text-sm text-slate-600 dark:text-gray-300 truncate">{description}</p>
        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">{time}</p>
      </div>
    </div>
  );
}
