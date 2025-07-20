'use client';

import { speakWithGoogleTTS } from '@/lib/googleTTS';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../components/ui/button';
import { PlayButton } from '../components/ui/play-button';
import { phrases } from './phrases';

export default function Home() {
  const [speechSynthesisSupported, setSpeechSynthesisSupported] =
    useState(true);
  const [modalPhrase, setModalPhrase] = useState<(typeof phrases)[0] | null>(
    null
  );

  const [playButtonLoading, setPlayButtonLoading] = useState<
    Record<number, boolean>
  >({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // カードごとにrefを持つ
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    // Check if SpeechSynthesis API is supported
    if (!('speechSynthesis' in window)) {
      setSpeechSynthesisSupported(false);
    }
    // Audio要素のサポート確認
    // setIsAudioSupported('Audio' in window);

    // クリーンアップ: ページ離脱時に再生停止
    return () => {
      window.speechSynthesis.cancel();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Google Cloud TTSを使用した音声再生
  const speakText = async (text: string, phraseId?: number) => {
    try {
      if (phraseId !== undefined) {
        // 再生ボタンが押されたときに、該当するボタンのローディング状態を true に設定
        setPlayButtonLoading((prev) => ({ ...prev, [phraseId]: true }));
      }

      await speakWithGoogleTTS(text);

      if (phraseId !== undefined) {
        // 音声再生が完了した後、該当するボタンのローディング状態を false に設定
        setPlayButtonLoading((prev) => ({ ...prev, [phraseId]: false }));
      }
    } catch (error) {
      console.error('Google TTS playback error:', error);
      if (phraseId !== undefined) {
        // エラーが発生した場合も、該当するボタンのローディング状態を false に設定
        setPlayButtonLoading((prev) => ({ ...prev, [phraseId]: false }));
      }
    }
  };

  // カードをモーダルで表示する関数
  const handleShowModal = (phrase: (typeof phrases)[0]) => {
    setModalPhrase(phrase);
  };
  const handleCloseModal = () => {
    setModalPhrase(null);
  };

  // Group phrases by category
  const groupedPhrases = phrases.reduce<Record<string, typeof phrases>>(
    (acc, phrase) => {
      if (!acc[phrase.category]) {
        acc[phrase.category] = [];
      }
      acc[phrase.category].push(phrase);
      return acc;
    },
    {}
  );

  return (
    <div className='flex flex-col items-center min-h-screen p-4 bg-e2e8f0'>
      {/* Main Title */}
      <h1 className='text-4xl text-center text-gray-900 mb-12 leading-tight main-title font-extralight'>
        台湾旅行で使えるフレーズ
      </h1>
      <Button
        size={'lg'}
        className='mb-8 w-full max-w-lg'
        variant='outline'
        onClick={() => {
          window.location.href = '/drill';
        }}
      >
        「多少錢？」聞き取り特訓🔥
      </Button>

      {/* Warning message for unsupported browsers */}
      {!speechSynthesisSupported && (
        <div
          className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-8 mx-auto w-full max-w-lg'
          role='alert'
        >
          <strong className='font-bold'>注意: </strong>
          <span className='block sm:inline'>
            お使いのブラウザは音声合成をサポートしていません。最新のChromeやEdgeなどをお試しください。
          </span>
        </div>
      )}

      {/* Phrases Container */}
      <div className='max-w-5xl w-full mx-auto p-4 container'>
        {Object.keys(groupedPhrases).map((category) => (
          <div key={category}>
            {/* Section Title */}
            <h2 className='text-4xl text-gray-900 mt-12 mb-8 text-center leading-tight section-title'>
              【{category}】
            </h2>
            {/* Phrase Cards */}
            {groupedPhrases[category].map((phrase) => (
              <div
                key={phrase.id}
                className={`bg-white/80 rounded-xl p-6 shadow-xl flex flex-col items-center space-y-4 sm:flex-row sm:justify-between sm:space-y-0 sm:space-x-6 mb-6 phrase-card relative`}
                ref={(el) => {
                  cardRefs.current[phrase.id] = el;
                }}
              >
                {/* モーダルボタン */}
                <button
                  className='absolute top-3 right-3 bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-full shadow transition duration-200 z-10'
                  onClick={() => handleShowModal(phrase)}
                  aria-label='拡大表示'
                  type='button'
                >
                  {/* モーダルアイコン (⛶) */}
                  <svg width='20' height='20' viewBox='0 0 20 20' fill='none'>
                    <path
                      d='M3 8V3h5M17 8V3h-5M3 12v5h5M17 12v5h-5'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                    />
                  </svg>
                </button>
                <div className='flex-grow text-center sm:text-left phrase-content'>
                  <PhraseTexts
                    chinese={phrase.chinese}
                    pinyin={phrase.pinyin}
                    japanese={phrase.japanese}
                    chineseClassName=' leading-tight mb-2'
                    pinyinClassName=' mb-1'
                    japaneseClassName=''
                  />
                </div>
                <PlayButton
                  onClick={() => speakText(phrase.chinese, phrase.id)}
                  disabled={!speechSynthesisSupported}
                  size={24}
                  ariaLabel='発音を聞く'
                  className='min-w-[48px] min-h-[48px] p-3'
                  loading={playButtonLoading[phrase.id]} // loading 状態を渡す
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* モーダル表示 */}
      {modalPhrase && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/60'
          onClick={handleCloseModal}
        >
          <div
            className='bg-white rounded-xl p-8 shadow-2xl max-w-lg w-full relative animate-fadein'
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className='absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold'
              onClick={handleCloseModal}
              aria-label='閉じる'
            >
              ×
            </button>
            <PhraseTexts
              chinese={modalPhrase.chinese}
              pinyin={modalPhrase.pinyin}
              japanese={modalPhrase.japanese}
              chineseClassName='mb-4 text-center'
              pinyinClassName='mb-2 text-center'
              japaneseClassName='mb-4 text-center '
            />
            <PlayButton
              onClick={() => speakText(modalPhrase.chinese, modalPhrase.id)}
              disabled={!speechSynthesisSupported}
              size={24}
              ariaLabel='発音を聞く'
              className='mx-auto block min-w-[48px] min-h-[48px] p-3'
              loading={
                modalPhrase.id !== undefined
                  ? playButtonLoading[modalPhrase.id]
                  : false
              } // loading 状態を渡す
            />
          </div>
        </div>
      )}
    </div>
  );
}

const PhraseTexts = ({
  chinese,
  chineseClassName,
  pinyin,
  pinyinClassName,
  japanese,
  japaneseClassName,
}: {
  chinese: string;
  pinyin: string;
  japanese: string;
  chineseClassName?: string;
  pinyinClassName?: string;
  japaneseClassName?: string;
}) => {
  return (
    <>
      <div
        className={cn(
          'text-5xl text-gray-800 font-bold break-words leading-tight ',
          chineseClassName
        )}
      >
        {chinese}
      </div>
      <div
        className={cn('text-2xl text-blue-600 font-semibold ', pinyinClassName)}
      >
        {pinyin}
      </div>
      <div
        className={cn(
          'text-lg text-neutral-800 font-normal',
          japaneseClassName
        )}
      >
        {japanese}
      </div>
    </>
  );
};
