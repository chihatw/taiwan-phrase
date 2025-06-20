'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlayButton } from '@/components/ui/play-button';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { numberToChinese } from '../quiz/quizUtils';

const LEVEL_LABELS = {
  easy: '初級',
  medium: '中級',
  hard: '上級',
};

type Answer = {
  selected: number | null;
  correct: number;
};

function ResultPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const level = (searchParams?.get('level') ||
    'easy') as keyof typeof LEVEL_LABELS;
  const answers: Answer[] = (() => {
    try {
      return JSON.parse(searchParams?.get('answers') || '[]');
    } catch {
      return [];
    }
  })();

  const correctCount = answers.filter((a) => a.selected === a.correct).length;

  const speak = (num: number) => {
    const utter = new window.SpeechSynthesisUtterance(numberToChinese(num));
    utter.lang = 'zh-TW';
    window.speechSynthesis.speak(utter);
  };

  return (
    <main className='flex flex-col items-center justify-center min-h-screen gap-8 '>
      <Card className='w-full max-w-xl shadow-lg bg-white/80'>
        <CardContent className='flex flex-col items-center gap-6 py-8'>
          <h2 className='text-xl font-bold mb-2'>
            {LEVEL_LABELS[level]} - 結果
          </h2>
          <div className='text-lg mb-4'>
            正解数: {correctCount} / {answers.length}
          </div>
          <div className='flex flex-col gap-4 w-full'>
            {answers.map((a, i) => (
              <Card key={i} className='w-full'>
                <CardContent className='flex flex-col gap-1 py-3 px-4'>
                  <div className='flex items-center gap-2'>
                    <span className='font-bold'>{i + 1}.</span>
                    <PlayButton
                      onClick={() => speak(a.correct)}
                      size={24}
                      className='min-w-[48px] min-h-[48px] p-3'
                    />
                    <span>正答: {a.correct}</span>
                  </div>
                  <div>
                    あなたの答え: {a.selected !== null ? a.selected : '未選択'}
                    {a.selected === a.correct ? (
                      <span
                        className='ml-3 inline-flex items-center justify-center rounded-full bg-green-100 text-green-700 font-extrabold text-2xl shadow px-4 py-1 animate-pulse'
                        aria-label='正解'
                      >
                        ◯
                      </span>
                    ) : (
                      <span
                        className='ml-3 inline-flex items-center justify-center rounded-full bg-red-100 text-red-700 font-extrabold text-2xl shadow px-4 py-1 animate-pulse'
                        aria-label='不正解'
                      >
                        ×
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button className='w-full mt-6' onClick={() => router.push('/drill')}>
            トップへ
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResultPageContent />
    </Suspense>
  );
}
