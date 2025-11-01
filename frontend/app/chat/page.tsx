"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ChatMessage, Message } from "@/components/chat/ChatMessage"
import { ChatInput } from "@/components/chat/ChatInput"
import { VoiceRecorder } from "@/components/chat/VoiceRecorder"
import { ImageUploader } from "@/components/chat/ImageUploader"
import { apiClient, getSessionId, ApiError } from "@/lib/api-client"

export default function ChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionId] = useState(() => getSessionId())
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [inputValue, setInputValue] = useState("")
  const [activeView, setActiveView] = useState("chat")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Symptom Analyzer states
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [symptomInput, setSymptomInput] = useState("")
  const [symptomAnalysis, setSymptomAnalysis] = useState<string>("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  // Medication Explorer states
  const [medicationSearch, setMedicationSearch] = useState("")
  const [medicationInfo, setMedicationInfo] = useState<string>("")
  const [isSearchingMed, setIsSearchingMed] = useState(false)

  // Load messages from sessionStorage on mount
  useEffect(() => {
    const savedMessages = sessionStorage.getItem("chat_messages")
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages)
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }))
        
        // Remove duplicate greetings if they exist
        const uniqueMessages = messagesWithDates.filter((msg: Message, index: number) => {
          if (index === 0) return true // Keep first message
          // Remove if it's a duplicate greeting
          const isGreeting = msg.text.includes("How are you doing today")
          const prevIsGreeting = messagesWithDates[index - 1]?.text.includes("How are you doing today")
          return !(isGreeting && prevIsGreeting)
        })
        
        setMessages(uniqueMessages)
      } catch (e) {
        console.error("Failed to load messages:", e)
      }
    } else {
      // Add welcome message if no history
      addBotMessage(
        "Hi! How are you doing today? What's on your mind? Do you have a health concern or just want to chat? I'm here to listen and help if I can."
      )
    }
  }, [])

  // Save messages to sessionStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem("chat_messages", JSON.stringify(messages))
    }
  }, [messages])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const addUserMessage = (text: string, imageUrl?: string) => {
    const newMessage: Message = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text,
      sender: "user",
      timestamp: new Date(),
      imageUrl,
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const addBotMessage = (text: string, audioUrl?: string, transcription?: string) => {
    const newMessage: Message = {
      id: `bot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text,
      sender: "bot",
      timestamp: new Date(),
      audioUrl,
      transcription,
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const showTypingIndicator = () => {
    const typingMessage: Message = {
      id: "typing",
      text: "Typing...",
      sender: "bot",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, typingMessage])
  }

  const removeTypingIndicator = () => {
    setMessages((prev) => prev.filter((msg) => msg.id !== "typing"))
  }

  const handleSendMessage = async (text: string) => {
    setError(null)
    setInputValue("") // Clear input immediately
    addUserMessage(text)
    setIsLoading(true)
    showTypingIndicator()

    try {
      const response = await apiClient.sendMessage({
        message: text,
        sessionId,
      })

      removeTypingIndicator()
      addBotMessage(response.response, response.audio_url)
    } catch (err) {
      removeTypingIndicator()
      const errorMessage = err instanceof ApiError ? err.message : "Failed to send message. Please try again."
      setError(errorMessage)
      addBotMessage(`Sorry, I encountered an error: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoiceRecording = async (audioBlob: Blob) => {
    setError(null)
    addUserMessage("🎤 Voice message")
    setIsLoading(true)
    showTypingIndicator()

    try {
      const response = await apiClient.sendVoice(audioBlob)

      removeTypingIndicator()
      addBotMessage(response.response, response.audio_url, response.transcription)
    } catch (err) {
      removeTypingIndicator()
      const errorMessage = err instanceof ApiError ? err.message : "Failed to process voice message. Please try again."
      setError(errorMessage)
      addBotMessage(`Sorry, I encountered an error: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageSelect = async (file: File) => {
    setError(null)

    // Create preview URL
    const imageUrl = URL.createObjectURL(file)
    addUserMessage("📸 Image uploaded", imageUrl)
    setIsLoading(true)
    showTypingIndicator()

    try {
      const response = await apiClient.uploadImage(file)

      removeTypingIndicator()
      addBotMessage(response.response, response.audio_url)
    } catch (err) {
      removeTypingIndicator()
      const errorMessage = err instanceof ApiError ? err.message : "Failed to process image. Please try again."
      setError(errorMessage)
      addBotMessage(`Sorry, I encountered an error: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlayAudio = (url: string) => {
    // Stop current audio if playing
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
    }

    // Build full URL if it's a relative path
    const audioUrl = url.startsWith("http") ? url : `http://localhost:5000${url}`

    // Create and play new audio
    const audio = new Audio(audioUrl)
    audio.play().catch((err) => {
      console.error("Failed to play audio:", err)
      setError("Failed to play audio response")
    })

    setCurrentAudio(audio)
  }

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text).catch((err) => {
      console.error("Failed to copy:", err)
    })
  }

  const handleError = (err: Error) => {
    setError(err.message)
  }

  // Symptom Analyzer handlers
  const addSymptom = (symptom: string) => {
    if (symptom.trim() && !symptoms.includes(symptom.trim())) {
      setSymptoms([...symptoms, symptom.trim()])
      setSymptomInput("")
    }
  }

  const removeSymptom = (symptom: string) => {
    setSymptoms(symptoms.filter(s => s !== symptom))
  }

  const analyzeSymptoms = async () => {
    if (symptoms.length === 0) return
    
    setIsAnalyzing(true)
    setError(null)
    
    try {
      const symptomText = symptoms.join(", ")
      const response = await apiClient.sendMessage({
        message: `Analyze these symptoms: ${symptomText}`,
        sessionId: sessionId
      })
      setSymptomAnalysis(response.response)
    } catch (err) {
      const error = err as ApiError
      setError(error.message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Medication Explorer handlers
  const searchMedication = async (medName: string) => {
    if (!medName.trim()) return
    
    setIsSearchingMed(true)
    setError(null)
    
    try {
      const response = await apiClient.sendMessage({
        message: `Tell me about the medication: ${medName}`,
        sessionId: sessionId
      })
      setMedicationInfo(response.response)
    } catch (err) {
      const error = err as ApiError
      setError(error.message)
    } finally {
      setIsSearchingMed(false)
    }
  }

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <button 
            onClick={() => router.push('/')}
            className="back-btn-sidebar"
            title="Back to home"
          >
            ← Back
          </button>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeView === "chat" ? "active" : ""}`}
            onClick={() => setActiveView("chat")}
          >
            <span className="icon">💬</span>
            <span>Chat</span>
          </button>
          <button 
            className={`nav-item ${activeView === "symptom-checker" ? "active" : ""}`}
            onClick={() => setActiveView("symptom-checker")}
          >
            <span className="icon">🔍</span>
            <span>Symptom Checker</span>
          </button>
          <button 
            className={`nav-item ${activeView === "health-records" ? "active" : ""}`}
            onClick={() => setActiveView("health-records")}
          >
            <span className="icon">📋</span>
            <span>Health Records</span>
          </button>
          <button 
            className={`nav-item ${activeView === "medications" ? "active" : ""}`}
            onClick={() => setActiveView("medications")}
          >
            <span className="icon">💊</span>
            <span>Medications</span>
          </button>
        </nav>

        <div className="sidebar-footer">
        </div>
      </div>

      {/* Chat Main Area */}
      <div className="chat-main">
        {/* Header */}
        <div className="chat-header">
          <div className="header-left">
            <div className="header-logo">
              <span className="logo-icon">⚕️</span>
              <span className="logo-text">MediChat</span>
            </div>
            <h1 className="page-title">
              {activeView === "chat" && "Chat"}
              {activeView === "symptom-checker" && "Symptom Checker"}
              {activeView === "health-records" && "Health Records"}
              {activeView === "medications" && "Medications"}
              {activeView === "settings" && "Settings"}
              {activeView === "help" && "Help"}
            </h1>
          </div>
          <div className="header-actions">
            <button 
              className={`header-action-btn ${activeView === "settings" ? "active" : ""}`}
              onClick={() => setActiveView("settings")}
              title="Settings"
            >
              <span className="icon">⚙️</span>
            </button>
            <button 
              className={`header-action-btn ${activeView === "help" ? "active" : ""}`}
              onClick={() => setActiveView("help")}
              title="Help"
            >
              <span className="icon">❓</span>
            </button>
          </div>
        </div>

        {/* Chat View */}
        {activeView === "chat" && (
        <>
          <div className="chat-messages">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onPlayAudio={handlePlayAudio}
                onCopyText={handleCopyText}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chat-input-area">
          {error && (
            <div className="error-message" style={{ marginBottom: "1rem", color: "var(--error)", fontSize: "0.9rem" }}>
              ⚠️ {error}
            </div>
          )}

          <div className="quick-suggestions">
            <button className="suggestion-btn" onClick={() => handleSendMessage("I have a headache")}>
              I have a headache
            </button>
            <button className="suggestion-btn" onClick={() => handleSendMessage("Check my medications")}>
              Check my medications
            </button>
          </div>

          <div className="input-bar">
            <VoiceRecorder onRecordingComplete={handleVoiceRecording} onError={handleError} />
            <ChatInput
              value={inputValue}
              onChange={setInputValue}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              placeholder="Type your message..."
            />
            <ImageUploader onImageSelect={handleImageSelect} onError={handleError} />
            <button
              onClick={() => {
                if (inputValue.trim()) {
                  handleSendMessage(inputValue.trim())
                  setInputValue("")
                }
              }}
              disabled={!inputValue.trim() || isLoading}
              className="btn-icon send-btn"
              title="Send message"
            >
              {isLoading ? "⏳" : "📤"}
            </button>
          </div>
          </div>
        </>
        )}

        {/* Symptom Analyzer View */}
        {activeView === "symptom-checker" && (
          <div className="analyzer-container">
            <div className="analyzer-left">
              <div className="analyzer-header">
                <h2>Symptom Analyzer</h2>
                <p>Enter, speak, or upload symptoms for instant medical guidance</p>
              </div>

              <div className="symptom-input-section">
                <div className="input-with-actions">
                  <input
                    type="text"
                    value={symptomInput}
                    onChange={(e) => setSymptomInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addSymptom(symptomInput)}
                    placeholder="Type a symptom (e.g., fever, headache)..."
                    className="symptom-search-input"
                  />
                  <button 
                    onClick={() => addSymptom(symptomInput)}
                    className="btn-icon"
                    title="Add symptom"
                  >
                    ➕
                  </button>
                  <VoiceRecorder 
                    onRecordingComplete={(text) => addSymptom(text)} 
                    onError={handleError} 
                  />
                  <ImageUploader 
                    onImageSelect={async (file) => {
                      setIsAnalyzing(true)
                      try {
                        const response = await apiClient.sendMessage({
                          message: "Analyze this medical image and describe any visible symptoms",
                          sessionId: sessionId,
                          image: file
                        })
                        setSymptomAnalysis(response.response)
                      } catch (err) {
                        handleError(err as Error)
                      } finally {
                        setIsAnalyzing(false)
                      }
                    }}
                    onError={handleError}
                  />
                </div>

                <div className="common-symptoms">
                  <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                    Quick add:
                  </p>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {["Fever", "Headache", "Cough", "Sore throat", "Fatigue", "Nausea"].map((s) => (
                      <button
                        key={s}
                        onClick={() => addSymptom(s)}
                        className="quick-symptom-btn"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {symptoms.length > 0 && (
                  <div className="symptom-tags">
                    <p style={{ fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                      Selected Symptoms:
                    </p>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      {symptoms.map((symptom) => (
                        <div key={symptom} className="symptom-tag">
                          <span>{symptom}</span>
                          <button onClick={() => removeSymptom(symptom)} className="remove-tag">
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={analyzeSymptoms}
                      disabled={isAnalyzing}
                      className="btn-primary"
                      style={{ marginTop: "1rem" }}
                    >
                      {isAnalyzing ? "Analyzing..." : "Analyze Symptoms"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="analyzer-right">
              <div className="analysis-panel">
                <h3>AI Analysis</h3>
                {isAnalyzing && (
                  <div className="loading-animation">
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <p>Analyzing your symptoms...</p>
                  </div>
                )}
                {symptomAnalysis && !isAnalyzing && (
                  <div className="analysis-result">
                    <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                      {symptomAnalysis}
                    </div>
                    <div className="safety-notice">
                      ⚠️ If symptoms worsen, please consult a medical professional.
                    </div>
                  </div>
                )}
                {!symptomAnalysis && !isAnalyzing && (
                  <div className="empty-state">
                    <p>Add symptoms and click "Analyze Symptoms" to get AI-powered medical guidance.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Health Records View */}
        {activeView === "health-records" && (
          <div className="view-content">
            <h3>Your Health Records</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
              Your conversation history is saved locally in your browser.
            </p>
            <div className="records-section">
              <h4>Recent Consultations</h4>
              <p style={{ color: "var(--text-tertiary)" }}>
                {messages.length > 0 
                  ? `You have ${messages.length} messages in your current session.`
                  : "No consultation history yet. Start a chat to begin!"}
              </p>
              <button 
                className="btn-secondary" 
                onClick={() => {
                  if (confirm("Are you sure you want to clear all chat history?")) {
                    sessionStorage.removeItem("chat_messages");
                    setMessages([]);
                    setActiveView("chat");
                  }
                }}
                style={{ marginTop: "1rem" }}
              >
                Clear Chat History
              </button>
            </div>
          </div>
        )}

        {/* Medication Explorer View */}
        {activeView === "medications" && (
          <div className="analyzer-container">
            <div className="analyzer-left">
              <div className="analyzer-header">
                <h2>Medication Explorer</h2>
                <p>Search medicines and get safe, non-prescription medical information</p>
              </div>

              <div className="medication-search-section">
                <div className="input-with-actions">
                  <input
                    type="text"
                    value={medicationSearch}
                    onChange={(e) => setMedicationSearch(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && searchMedication(medicationSearch)}
                    placeholder="Search for a medication (e.g., Aspirin, Ibuprofen)..."
                    className="symptom-search-input"
                  />
                  <button
                    onClick={() => searchMedication(medicationSearch)}
                    disabled={isSearchingMed || !medicationSearch.trim()}
                    className="btn-primary"
                    style={{ padding: "0.75rem 1.5rem" }}
                  >
                    {isSearchingMed ? "Searching..." : "Search"}
                  </button>
                  <VoiceRecorder
                    onRecordingComplete={(text) => {
                      setMedicationSearch(text)
                      searchMedication(text)
                    }}
                    onError={handleError}
                  />
                </div>

                <div className="common-medications">
                  <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                    Common medications:
                  </p>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {[
                      "Aspirin",
                      "Ibuprofen",
                      "Paracetamol",
                      "Amoxicillin",
                      "Cetirizine",
                      "Omeprazole",
                    ].map((med) => (
                      <button
                        key={med}
                        onClick={() => {
                          setMedicationSearch(med)
                          searchMedication(med)
                        }}
                        className="quick-symptom-btn"
                      >
                        💊 {med}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="medication-info-notice">
                  <div style={{ 
                    background: "var(--primary-light)", 
                    padding: "1rem", 
                    borderRadius: "8px",
                    marginTop: "1rem"
                  }}>
                    <p style={{ fontSize: "0.875rem", color: "var(--primary)", margin: 0 }}>
                      ℹ️ This information is for educational purposes only. Always consult a doctor for dosage or prescription.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="analyzer-right">
              <div className="analysis-panel">
                <h3>Medication Information</h3>
                {isSearchingMed && (
                  <div className="loading-animation">
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <p>Searching medication database...</p>
                  </div>
                )}
                {medicationInfo && !isSearchingMed && (
                  <div className="analysis-result">
                    <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                      {medicationInfo}
                    </div>
                    <div className="safety-notice">
                      ⚠️ Consult a doctor for dosage or prescription. Do not self-medicate.
                    </div>
                  </div>
                )}
                {!medicationInfo && !isSearchingMed && (
                  <div className="empty-state">
                    <p>Search for a medication to get detailed information about uses, side effects, and safety guidelines.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Settings View */}
        {activeView === "settings" && (
          <div className="view-content">
            <h3>Settings</h3>
            <div className="settings-group">
              <h4>Privacy</h4>
              <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
                Your conversations are stored locally in your browser and are not sent to any server except for AI processing.
              </p>
            </div>
            <div className="settings-group">
              <h4>About</h4>
              <p style={{ color: "var(--text-secondary)" }}>
                MediChat - Your AI Health Assistant<br />
                Version 1.0.0
              </p>
            </div>
          </div>
        )}

        {/* Help View */}
        {activeView === "help" && (
          <div className="view-content">
            <h3>Help & Support</h3>
            <div className="help-section">
              <h4>How to use MediChat</h4>
              <ul style={{ color: "var(--text-secondary)", lineHeight: "1.8" }}>
                <li>Type your health questions or symptoms in the chat</li>
                <li>Use voice recording to describe your symptoms</li>
                <li>Upload images of medical reports or symptoms</li>
                <li>Get instant AI-powered health guidance</li>
              </ul>
            </div>
            <div className="help-section">
              <h4>Important Disclaimer</h4>
              <p style={{ color: "var(--text-secondary)" }}>
                MediChat is an AI assistant for educational purposes only. It is not a replacement for professional medical advice. 
                Always consult with healthcare providers for serious conditions or emergencies.
              </p>
            </div>
            <div className="help-section">
              <h4>Need More Help?</h4>
              <button className="btn-primary" onClick={() => setActiveView("chat")}>
                Start a Chat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
