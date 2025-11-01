"use client"

import { KeyboardEvent, useRef, useEffect } from "react"

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSendMessage: (message: string) => void
  isLoading?: boolean
  placeholder?: string
}

export function ChatInput({
  value,
  onChange,
  onSendMessage,
  isLoading = false,
  placeholder = "Type your message...",
}: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Focus input after sending message
    if (!isLoading && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isLoading])

  const handleSend = () => {
    const trimmedMessage = value.trim()
    if (trimmedMessage && !isLoading) {
      onSendMessage(trimmedMessage)
      onChange("")
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyPress={handleKeyPress}
      placeholder={placeholder}
      disabled={isLoading}
      className="chat-input"
    />
  )
}
