import { useState, useRef, useEffect } from 'react';
import { Mic, Volume2, RotateCcw, Award, Check, AlertTriangle, X } from 'lucide-react';

export default function ChinesePronunciationAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [pinyin, setPinyin] = useState('');
  const [grade, setGrade] = useState(null);
  const [wordScores, setWordScores] = useState([]);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Mock function to simulate speech recognition - used when real mic isn't available
  const simulateRecognition = () => {
    // Simulated results
    const phrases = [
      { 
        chinese: '你好', 
        pinyin: 'nǐ hǎo',
        scores: [0.9, 0.8] // scores for each word
      },
      { 
        chinese: '我喜欢学习中文', 
        pinyin: 'wǒ xǐhuān xuéxí zhōngwén',
        scores: [0.9, 0.7, 0.5, 0.8]
      },
      { 
        chinese: '今天天气很好', 
        pinyin: 'jīntiān tiānqì hěn hǎo',
        scores: [0.95, 0.6, 0.85, 0.9]
      }
    ];
    
    // Pick a random phrase
    const result = phrases[Math.floor(Math.random() * phrases.length)];
    
    // Calculate overall grade
    const averageScore = result.scores.reduce((a, b) => a + b, 0) / result.scores.length;
    const letterGrade = averageScore > 0.85 ? 'A' : 
                        averageScore > 0.75 ? 'B' : 
                        averageScore > 0.6 ? 'C' : 
                        averageScore > 0.5 ? 'D' : 'F';
                        
    setTimeout(() => {
      setSpokenText(result.chinese);
      setPinyin(result.pinyin);
      setWordScores(result.scores);
      setGrade(letterGrade);
      setIsListening(false);
    }, 1500);
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    setIsListening(true);
    
    // For demonstration purposes, always use simulation since we can't access real mic in this environment
    simulateRecognition();
    
    // Note: In a real implementation, you would use this code:
    /*
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      audioChunksRef.current = [];
      
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          mediaRecorderRef.current = new MediaRecorder(stream);
          
          mediaRecorderRef.current.ondataavailable = (e) => {
            if (e.data.size > 0) {
              audioChunksRef.current.push(e.data);
            }
          };
          
          mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            // Send audioBlob to speech recognition API
            processAudio(audioBlob);
          };
          
          mediaRecorderRef.current.start();
        })
        .catch(error => {
          console.error("Error accessing microphone:", error);
          simulateRecognition(); // Fallback to simulation
          setIsListening(false);
        });
    } else {
      simulateRecognition(); // Fallback to simulation
    }
    */
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsListening(false);
  };

  const resetAll = () => {
    setSpokenText('');
    setPinyin('');
    setGrade(null);
    setWordScores([]);
    setAudioBlob(null);
  };

  const playAudio = () => {
    // In a real app, this would play the recorded audio
    // For now, let's simulate by showing the result again
    
    // Create a simple beep sound for feedback
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    oscillator.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  // Split text into words for rendering with color-coded feedback
  const renderText = (text, scores, isPinyin = false) => {
    if (!text) return null;
    
    // For pinyin, split by spaces
    if (isPinyin) {
      const words = text.split(' ');
      
      return (
        <div className="flex flex-wrap gap-1">
          {words.map((word, idx) => {
            // Determine color based on score
            const score = scores && scores[idx];
            const color = !score ? 'text-gray-800' :
                         score >= 0.8 ? 'text-green-600' :
                         score >= 0.6 ? 'text-yellow-600' : 'text-red-600';
            
            const borderColor = !score ? 'border-b-0' :
                               score >= 0.8 ? 'border-b-2 border-green-600' :
                               score >= 0.6 ? 'border-b-2 border-yellow-600' : 'border-b-2 border-red-600';
                               
            return (
              <span 
                key={idx} 
                className={`${color} ${borderColor} text-sm font-medium`}
              >
                {word}{' '}
              </span>
            );
          })}
        </div>
      );
    } 
    // For Chinese characters
    else {
      // Count pinyin words to determine how to group characters
      const pinyinWords = pinyin.split(' ');
      const characterGroups = [];
      
      // Simple approach: assume one character per pinyin word
      let currentIndex = 0;
      for (let i = 0; i < pinyinWords.length; i++) {
        if (currentIndex < text.length) {
          characterGroups.push(text[currentIndex]);
          currentIndex++;
        }
      }
      
      return (
        <div className="flex flex-wrap gap-1">
          {characterGroups.map((char, idx) => {
            // Determine color based on score
            const score = scores && scores[idx];
            const color = !score ? 'text-gray-800' :
                         score >= 0.8 ? 'text-green-600' :
                         score >= 0.6 ? 'text-yellow-600' : 'text-red-600';
            
            const borderColor = !score ? 'border-b-0' :
                               score >= 0.8 ? 'border-b-2 border-green-600' :
                               score >= 0.6 ? 'border-b-2 border-yellow-600' : 'border-b-2 border-red-600';
                               
            return (
              <span 
                key={idx} 
                className={`${color} ${borderColor} text-2xl font-medium`}
              >
                {char}{' '}
              </span>
            );
          })}
        </div>
      );
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Chinese Pronunciation Assistant</h1>
        
        <div className="mb-8 flex justify-center">
          <button
            onClick={handleMicClick}
            className={`flex items-center justify-center rounded-full w-16 h-16 bg-white 
              ${isListening ? 'border-2 border-red-500' : 'border border-gray-200'} 
              text-gray-700 shadow-lg`}
          >
            <Mic size={24} className={isListening ? "text-red-500" : "text-gray-700"} />
          </button>
        </div>
        
        {isListening && (
          <div className="text-center mb-6 text-gray-600">
            <div className="flex justify-center items-center space-x-1">
              <span className="animate-pulse">Listening</span>
              <span className="animate-pulse delay-100">.</span>
              <span className="animate-pulse delay-200">.</span>
              <span className="animate-pulse delay-300">.</span>
            </div>
          </div>
        )}
        
        {spokenText && (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <div className="mb-4">
              <h2 className="text-lg font-medium mb-2">Chinese</h2>
              {renderText(spokenText, wordScores)}
            </div>
            
            <div>
              <h2 className="text-lg font-medium mb-2">Pinyin</h2>
              {renderText(pinyin, wordScores, true)}
            </div>
          </div>
        )}
        
        {grade && (
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center bg-blue-100 rounded-full p-3 mb-2">
              <Award size={24} className="text-blue-700" />
            </div>
            <h2 className="text-xl font-bold">Your Grade: {grade}</h2>
            <div className="mt-2 flex justify-center gap-2">
              {grade === 'A' && <Check size={20} className="text-green-600" />}
              {(grade === 'B' || grade === 'C') && <AlertTriangle size={20} className="text-yellow-600" />}
              {(grade === 'D' || grade === 'F') && <X size={20} className="text-red-600" />}
              <p className="text-gray-700">
                {grade === 'A' ? 'Excellent pronunciation!' : 
                 grade === 'B' ? 'Good job, keep practicing!' :
                 grade === 'C' ? 'Fair effort, focus on the yellow words.' :
                 'Needs improvement, practice the red words.'}
              </p>
            </div>
          </div>
        )}
        
        {spokenText && (
          <div className="flex justify-center mb-6 gap-4">
            <button 
              onClick={playAudio}
              className="flex items-center px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
            >
              <Volume2 size={18} className="mr-2" />
              Play Recording
            </button>
            
            <button 
              onClick={resetAll}
              className="flex items-center px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
            >
              <RotateCcw size={18} className="mr-2" />
              Start Over
            </button>
          </div>
        )}
        
        <div className="text-center text-sm text-gray-500 mt-4">
          <p>Tap the microphone button and say a Chinese phrase</p>
        </div>
      </div>
    </div>
  );
}