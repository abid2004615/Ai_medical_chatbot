"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Volume2, VolumeX, Paperclip } from "lucide-react";
import { EmergencyBanner } from "@/components/MedicalDisclaimer";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { VoiceInputAnimation } from "@/components/VoiceInputAnimation";

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

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "🏥 Hello! I'm your AI-powered health assistant.\n\nI can help you with ANY symptom - headache, ear pain, jaw pain, leg swelling, or anything else.\n\nJust tell me what symptom you're experiencing, and I'll ask you a few questions to provide personalized medical guidance.\n\nWhat symptom would you like to discuss?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(`session-${Date.now()}`);
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Voice hooks
  const { isListening, startListening, stopListening, error: speechError } = useSpeechRecognition();
  const { isSpeaking, speak, stop: stopSpeaking, error: ttsError } = useTextToSpeech();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-speak assistant messages if enabled
  useEffect(() => {
    if (autoSpeak && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "assistant" && !isLoading) {
        speak(lastMessage.content);
      }
    }
  }, [messages, autoSpeak, isLoading, speak]);

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((transcript) => {
        setInput(transcript);
      });
    }
  };

  const toggleAutoSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
    }
    setAutoSpeak(!autoSpeak);
  };

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
        
        const questionText = data.question?.text || "";
        const messageContent = data.message 
          ? `${data.message}\n\n${questionText}` 
          : `Let's assess your ${symptom}. I'll ask you a few questions.\n\n${questionText}`;
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: messageContent,
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
          const questionText = data.question?.text || "Next question:";
          const messageContent = data.message 
            ? `${data.message}\n\n${questionText}` 
            : questionText;
          
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: messageContent,
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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
          content: "Thank you for using the AI Health Assistant. Take care and feel better soon! 💚",
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

  return (
    <div className="flex h-screen bg-gray-100">
      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col bg-[#F5F7FA]">
        {/* Emergency Banner */}
        <EmergencyBanner />

        {/* Header */}
        <div className="px-4 py-3 bg-white border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center">
              <span className="text-white text-xl">🏥</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AI Health Assistant</h1>
              <p className="text-xs font-medium text-gray-600">
                {isListening ? "🎤 Listening..." : isSpeaking ? "🔊 Speaking..." : "Online • Ready to help"}
              </p>
            </div>
          </div>
          
          {/* Voice Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleAutoSpeak}
              className={`p-2 rounded-lg transition ${
                autoSpeak
                  ? "bg-teal-100 text-teal-600"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
              title={autoSpeak ? "Auto-speak enabled" : "Auto-speak disabled"}
            >
              {autoSpeak ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
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
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-teal-500 text-white"
                    : "bg-white text-gray-900 shadow-sm"
                }`}
              >
                <p className="text-sm font-bold whitespace-pre-wrap leading-relaxed">{message.content}</p>
                
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
                
                {/* Show option buttons for assistant messages */}
                {message.role === "assistant" && message.options && message.options.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleOptionClick(option)}
                        disabled={isLoading}
                        className="px-3 py-2 text-sm font-semibold bg-teal-50 text-teal-800 rounded-lg hover:bg-teal-100 hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed border-2 border-teal-300"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
                
                <p
                  className={`text-xs mt-1 font-medium ${
                    message.role === "user" ? "text-teal-100" : "text-gray-500"
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
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
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
              <button className="p-2 text-gray-500 hover:text-teal-500 transition">
                <Paperclip className="w-5 h-5" />
              </button>
              
              <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2 flex items-center gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isListening ? "Listening..." : assessmentStarted ? "Type or speak your answer..." : "Type or speak your symptom..."}
                  className="flex-1 bg-transparent outline-none resize-none max-h-32 text-sm font-medium text-gray-900 placeholder:text-gray-500"
                  rows={1}
                  disabled={isLoading || isListening}
                />
              </div>

              <button
                onClick={handleVoiceInput}
                disabled={isLoading}
                className={`p-2 rounded-lg transition ${
                  isListening
                    ? "bg-red-500 text-white animate-pulse"
                    : "text-gray-500 hover:text-teal-500 hover:bg-gray-100"
                }`}
                title={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-3 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            
            {/* Error messages */}
            {(speechError || ttsError) && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 text-center">
                {speechError || ttsError}
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-2 text-center">
              {isListening ? "🎤 Speak now..." : "⚠️ This is not a substitute for professional medical advice"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
