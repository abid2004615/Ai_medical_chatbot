"use client"

import { useState } from "react"

export interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
  audioUrl?: string
  imageUrl?: string
  transcription?: string
}

interface ChatMessageProps {
  message: Message
  onPlayAudio?: (url: string) => void
  onCopyText?: (text: string) => void
}

export function ChatMessage({ message, onPlayAudio, onCopyText }: ChatMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (onCopyText) {
      onCopyText(message.text)
    } else {
      navigator.clipboard.writeText(message.text)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePlayAudio = () => {
    if (message.audioUrl && onPlayAudio) {
      setIsPlaying(true)
      onPlayAudio(message.audioUrl)
      // Reset playing state after a delay
      setTimeout(() => setIsPlaying(false), 3000)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className={`message ${message.sender}-message`}>
      {message.sender === "bot" && <div className="message-avatar">🤖</div>}

      <div className="message-content">
        {message.transcription && (
          <div className="transcription">
            <small>
              <em>Transcription: {message.transcription}</em>
            </small>
          </div>
        )}

        {message.imageUrl && (
          <div className="message-image">
            <img src={message.imageUrl} alt="Uploaded" style={{ maxWidth: "300px", borderRadius: "8px" }} />
          </div>
        )}

        <p>{message.text}</p>

        <div className="message-footer">
          <span className="message-time">{formatTime(message.timestamp)}</span>

          {message.sender === "bot" && (
            <div className="message-actions">
              {message.audioUrl && (
                <button
                  className="action-btn"
                  onClick={handlePlayAudio}
                  title="Play audio"
                  disabled={isPlaying}
                >
                  {isPlaying ? "🔊" : "🔉"}
                </button>
              )}
              <button className="action-btn" onClick={handleCopy} title="Copy message">
                {copied ? "✓" : "📋"}
              </button>
            </div>
          )}
        </div>
      </div>

      {message.sender === "user" && <div className="message-avatar">👤</div>}
    </div>
  )
}
