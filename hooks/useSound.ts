
import { useRef, useCallback, useEffect } from 'react';

const useSound = (url: string, loop: boolean = true) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // This effect creates the Audio object and sets its properties.
    // It runs once when the component mounts.
    if (typeof window !== 'undefined') {
      try {
        const audio = new Audio();
        audio.src = url;
        audio.loop = loop;
        audio.volume = 1.0; // Ensure maximum volume
        audio.preload = 'auto';
        audio.crossOrigin = 'anonymous'; // Help with CORS in iframes
        audioRef.current = audio;
        
        // Explicitly call load to start buffering
        audio.load();
      } catch (e) {
        console.error("Audio initialization failed:", e);
      }
    }

    // Cleanup function to stop and nullify the audio element on unmount
    return () => {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.src = ""; // Clear source to stop any pending downloads
          audioRef.current = null;
        } catch (e) {
          // Ignore errors during cleanup
        }
      }
    };
  }, [url, loop]);

  const play = useCallback(() => {
    if (audioRef.current) {
      // Ensure volume is up and it's loaded
      audioRef.current.volume = 1.0;
      
      // Requesting to play audio. Modern browsers return a promise.
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        return playPromise.catch(error => {
          // Ignore AbortError which can happen if the component unmounts
          const ignoredErrors = ['AbortError'];
          if (!ignoredErrors.includes(error.name)) {
            console.warn(`Audio play failed (${error.name}):`, error.message);
          }
          throw error; // Re-throw to let the caller know it failed
        });
      }
    }
    return Promise.resolve();
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // Reset audio to the beginning
    }
  }, []);

  return { play, stop };
};

export default useSound;
