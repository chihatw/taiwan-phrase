import React, { useEffect, useRef, useState } from 'react';

interface PlayButtonProps {
  onClick: () => void;
  disabled?: boolean;
  size?: number; // px
  className?: string;
  ariaLabel?: string;
  loading?: boolean; // 外部からloading状態を制御する場合
}

export const PlayButton: React.FC<PlayButtonProps> = ({
  onClick,
  disabled = false,
  size = 24,
  className = '',
  ariaLabel = '発音を聞く',
  loading: externalLoading,
}) => {
  const [loading, setLoading] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // 外部からloading状態が提供されている場合はそれを使用、そうでなければ内部状態を使用
  const isLoading = externalLoading !== undefined ? externalLoading : loading;

  // デバッグ用のsetLoadingラッパー
  const setLoadingWithLog = (value: boolean, source: string) => {
    console.log(`[PlayButton] setLoading(${value}) called from: ${source}`, {
      timestamp: new Date().toISOString(),
      speaking: window.speechSynthesis?.speaking,
      pending: window.speechSynthesis?.pending,
      currentLoading: loading,
    });
    // 外部制御の場合は内部のsetLoadingは呼ばない
    if (externalLoading === undefined) {
      setLoading(value);
    }
  };

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    const handleEnd = () => {
      console.log('[PlayButton] handleEnd triggered by speechSynthesis event');
      setLoadingWithLog(false, 'speechSynthesis-end-event');
    };
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
    console.log('[PlayButton] handleClick called');
    setLoadingWithLog(true, 'handleClick-start');
    onClick();

    // 外部制御の場合は内部での状態管理をスキップ
    if (externalLoading !== undefined) {
      console.log('[PlayButton] Loading state managed by parent component');
      return;
    }

    // speechSynthesisのみを使用する場合の監視処理
    // 音声再生の開始を待機してから終了を監視
    let hasStarted = false;
    const checkWithStartDetection = () => {
      const speaking = window.speechSynthesis.speaking;
      const pending = window.speechSynthesis.pending;

      console.log('[PlayButton] checkWithStartDetection called', {
        speaking,
        pending,
        hasStarted,
        timestamp: new Date().toISOString(),
      });

      // まだ開始していない場合は開始を待つ
      if (!hasStarted && (speaking || pending)) {
        console.log('[PlayButton] Speech synthesis started');
        hasStarted = true;
      }

      // 開始した後で speaking と pending が両方 false になったら終了
      if (hasStarted && !speaking && !pending) {
        console.log(
          '[PlayButton] Speech synthesis finished, setting loading to false'
        );
        setLoadingWithLog(false, 'check-function-finished');
      } else if (!hasStarted || speaking || pending) {
        console.log('[PlayButton] Continuing to monitor speech synthesis');
        setTimeout(checkWithStartDetection, 100);
      }
    };

    // 少し遅延してからチェック開始（音声再生の準備時間を確保）
    setTimeout(checkWithStartDetection, 200);
  };

  return (
    <button
      className={`bg-blue-800 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-110 flex-shrink-0 play-icon-button relative min-w-[${size}px] min-h-[${size}px] ${className}`}
      onClick={handleClick}
      disabled={disabled || isLoading}
      aria-label={ariaLabel}
      type='button'
    >
      {isLoading ? (
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
