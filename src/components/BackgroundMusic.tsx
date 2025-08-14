import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Play, Pause, Music, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/contexts/AdminContext';

const BackgroundMusic: React.FC = () => {
  const { backgroundMusic, updateBackgroundMusic } = useAdmin();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !backgroundMusic.url) return;
    
    audio.volume = backgroundMusic.volume;
    
    if (backgroundMusic.isPlaying) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [backgroundMusic.isPlaying, backgroundMusic.volume]);
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', () => {
      updateBackgroundMusic({ ...backgroundMusic, isPlaying: false });
    });
    
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [backgroundMusic, updateBackgroundMusic]);
  
  const togglePlay = () => {
    updateBackgroundMusic({ ...backgroundMusic, isPlaying: !backgroundMusic.isPlaying });
  };
  
  const toggleMute = () => {
    const newVolume = backgroundMusic.volume > 0 ? 0 : 0.3;
    updateBackgroundMusic({ ...backgroundMusic, volume: newVolume });
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    updateBackgroundMusic({ ...backgroundMusic, volume: newVolume });
  };
  
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  if (!backgroundMusic.url) return null;
  
  return (
    <>
      <audio
        ref={audioRef}
        src={backgroundMusic.url}
        loop
        preload="metadata"
      />
      
      {/* Floating Music Control Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-40 group"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <Button
          onClick={() => setIsVisible(!isVisible)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300"
          size="lg"
          title="Música de Fondo"
        >
          <Headphones className="w-6 h-6" />
        </Button>
        
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-black/80 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
          Música de Fondo
        </div>
      </motion.div>
      
      {/* Music Control Panel */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-40 bg-background/95 backdrop-blur-md border rounded-2xl shadow-2xl p-4 w-80"
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-pink-600 flex items-center justify-center">
                    <Music className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Música de Fondo</h4>
                    <p className="text-xs text-muted-foreground">Ambiente Gaming</p>
                  </div>
                </div>
                <Button
                  onClick={() => setIsVisible(false)}
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0"
                >
                  ×
                </Button>
              </div>
              
              {/* Progress Bar */}
              {duration > 0 && (
                <div className="space-y-2">
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-red-500 to-pink-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(currentTime / duration) * 100}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              )}
              
              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={togglePlay}
                    variant={backgroundMusic.isPlaying ? "default" : "outline"}
                    size="sm"
                    className="w-10 h-10 p-0"
                  >
                    {backgroundMusic.isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                  
                  <Button
                    onClick={toggleMute}
                    variant="outline"
                    size="sm"
                    className="w-10 h-10 p-0"
                  >
                    {backgroundMusic.volume > 0 ? (
                      <Volume2 className="w-4 h-4" />
                    ) : (
                      <VolumeX className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                
                {/* Volume Slider */}
                <div className="flex items-center gap-2 flex-1 ml-4">
                  <VolumeX className="w-3 h-3 text-muted-foreground" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={backgroundMusic.volume}
                    onChange={handleVolumeChange}
                    className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                  />
                  <Volume2 className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground w-8 text-right">
                    {Math.round(backgroundMusic.volume * 100)}%
                  </span>
                </div>
              </div>
              
              {/* Visualizer Effect */}
              <div className="flex items-center justify-center gap-1 h-8">
                {backgroundMusic.isPlaying && (
                  <>
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-gradient-to-t from-red-500 to-pink-600 rounded-full"
                        animate={{
                          height: backgroundMusic.isPlaying ? [4, 20, 8, 16, 4] : 4,
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: i * 0.1,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                  </>
                )}
                {!backgroundMusic.isPlaying && (
                  <div className="text-xs text-muted-foreground">Música pausada</div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(45deg, #ef4444, #ec4899);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(45deg, #ef4444, #ec4899);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-webkit-slider-track {
          height: 8px;
          border-radius: 4px;
          background: #e5e7eb;
        }
        
        .slider::-moz-range-track {
          height: 8px;
          border-radius: 4px;
          background: #e5e7eb;
        }
      `}</style>
    </>
  );
};

export default BackgroundMusic;