"use client";

interface VoiceInputAnimationProps {
  isListening: boolean;
  isSpeaking?: boolean;
}

export function VoiceInputAnimation({ isListening, isSpeaking = false }: VoiceInputAnimationProps) {
  if (!isListening && !isSpeaking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="relative flex flex-col items-center gap-8">
        {/* Pulsing circles */}
        <div className="relative w-48 h-48">
          {/* Outer pulse */}
          <div className={`absolute inset-0 rounded-full ${isListening ? 'bg-red-500/30' : 'bg-teal-500/30'} animate-ping`}></div>
          
          {/* Middle pulse */}
          <div className={`absolute inset-4 rounded-full ${isListening ? 'bg-red-500/50' : 'bg-teal-500/50'} animate-pulse`}></div>
          
          {/* Inner circle with icon */}
          <div className={`absolute inset-8 rounded-full ${isListening ? 'bg-red-500' : 'bg-teal-500'} flex items-center justify-center shadow-2xl`}>
            {isListening ? (
              <svg
                className="w-20 h-20 text-white animate-pulse"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            ) : (
              <svg
                className="w-20 h-20 text-white animate-pulse"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
            )}
          </div>
        </div>

        {/* Sound wave bars */}
        <div className="flex items-center gap-3 h-20">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className={`w-3 ${isListening ? 'bg-red-500' : 'bg-teal-500'} rounded-full`}
              style={{
                animation: 'soundWave 1s ease-in-out infinite',
                animationDelay: `${i * 0.1}s`,
                height: `${30 + (i % 3) * 20}%`,
              }}
            ></div>
          ))}
        </div>

        {/* Text */}
        <div className="text-center space-y-3 px-8">
          <p className="text-white text-3xl font-bold animate-pulse">
            {isListening ? '🎤 Listening...' : '🔊 Speaking...'}
          </p>
          <p className="text-white/90 text-lg font-medium">
            {isListening ? 'Speak clearly into your microphone' : 'AI is responding'}
          </p>
          <p className="text-white/70 text-sm">
            {isListening ? 'Click anywhere to stop' : 'Please wait...'}
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes soundWave {
          0%, 100% {
            transform: scaleY(1);
          }
          50% {
            transform: scaleY(1.5);
          }
        }
      `}</style>
    </div>
  );
}
