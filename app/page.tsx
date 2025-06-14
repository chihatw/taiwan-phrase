'use client';

import { useEffect, useRef, useState } from 'react';
import { phrases } from './phrases';

export default function Home() {
  const [speechSynthesisSupported, setSpeechSynthesisSupported] =
    useState(true);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null); // 追加: ローディング状態
  const [modalPhrase, setModalPhrase] = useState<(typeof phrases)[0] | null>(
    null
  );
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  // カードごとにrefを持つ
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    // Check if SpeechSynthesis API is supported
    if (!('speechSynthesis' in window)) {
      setSpeechSynthesisSupported(false);
    }
    // クリーンアップ: ページ離脱時に再生停止
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Function to speak the given text
  const speakText = (text: string, index: number) => {
    if (speechSynthesisSupported && text) {
      setLoadingIndex(index); // ローディング開始
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      // 女性中国語ボイスを選択
      const voices = window.speechSynthesis.getVoices();
      // 女性かつ中国語のボイスを優先的に選択
      const femaleZhVoice = voices.find(
        (v) =>
          v.lang.startsWith('zh') &&
          (v.name.includes('女') ||
            v.name.toLowerCase().includes('female') ||
            v.voiceURI.toLowerCase().includes('female') ||
            v.name.includes('Google 普通话（女声）') || // Chrome用
            v.name.includes('Google 中文（普通话）')) // Chrome用
      );
      if (femaleZhVoice) {
        utterance.voice = femaleZhVoice;
      } else {
        // 女性でなくても中国語ボイスがあれば使う
        const zhVoice = voices.find((v) => v.lang.startsWith('zh'));
        if (zhVoice) utterance.voice = zhVoice;
      }
      utterance.onend = () => setLoadingIndex(null); // 再生終了時にローディング解除
      utterance.onerror = () => setLoadingIndex(null); // エラー時も解除
      utteranceRef.current = utterance;
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      window.speechSynthesis.speak(utterance);
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
            {groupedPhrases[category].map((phrase, index) => (
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
                  <div className='text-5xl text-gray-800 font-bold break-words leading-tight mb-2 chinese-text'>
                    {phrase.chinese}
                  </div>
                  <div className='text-2xl text-blue-600 font-semibold mb-1 pinyin-text'>
                    {phrase.pinyin}
                  </div>
                  <div className='text-lg text-neutral-500 japanese-text'>
                    {phrase.japanese}
                  </div>
                </div>
                <button
                  className='bg-blue-800 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-110 flex-shrink-0 play-icon-button relative min-w-[48px] min-h-[48px]'
                  onClick={() => speakText(phrase.chinese, index)}
                  disabled={!speechSynthesisSupported || loadingIndex !== null}
                  aria-label='発音を聞く'
                >
                  {loadingIndex === index ? (
                    // ローディング中のスピナー
                    <svg
                      className='animate-spin mx-auto'
                      width='24'
                      height='24'
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
                    // SVG Play Icon
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      width='24'
                      height='24'
                    >
                      <polygon points='6,4 20,12 6,20' fill='currentColor' />
                    </svg>
                  )}
                </button>
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
            <div className='text-5xl text-gray-800 font-bold break-words leading-tight mb-4 text-center'>
              {modalPhrase.chinese}
            </div>
            <div className='text-2xl text-blue-600 font-semibold mb-2 text-center'>
              {modalPhrase.pinyin}
            </div>
            <div className='text-lg text-neutral-500 mb-4 text-center'>
              {modalPhrase.japanese}
            </div>
            <button
              className='bg-blue-800 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-110 mx-auto block min-w-[48px] min-h-[48px]'
              onClick={() => speakText(modalPhrase.chinese, modalPhrase.id)}
              disabled={!speechSynthesisSupported || loadingIndex !== null}
              aria-label='発音を聞く'
            >
              {loadingIndex === modalPhrase.id ? (
                <svg
                  className='animate-spin mx-auto'
                  width='24'
                  height='24'
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
                  width='24'
                  height='24'
                >
                  <polygon points='6,4 20,12 6,20' fill='currentColor' />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
