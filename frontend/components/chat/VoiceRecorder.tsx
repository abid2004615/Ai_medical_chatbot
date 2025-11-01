"use client"

import { useState, useRef } from "react"

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void
  onError: (error: Error) => void
}

type RecordingState = "idle" | "recording" | "processing"

export function VoiceRecorder({ onRecordingComplete, onError }: VoiceRecorderProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle")
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Create MediaRecorder instance
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      // Handle data available event
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      // Handle stop event
      mediaRecorder.onstop = () => {
        setRecordingState("processing")

        // Create blob from chunks
        const audioBlob = new Blob(chunksRef.current, { type: "audio/wav" })

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop())

        // Call callback
        onRecordingComplete(audioBlob)

        // Reset state
        setRecordingState("idle")
        chunksRef.current = []
      }

      // Start recording
      mediaRecorder.start()
      setRecordingState("recording")

      // Auto-stop after 60 seconds
      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          stopRecording()
        }
      }, 60000)
    } catch (error) {
      console.error("Error starting recording:", error)
      onError(error as Error)
      setRecordingState("idle")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
    }
  }

  const handleClick = () => {
    if (recordingState === "idle") {
      startRecording()
    } else if (recordingState === "recording") {
      stopRecording()
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={recordingState === "processing"}
      className={`btn-icon voice-btn ${recordingState === "recording" ? "listening" : ""}`}
      title={recordingState === "recording" ? "Stop recording" : "Start voice recording"}
    >
      {recordingState === "idle" && "🎤"}
      {recordingState === "recording" && "⏹️"}
      {recordingState === "processing" && "⏳"}
    </button>
  )
}
