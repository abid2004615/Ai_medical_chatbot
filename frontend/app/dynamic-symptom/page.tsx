"use client";

import { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  options?: string[];
  progress?: {
    current: number;
    total: number;
    percentage: number;
  };
}

export default function DynamicSymptomPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "🏥 Welcome to the AI-Powered Symptom Checker!\n\nI can help you with ANY symptom - headache, ear pain, jaw pain, leg swelling, or anything else.\n\nJust tell me what symptom you're experiencing, and I'll ask you a few questions to provide personalized medical guidance.\n\nWhat symptom would you like to discuss?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(`session-${Date.now()}`);
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startAssessment = async (symptom: string) => {
    try {
      const response = await fetch("http://localhost:5000/api/dynamic/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          symptom: symptom,
          session_id: sessionId 
        }),
      });

      if (!response.ok) throw new Error("Failed to start assessment");

      const data = await response.json();
      
      if (data.success) {
        setAssessmentStarted(true);
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.message || `Let's assess your ${symptom}. I'll ask you a few questions.`,
          timestamp: new Date(),
          options: data.question?.options || [],
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I'm having trouble starting the assessment. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const answerQuestion = async (answer: string) => {
    try {
      const response = await fetch("http://localhost:5000/api/dynamic/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          answer: answer,
          session_id: sessionId 
        }),
      });

      if (!response.ok) throw new Error("Failed to process answer");

      const data = await response.json();
      
      if (data.success) {
        if (data.status === "continue") {
          // More questions to answer
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.message || "Thank you. Next question:",
            timestamp: new Date(),
            options: data.question?.options || [],
            progress: data.progress,
          };

          setMessages((prev) => [...prev, assistantMessage]);
        } else if (data.status === "complete") {
          // Assessment complete - show analysis
          setAssessmentStarted(false);
          
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.formatted_response || "Assessment complete!",
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, assistantMessage]);
          
          // Add option to start new assessment
          setTimeout(() => {
            const newAssessmentMessage: Message = {
              id: (Date.now() + 2).toString(),
              role: "assistant",
              content: "Would you like to check another symptom?",
              timestamp: new Date(),
              options: ["Yes, check another symptom", "No, I'm done"],
            };
            setMessages((prev) => [...prev, newAssessmentMessage]);
          }, 1000);
        }
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I'm having trouble processing your answer. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageText = input;
    setInput("");
    setIsLoading(true);

    try {
      if (!assessmentStarted) {
        // Start new assessment with the symptom
        await startAssessment(messageText);
      } else {
        // Answer current question
        await answerQuestion(messageText);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionClick = async (option: string) => {
    if (isLoading) return;

    // Check if user wants to start new assessment
    if (option === "Yes, check another symptom") {
      setMessages([
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Great! What symptom would you like to discuss?",
          timestamp: new Date(),
        },
      ]);
      setAssessmentStarted(false);
      return;
    }

    if (option === "No, I'm done") {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Thank you for using the AI Symptom Checker. Take care and feel better soon! 💚",
          timestamp: new Date(),
        },
      ]);
      return;
    }

    // Add user message with the selected option
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: option,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      await answerQuestion(option);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col bg-[#F5F7FA]">
        {/* Header */}
        <div className="px-4 py-3 bg-white border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center">
                <span className="text-white text-xl">🤖</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Symptom Checker</h1>
                <p className="text-xs font-medium text-gray-600">
                  Works for ANY symptom • Powered by AI
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-gradient-to-br from-teal-500 to-blue-500 text-white"
                    : "bg-white text-gray-900 shadow-sm"
                }`}
              >
                <p className="text-sm font-medium whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </p>
                
                {/* Progress indicator */}
                {message.progress && (
                  <div className="mt-3 mb-2">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{message.progress.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${message.progress.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {/* Option buttons */}
                {message.role === "assistant" && message.options && message.options.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleOptionClick(option)}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-semibold bg-teal-50 text-teal-800 rounded-xl hover:bg-teal-100 hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed border-2 border-teal-200"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
                
                <p
                  className={`text-xs mt-1 font-medium ${
                    message.role === "user" ? "text-white/80" : "text-gray-500"
                  }`}
                  suppressHydrationWarning
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-2">
              <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2 flex items-center gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={assessmentStarted ? "Type your answer..." : "Type your symptom (e.g., headache, ear pain)..."}
                  className="flex-1 bg-transparent outline-none resize-none max-h-32 text-sm font-medium text-gray-900 placeholder:text-gray-500"
                  rows={1}
                  disabled={isLoading}
                />
              </div>

              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-3 bg-gradient-to-br from-teal-500 to-blue-500 text-white rounded-full hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-2 text-center">
              ⚠️ AI-generated medical information • Not a substitute for professional advice
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
