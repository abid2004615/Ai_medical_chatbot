import { useState, useCallback } from 'react';

interface SpeechRecognitionHook {
  isListening: boolean;
  startListening: (onResult: (text: string) => void) => void;
  stopListening: () => void;
  error: string | null;
}

export function useSpeechRecognition(): SpeechRecognitionHook {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);

  const startListening = useCallback((onResult: (text: string) => void) => {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser. Please try Chrome or Edge.');
      return;
    }

    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.lang = 'en-US';
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;
    recognitionInstance.maxAlternatives = 1;

    recognitionInstance.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };
    
    recognitionInstance.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setIsListening(false);
    };

    recognitionInstance.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      switch (event.error) {
        case 'no-speech':
          setError('No speech detected. Please try again.');
          break;
        case 'audio-capture':
          setError('Microphone not found. Please check your microphone.');
          break;
        case 'not-allowed':
          setError('Microphone access denied. Please allow microphone access.');
          break;
        default:
          setError('Speech recognition error. Please try again.');
      }
    };

    recognitionInstance.start();
    setRecognition(recognitionInstance);
  }, []);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition]);

  return { isListening, startListening, stopListening, error };
}
