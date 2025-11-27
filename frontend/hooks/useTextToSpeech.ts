import { useState, useCallback, useEffect } from 'react';

interface TextToSpeechHook {
  isSpeaking: boolean;
  speak: (text: string) => void;
  stop: () => void;
  error: string | null;
}

export function useTextToSpeech(): TextToSpeechHook {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if browser supports speech synthesis
    if (!window.speechSynthesis) {
      setError('Text-to-speech is not supported in this browser.');
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) {
      setError('Text-to-speech is not supported in this browser.');
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    // Clean text for better speech (remove markdown, emojis, etc.)
    const cleanText = text
      .replace(/[#*_~`]/g, '') // Remove markdown
      .replace(/\n+/g, '. ') // Replace newlines with pauses
      .replace(/[🏥💊🔍⚠️✅❌🎯📋🚨💚🤖]/g, '') // Remove emojis
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Configure voice settings
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.lang = 'en-US';

    utterance.onstart = () => {
      setIsSpeaking(true);
      setError(null);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      setError('Failed to speak text. Please try again.');
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return { isSpeaking, speak, stop, error };
}
