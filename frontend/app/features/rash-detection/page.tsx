'use client';

import { useState, useRef } from 'react';
import { Upload, Camera, X, Loader2, AlertTriangle, CheckCircle, MessageSquare, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface AnalysisResult {
  condition: string;
  confidence: number;
  keyFeatures: string[];
  recommendations: string[];
  severity: 'mild' | 'moderate' | 'severe';
}

interface PhotoQuality {
  isGood: boolean;
  issues: string[];
  score: number;
}

export default function RashDetectionPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [photoQuality, setPhotoQuality] = useState<PhotoQuality | null>(null);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10MB. Please upload a smaller image.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setSelectedImage(imageUrl);
        // Analyze photo quality
        analyzePhotoQuality(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzePhotoQuality = (imageUrl: string) => {
    // Mock photo quality analysis - replace with actual image analysis
    const mockQuality: PhotoQuality = {
      isGood: Math.random() > 0.3,
      issues: Math.random() > 0.5 ? [] : ['Image appears slightly blurry', 'Lighting could be improved'],
      score: Math.floor(Math.random() * 30) + 70 // 70-100
    };
    setPhotoQuality(mockQuality);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const clearImage = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setPhotoQuality(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    
    // Show disclaimer modal if not accepted
    if (!disclaimerAccepted) {
      setShowDisclaimerModal(true);
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    try {
      // Simulate API call - replace with actual backend call
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Mock result - replace with actual API response
      const mockResult: AnalysisResult = {
        condition: 'Contact Dermatitis (Allergic Reaction)',
        confidence: 78,
        keyFeatures: [
          'Red, inflamed patches on skin',
          'Visible swelling in affected area',
          'Pattern suggests contact with irritant',
          'No signs of infection or pus'
        ],
        recommendations: [
          'Avoid contact with potential allergens',
          'Apply cool compress to reduce inflammation',
          'Consider over-the-counter hydrocortisone cream',
          'Monitor for worsening symptoms'
        ],
        severity: 'moderate'
      };
      
      setAnalysisResult(mockResult);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed. Please try again or consult a healthcare professional.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const proceedWithAnalysis = () => {
    setDisclaimerAccepted(true);
    setShowDisclaimerModal(false);
    handleAnalyze();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-dark-background p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-black dark:text-white mb-4">
            AI Medical Image Analysis
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Upload any medical image for AI-powered analysis (skin conditions, X-rays, wounds, etc.)
          </p>
        </div>

        {/* Prominent Disclaimer */}
        <div className="mb-8 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-red-900 dark:text-red-300 mb-2">
                ⚠️ MEDICAL DISCLAIMER
              </h3>
              <p className="text-red-800 dark:text-red-200 text-sm leading-relaxed font-medium">
                This is an AI-powered analysis tool that provides general information and is <strong>NOT a substitute</strong> for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider or dermatologist for accurate diagnosis and treatment.
              </p>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="mb-8">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {!selectedImage ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-300 dark:border-dark-border hover:border-primary hover:bg-gray-50 dark:hover:bg-dark-surface'
              } bg-white dark:bg-dark-surface`}
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Upload className="w-10 h-10 text-primary" />
              </div>
              <p className="text-xl text-black dark:text-white mb-2 font-semibold">
                Upload Rash Photo
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Drag & drop an image here or click to browse
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Supported: JPG, PNG, WEBP • Max size: 10MB
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={selectedImage}
                  alt="Uploaded rash"
                  className="w-full max-h-96 object-contain rounded-xl border-2 border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface"
                />
                <button
                  onClick={clearImage}
                  className="absolute top-4 right-4 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg"
                  title="Remove image"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Photo Quality Assessment */}
              {photoQuality && (
                <div className={`p-4 rounded-lg border-2 ${
                  photoQuality.isGood 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' 
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
                }`}>
                  <div className="flex items-start gap-3">
                    {photoQuality.isGood ? (
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h4 className={`font-semibold mb-1 ${
                        photoQuality.isGood 
                          ? 'text-green-900 dark:text-green-300' 
                          : 'text-yellow-900 dark:text-yellow-300'
                      }`}>
                        Photo Quality: {photoQuality.score}%
                      </h4>
                      {photoQuality.isGood ? (
                        <p className="text-sm text-green-800 dark:text-green-200">
                          ✓ Image quality is good for analysis
                        </p>
                      ) : (
                        <div className="text-sm text-yellow-800 dark:text-yellow-200">
                          <p className="font-medium mb-1">Quality issues detected:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {photoQuality.issues.map((issue, idx) => (
                              <li key={idx}>{issue}</li>
                            ))}
                          </ul>
                          <p className="mt-2 text-xs">Consider retaking the photo for better results.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Analysis Button */}
        {selectedImage && !analysisResult && (
          <div className="mb-8 text-center">
            <Button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="px-10 py-5 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold transition-colors inline-flex items-center gap-3 text-lg shadow-lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Analyzing Image...
                </>
              ) : (
                <>
                  <Camera className="w-6 h-6" />
                  Analyze Rash
                </>
              )}
            </Button>
          </div>
        )}

        {/* Analysis Result */}
        {analysisResult && (
          <div className="mb-8 space-y-6">
            {/* Main Result Card */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-xl p-6">
              <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-300 mb-4">
                Analysis Result
              </h3>
              
              {/* Condition and Confidence */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-200">
                    Potential Condition:
                  </h4>
                  <span className={`px-4 py-1 rounded-full text-sm font-bold ${
                    analysisResult.confidence >= 80 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : analysisResult.confidence >= 60
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    {analysisResult.confidence}% Confidence
                  </span>
                </div>
                <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                  {analysisResult.condition}
                </p>
              </div>

              {/* Key Features */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-3">
                  Key Features Detected:
                </h4>
                <ul className="space-y-2">
                  {analysisResult.keyFeatures.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-blue-800 dark:text-blue-200">
                      <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-3">
                  Recommendations:
                </h4>
                <ul className="space-y-2">
                  {analysisResult.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-blue-800 dark:text-blue-200">
                      <span className="text-blue-600 dark:text-blue-400 mt-1">✓</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Severity Badge */}
              <div className="mb-6">
                <span className={`inline-block px-4 py-2 rounded-lg font-semibold ${
                  analysisResult.severity === 'mild'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : analysisResult.severity === 'moderate'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                }`}>
                  Severity: {analysisResult.severity.charAt(0).toUpperCase() + analysisResult.severity.slice(1)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Link href="/chat">
                  <Button className="bg-primary hover:bg-primary/90 text-white inline-flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Discuss with AI Doctor
                  </Button>
                </Link>
                <Button 
                  onClick={clearImage}
                  className="bg-gray-600 hover:bg-gray-700 text-white"
                >
                  Analyze Another Image
                </Button>
              </div>
            </div>

            {/* Reminder Disclaimer */}
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-xl p-4">
              <p className="text-red-800 dark:text-red-200 text-sm font-medium">
                <strong>Remember:</strong> This AI analysis is not a medical diagnosis. Please consult a healthcare professional for proper evaluation and treatment.
              </p>
            </div>
          </div>
        )}

        {/* Guidelines */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-300 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Good Photo Tips
            </h3>
            <ul className="space-y-2 text-green-800 dark:text-green-200 text-sm">
              <li>• Use natural daylight (not direct sunlight)</li>
              <li>• Hold camera 6-12 inches from skin</li>
              <li>• Focus clearly on the affected area</li>
              <li>• Include surrounding healthy skin</li>
              <li>• Avoid using flash</li>
            </ul>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-300 mb-3 flex items-center gap-2">
              <X className="w-5 h-5" />
              Avoid These
            </h3>
            <ul className="space-y-2 text-red-800 dark:text-red-200 text-sm">
              <li>• Blurry or out-of-focus images</li>
              <li>• Extreme lighting (too dark/bright)</li>
              <li>• Photos taken from too far away</li>
              <li>• Using filters or editing</li>
              <li>• Covering rash with makeup/cream</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Disclaimer Modal */}
      {showDisclaimerModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-secondary rounded-2xl max-w-2xl w-full p-8 shadow-2xl">
            <div className="flex items-start gap-4 mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold text-black dark:text-white mb-2">
                  Important Medical Disclaimer
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Before proceeding, please read and understand the following:
                </p>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-xl p-6 mb-6">
              <ul className="space-y-3 text-red-900 dark:text-red-200">
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>This AI analysis provides <strong>general information only</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>It is <strong>NOT a medical diagnosis</strong> or professional medical advice</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>Always consult a qualified healthcare provider or dermatologist</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>Seek immediate medical attention for severe symptoms or spreading rashes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>Do not use this tool to delay seeking professional medical care</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={proceedWithAnalysis}
                className="flex-1 bg-primary hover:bg-primary/90 text-white py-4 text-lg font-semibold"
              >
                I Understand and Agree
              </Button>
              <Button
                onClick={() => setShowDisclaimerModal(false)}
                className="px-8 bg-gray-300 hover:bg-gray-400 text-gray-800 py-4"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
