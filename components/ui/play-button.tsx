import React, { useEffect, useRef, useState } from 'react';

interface PlayButtonProps {
  onClick: () => void;
  disabled?: boolean;
  size?: number; // px
  className?: string;
  ariaLabel?: string;
}

export const PlayButton: React.FC<PlayButtonProps> = ({
  onClick,
  disabled = false,
  size = 24,
  className = '',
  ariaLabel = '発音を聞く',
}) => {
  const [loading, setLoading] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    const handleEnd = () => setLoading(false);
    if (synthRef.current) {
      synthRef.current.addEventListener('end', handleEnd);
      synthRef.current.addEventListener('voiceschanged', handleEnd);
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.removeEventListener('end', handleEnd);
        synthRef.current.removeEventListener('voiceschanged', handleEnd);
      }
    };
  }, []);

  const handleClick = () => {
    setLoading(true);
    onClick();
    // 音声再生終了を監視
    const check = () => {
      if (!window.speechSynthesis.speaking) {
        setLoading(false);
      } else {
        setTimeout(check, 100);
      }
    };
    setTimeout(check, 100);
  };

  return (
    <button
      className={`bg-blue-800 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-110 flex-shrink-0 play-icon-button relative min-w-[${size}px] min-h-[${size}px] ${className}`}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      type='button'
    >
      {loading ? (
        <svg
          className='animate-spin mx-auto'
          width={size}
          height={size}
          viewBox='0 0 24 24'
        >
          <circle
            cx='12'
            cy='12'
            r='10'
            stroke='white'
            strokeWidth='4'
            fill='none'
            opacity='0.3'
          />
          <path
            d='M12 2a10 10 0 0 1 10 10'
            stroke='white'
            strokeWidth='4'
            fill='none'
          />
        </svg>
      ) : (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          width={size}
          height={size}
        >
          <polygon points='6,4 20,12 6,20' fill='currentColor' />
        </svg>
      )}
    </button>
  );
};
