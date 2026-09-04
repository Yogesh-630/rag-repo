import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

export default function VoiceInputButton({ onTranscript }) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = false;
        recog.lang = 'en-US';

        recog.onresult = (event) => {
          const text = event.results[0][0].transcript;
          if (onTranscript && text) {
            onTranscript(text);
          }
          setIsListening(false);
        };

        recog.onerror = (err) => {
          console.warn('[VoiceInput] Speech error:', err);
          setIsListening(false);
        };

        recog.onend = () => {
          setIsListening(false);
        };

        setRecognition(recog);
      }
    }
  }, [onTranscript]);

  const toggleListening = () => {
    if (!recognition) return;
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Recognition start error:', err);
      }
    }
  };

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`p-2.5 rounded-xl border transition-all ${
        isListening
          ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 animate-pulse'
          : 'bg-surface-100/90 text-slate-400 hover:text-white border-white/10 hover:border-brand-500/40'
      }`}
      title={isListening ? 'Listening... click to stop' : 'Click to speak question'}
    >
      {isListening ? <Mic className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4" />}
    </button>
  );
}
