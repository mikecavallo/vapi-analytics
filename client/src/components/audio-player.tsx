import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AudioPlayerProps {
  recordingUrl?: string;
  className?: string;
}

export default function AudioPlayer({ recordingUrl, className }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
    };
  }, [recordingUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const newTime = clickPosition * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!recordingUrl) {
    return (
      <div className={`flex items-center justify-center p-4 text-muted-foreground ${className}`}>
        <Volume2 size={16} className="mr-2" />
        <span className="text-sm">No recording available</span>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <audio ref={audioRef} src={recordingUrl} preload="metadata" />
        
        <div className="flex items-center space-x-4">
          <Button
            size="sm"
            variant="outline"
            onClick={togglePlay}
            disabled={isLoading}
            className="flex-shrink-0"
            data-testid="button-play-recording"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause size={16} />
            ) : (
              <Play size={16} />
            )}
          </Button>

          <div className="flex-1 space-y-2">
            {/* Waveform-style progress bar */}
            <div
              className="h-8 bg-muted rounded cursor-pointer relative overflow-hidden"
              onClick={handleSeek}
              data-testid="audio-progress-bar"
            >
              <div
                className="h-full bg-primary transition-all duration-100 ease-out"
                style={{ width: `${progress}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex space-x-0.5">
                  {/* Simple waveform visualization */}
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 bg-current transition-opacity duration-100 ${
                        (i / 20) * 100 <= progress ? 'opacity-100' : 'opacity-30'
                      }`}
                      style={{ 
                        height: `${Math.random() * 60 + 20}%`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}