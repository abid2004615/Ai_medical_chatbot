'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { MessageSquare, Pill, FileText, BarChart3, ArrowRight, Image, ClipboardList } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-background w-full">
      {/* Hero Section */}
      <section className="py-20 px-8 w-full">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-black dark:text-white leading-tight mb-6">
            Your AI Health Assistant
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto">
            MediChat helps you analyze symptoms, find medicine information, and keep track of your health in one secure place.
          </p>
          
          <Link href="/chat">
            <Button className="bg-black dark:bg-primary text-white hover:bg-gray-800 dark:hover:bg-primary/90 px-8 py-4 text-lg">
              Start Diagnosis
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-8 bg-white dark:bg-dark-background w-full">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/chat">
              <FeatureCard
                icon={<MessageSquare className="w-6 h-6" />}
                title="AI Chat"
                description="24/7 symptom analysis & personalized recommendations"
              />
            </Link>
            <Link href="/symptom-checker">
              <FeatureCard
                icon={<ClipboardList className="w-6 h-6" />}
                title="Quick Symptom Checker"
                description="6-step guided headache assessment (Adults 18+)"
                highlight={true}
              />
            </Link>
            <Link href="/features/medicine">
              <FeatureCard
                icon={<Pill className="w-6 h-6" />}
                title="Medicine Info"
                description="OTC medicine uses, safety, age limits"
              />
            </Link>
            <Link href="/reports">
              <FeatureCard
                icon={<FileText className="w-6 h-6" />}
                title="Health Reports"
                description="Downloadable summaries & medical PDFs"
              />
            </Link>
            <Link href="/dashboard">
              <FeatureCard
                icon={<BarChart3 className="w-6 h-6" />}
                title="Dashboard"
                description="Track health trends & weekly check-ins"
              />
            </Link>
            <Link href="/features/rash-detection">
              <FeatureCard
                icon={<Image className="w-6 h-6" />}
                title="Medical Image Analysis"
                description="AI-powered analysis of any medical image"
              />
            </Link>
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-20 px-8 bg-black dark:bg-dark-secondary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to take control of your health?
          </h2>
          <p className="text-lg text-gray-300 dark:text-gray-400 mb-8">
            Join thousands of users who trust MediChat for their health guidance.
          </p>
          <Link href="/chat">
            <Button className="bg-white dark:bg-primary text-black dark:text-white hover:bg-gray-100 dark:hover:bg-primary/90 px-8 py-4 text-lg">
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: boolean;
}

function FeatureCard({ icon, title, description, highlight }: FeatureCardProps) {
  return (
    <div className={`p-8 bg-white dark:bg-dark-surface border ${highlight ? 'border-teal-500 ring-2 ring-teal-200' : 'border-gray-200 dark:border-dark-border'} rounded-lg hover:shadow-lg dark:hover:shadow-primary/10 transition-all hover:-translate-y-1 cursor-pointer`}>
      {highlight && (
        <div className="inline-block px-2 py-1 bg-teal-100 text-teal-700 text-xs font-semibold rounded mb-3">
          NEW
        </div>
      )}
      <div className={`w-12 h-12 rounded-lg ${highlight ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 dark:bg-dark-surface-light text-black dark:text-white'} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-black dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
    </div>
  );
}
