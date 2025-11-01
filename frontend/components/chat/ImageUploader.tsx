"use client"

import { useRef, useState } from "react"

interface ImageUploaderProps {
  onImageSelect: (file: File) => void
  onError: (error: Error) => void
  maxSize?: number // in bytes
  acceptedFormats?: string[]
}

const DEFAULT_MAX_SIZE = 16 * 1024 * 1024 // 16MB
const DEFAULT_FORMATS = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

export function ImageUploader({
  onImageSelect,
  onError,
  maxSize = DEFAULT_MAX_SIZE,
  acceptedFormats = DEFAULT_FORMATS,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!acceptedFormats.includes(file.type)) {
      onError(new Error(`Invalid file type. Please upload: ${acceptedFormats.join(", ")}`))
      return false
    }

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2)
      onError(new Error(`File size exceeds ${maxSizeMB}MB limit`))
      return false
    }

    return true
  }

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      onImageSelect(file)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setShowMenu(false)
  }

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      setStream(mediaStream)
      setShowCamera(true)
      setShowMenu(false)
      
      // Wait a bit for video element to be ready
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
          videoRef.current.play().catch(console.error)
        }
      }, 100)
      
      // Set camera ready after a short delay
      setTimeout(() => {
        setCameraReady(true)
      }, 500)
    } catch (error) {
      console.error("Camera error:", error)
      onError(new Error("Failed to access camera. Please check permissions."))
      setShowMenu(false)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setShowCamera(false)
    setCameraReady(false)
  }

  const capturePhoto = () => {
    try {
      if (!videoRef.current || !canvasRef.current) {
        onError(new Error("Camera not ready"))
        return
      }

      const video = videoRef.current
      const canvas = canvasRef.current

      // Use video dimensions or fallback to default
      const width = video.videoWidth || 1280
      const height = video.videoHeight || 720

      if (width === 0 || height === 0) {
        onError(new Error("Camera is still loading. Please wait a moment."))
        return
      }

      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")
      
      if (!ctx) {
        onError(new Error("Failed to get canvas context"))
        return
      }

      // Draw the video frame to canvas
      ctx.drawImage(video, 0, 0, width, height)
      
      // Convert to blob and create file
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], `photo_${Date.now()}.jpg`, { type: "image/jpeg" })
            console.log("Photo captured:", file.size, "bytes")
            handleFileSelect(file)
            stopCamera()
          } else {
            onError(new Error("Failed to create image. Please try again."))
          }
        },
        "image/jpeg",
        0.92
      )
    } catch (error) {
      console.error("Capture error:", error)
      onError(new Error("Failed to capture photo. Please try again."))
    }
  }

  const handleClick = () => {
    setShowMenu(!showMenu)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(",")}
        onChange={handleFileInputChange}
        style={{ display: "none" }}
      />

      <div style={{ position: "relative" }}>
        <button onClick={handleClick} className="btn-icon attach-btn" title="Take photo or upload image">
          📷
        </button>

        {showMenu && (
          <div
            style={{
              position: "absolute",
              bottom: "50px",
              right: "0",
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              padding: "0.5rem",
              zIndex: 1000,
              minWidth: "150px",
            }}
          >
            <button
              onClick={startCamera}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                textAlign: "left",
                borderRadius: "8px",
                fontSize: "0.9rem",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f2f5")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              📸 Take Photo
            </button>
            <button
              onClick={handleUploadClick}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                textAlign: "left",
                borderRadius: "8px",
                fontSize: "0.9rem",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f2f5")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              🖼️ Upload Image
            </button>
          </div>
        )}
      </div>

      {showCamera && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.9)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            onLoadedMetadata={() => setCameraReady(true)}
            style={{
              maxWidth: "100%",
              maxHeight: "70vh",
              borderRadius: "12px",
            }}
          />
          {!cameraReady && (
            <div
              style={{
                position: "absolute",
                color: "white",
                fontSize: "1.2rem",
                fontWeight: "600",
              }}
            >
              Loading camera...
            </div>
          )}
          <canvas ref={canvasRef} style={{ display: "none" }} />
          <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem" }}>
            <button
              onClick={capturePhoto}
              disabled={!cameraReady}
              style={{
                padding: "1rem 2rem",
                backgroundColor: cameraReady ? "#4f7cff" : "#cccccc",
                color: "white",
                border: "none",
                borderRadius: "24px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: cameraReady ? "pointer" : "not-allowed",
                boxShadow: cameraReady ? "0 4px 12px rgba(79,124,255,0.4)" : "none",
                opacity: cameraReady ? 1 : 0.6,
              }}
            >
              📸 Capture
            </button>
            <button
              onClick={stopCamera}
              style={{
                padding: "1rem 2rem",
                backgroundColor: "#ff6b9d",
                color: "white",
                border: "none",
                borderRadius: "24px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(255,107,157,0.4)",
              }}
            >
              ✕ Cancel
            </button>
          </div>
        </div>
      )}
    </>
  )
}
