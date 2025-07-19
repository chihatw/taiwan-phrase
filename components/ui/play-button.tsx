import React, { useEffect, useState } from 'react';

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

  // 外部からloading状態が提供されている場合はそれを使用、そうでなければ内部状態を使用
  const isLoading = externalLoading !== undefined ? externalLoading : loading;

  useEffect(() => {
    const synth = window.speechSynthesis;
    const handleEnd = () => {
      if (externalLoading === undefined) {
        setLoading(false);
      }
    };
    synth.addEventListener('end', handleEnd);
    synth.addEventListener('voiceschanged', handleEnd);
    return () => {
      synth.removeEventListener('end', handleEnd);
      synth.removeEventListener('voiceschanged', handleEnd);
    };
  }, [externalLoading]);

  const handleClick = () => {
    if (externalLoading === undefined) {
      setLoading(true);
    }
    onClick();

    // 外部制御の場合は内部での状態管理をスキップ
    if (externalLoading !== undefined) {
      return;
    }

    // speechSynthesisのみを使用する場合の監視処理
    // 音声再生の開始を待機してから終了を監視
    let hasStarted = false;
    const checkWithStartDetection = () => {
      const speaking = window.speechSynthesis.speaking;
      const pending = window.speechSynthesis.pending;

      // まだ開始していない場合は開始を待つ
      if (!hasStarted && (speaking || pending)) {
        hasStarted = true;
      }

      // 開始した後で speaking と pending が両方 false になったら終了
      if (hasStarted && !speaking && !pending) {
        if (externalLoading === undefined) {
          setLoading(false);
        }
      } else if (!hasStarted || speaking || pending) {
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
