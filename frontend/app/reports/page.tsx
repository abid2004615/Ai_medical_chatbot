'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText, Download, Eye, Calendar, AlertCircle, CheckCircle, AlertTriangle, RefreshCw, Printer } from 'lucide-react';
import Link from 'next/link';

interface Report {
  report_id: string;
  symptom: string;
  severity: string;
  created_at: string;
  session_id: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isViewingReport, setIsViewingReport] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/reports/list');
      const data = await response.json();
      if (data.success) {
        setReports(data.reports);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const viewReport = async (reportId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/reports/${reportId}`);
      const data = await response.json();
      if (data.success) {
        setSelectedReport(data.report);
        setIsViewingReport(true);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    }
  };

  const downloadReport = (report: any) => {
    const htmlContent = generateReportHTML(report);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-report-${report.report_id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    window.print();
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
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
              📄 Health Reports
            </h1>
            <p className="text-slate-600 dark:text-gray-300">
              View and download your consultation reports
            </p>
          </div>
          <Button
            onClick={fetchReports}
            variant="ghost"
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </motion.div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 mb-8 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white mb-1">
                  About Health Reports
                </h3>
                <p className="text-sm text-slate-600 dark:text-gray-300">
                  After each consultation, a comprehensive report is generated including your symptoms, 
                  analysis, recommendations, and medical advice. Download reports to share with your doctor.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Reports List or Detail View */}
        {!isViewingReport ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard
                icon={<FileText className="w-6 h-6" />}
                title="Total Reports"
                value={reports.length.toString()}
                delay={0.2}
              />
              <StatCard
                icon={<Calendar className="w-6 h-6" />}
                title="This Month"
                value={reports.filter(r => isThisMonth(r.created_at)).length.toString()}
                delay={0.3}
              />
              <StatCard
                icon={<CheckCircle className="w-6 h-6" />}
                title="Completed"
                value={reports.length.toString()}
                delay={0.4}
              />
            </div>

            {/* Reports Grid */}
            {isLoading ? (
              <Card className="p-12 text-center">
                <RefreshCw className="w-8 h-8 text-primary mx-auto mb-2 animate-spin" />
                <p className="text-slate-600 dark:text-gray-300">Loading reports...</p>
              </Card>
            ) : reports.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="w-16 h-16 text-slate-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                  No Reports Yet
                </h3>
                <p className="text-slate-600 dark:text-gray-300 mb-6">
                  Complete a symptom assessment to generate your first health report
                </p>
                <Link href="/chat">
                  <Button>Start Assessment</Button>
                </Link>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report, index) => (
                  <ReportCard
                    key={report.report_id}
                    report={report}
                    onView={() => viewReport(report.report_id)}
                    delay={0.1 * index}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          /* Report Detail View */
          <ReportDetailView
            report={selectedReport}
            onBack={() => setIsViewingReport(false)}
            onDownload={() => downloadReport(selectedReport)}
            onPrint={printReport}
          />
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  delay: number;
}

function StatCard({ icon, title, value, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
            {icon}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{value}</h3>
            <p className="text-sm text-slate-600 dark:text-gray-300">{title}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

interface ReportCardProps {
  report: Report;
  onView: () => void;
  delay: number;
}

function ReportCard({ report, onView, delay }: ReportCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={onView}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {getSeverityIcon(report.severity)}
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-white capitalize">
                {report.symptom}
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                {formatDate(report.created_at)}
              </p>
            </div>
          </div>
          {getSeverityBadge(report.severity)}
        </div>

        <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-dark-border">
          <Button variant="ghost" size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); onView(); }}>
            <Eye className="w-4 h-4 mr-2" />
            View
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

interface ReportDetailViewProps {
  report: any;
  onBack: () => void;
  onDownload: () => void;
  onPrint: () => void;
}

function ReportDetailView({ report, onBack, onDownload, onPrint }: ReportDetailViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Card className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-200 dark:border-dark-border">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
              Health Report
            </h2>
            <p className="text-sm text-slate-600 dark:text-gray-300">
              Report ID: {report.report_id}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onPrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="ghost" onClick={onDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button onClick={onBack}>
              Back to List
            </Button>
          </div>
        </div>

        {/* Report Content */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600 dark:text-gray-400 mb-1">Symptom</p>
              <p className="font-semibold text-slate-800 dark:text-white capitalize">{report.symptom}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-gray-400 mb-1">Severity</p>
              <div className="flex items-center gap-2">
                {getSeverityBadge(report.severity)}
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-gray-400 mb-1">Date</p>
              <p className="font-semibold text-slate-800 dark:text-white">{formatDate(report.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-gray-400 mb-1">Age Group</p>
              <p className="font-semibold text-slate-800 dark:text-white">{report.age}</p>
            </div>
          </div>

          {/* Analysis */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-3">
              Medical Analysis
            </h3>
            <div className="bg-slate-50 dark:bg-dark-surface rounded-lg p-4">
              <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-gray-300 font-sans">
                {report.analysis}
              </pre>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-slate-700 dark:text-gray-300">
              ⚠️ <strong>Medical Disclaimer:</strong> This report is for informational purposes only and does not constitute medical advice. 
              Please consult a healthcare professional for proper diagnosis and treatment.
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function getSeverityIcon(severity: string) {
  const severityLower = severity.toLowerCase();
  
  if (severityLower.includes('0-2') || severityLower.includes('minimal')) {
    return (
      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
      </div>
    );
  }
  
  if (severityLower.includes('3-6') || severityLower.includes('moderate')) {
    return (
      <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
        <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
      </div>
    );
  }
  
  return (
    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
    </div>
  );
}

function getSeverityBadge(severity: string) {
  const severityLower = severity.toLowerCase();
  
  if (severityLower.includes('0-2') || severityLower.includes('minimal')) {
    return (
      <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
        Mild
      </span>
    );
  }
  
  if (severityLower.includes('3-6') || severityLower.includes('moderate')) {
    return (
      <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
        Moderate
      </span>
    );
  }
  
  return (
    <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
      Severe
      </span>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric',
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function isThisMonth(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

function generateReportHTML(report: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Health Report - ${report.report_id}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
    h1 { color: #14b8a6; border-bottom: 3px solid #14b8a6; padding-bottom: 10px; }
    .section { margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; }
    .label { font-weight: bold; color: #555; }
    .disclaimer { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-top: 30px; }
    pre { white-space: pre-wrap; font-family: Arial, sans-serif; }
  </style>
</head>
<body>
  <h1>🏥 Health Consultation Report</h1>
  
  <div class="section">
    <p><span class="label">Report ID:</span> ${report.report_id}</p>
    <p><span class="label">Generated:</span> ${formatDate(report.generated_at)}</p>
    <p><span class="label">Symptom:</span> ${report.symptom}</p>
    <p><span class="label">Severity:</span> ${report.severity}</p>
    <p><span class="label">Age Group:</span> ${report.age}</p>
  </div>

  <div class="section">
    <h2>Medical Analysis</h2>
    <pre>${report.analysis}</pre>
  </div>

  <div class="disclaimer">
    <strong>⚠️ Medical Disclaimer:</strong> This report is for informational purposes only and does not constitute medical advice. 
    Please consult a healthcare professional for proper diagnosis and treatment.
  </div>
</body>
</html>
  `;
}
