'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlayButton } from '@/components/ui/play-button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { generateQuizSet, numberToChinese } from './quizUtils';

const LEVEL_LABELS = {
  easy: '初級',
  medium: '中級',
  hard: '上級',
};

type Quiz = {
  answer: number;
  choices: number[];
};

function QuizPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const level = (searchParams.get('level') ||
    'easy') as keyof typeof LEVEL_LABELS;

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<
    { selected: number | null; correct: number }[]
  >([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setQuizzes(generateQuizSet(level, 7));
    setCurrent(0);
    setSelected(null);
    setAnswers([]);
    setShowResult(false);
  }, [level]);

  useEffect(() => {
    if (showResult) {
      router.push(
        `/result?level=${level}&answers=${encodeURIComponent(
          JSON.stringify(answers)
        )}`
      );
    }
  }, [showResult, router, level, answers]);

  if (showResult) return null;

  if (!quizzes.length) return <div>Loading...</div>;
  const quiz = quizzes[current];

  const speak = () => {
    setLoading(true);
    const utter = new window.SpeechSynthesisUtterance(
      numberToChinese(quiz.answer)
    );
    utter.lang = 'zh-CN';
    utter.rate = 0.9;
    utter.pitch = 1.0;
    // 女性中国語ボイスを選択
    const voices = window.speechSynthesis.getVoices();
    const femaleZhVoice = voices.find(
      (v) =>
        v.lang.startsWith('zh') &&
        (v.name.includes('女') ||
          v.name.toLowerCase().includes('female') ||
          v.voiceURI.toLowerCase().includes('female') ||
          v.name.includes('Google 普通话（女声）') ||
          v.name.includes('Google 中文（普通话）'))
    );
    if (femaleZhVoice) {
      utter.voice = femaleZhVoice;
    } else {
      const zhVoice = voices.find((v) => v.lang.startsWith('zh'));
      if (zhVoice) utter.voice = zhVoice;
    }
    utter.onend = () => setLoading(false);
    utter.onerror = () => setLoading(false);
    utteranceRef.current = utter;
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    window.speechSynthesis.speak(utter);
  };

  const handleSelect = (num: number) => {
    setSelected(num);
  };

  const handleNext = () => {
    setAnswers((prev) => [...prev, { selected, correct: quiz.answer }]);
    setSelected(null);
    if (current === quizzes.length - 1) {
      setShowResult(true);
    } else {
      setCurrent((c) => c + 1);
    }
  };

  return (
    <main className='flex flex-col items-center justify-center min-h-screen gap-8 '>
      <Card className='w-full max-w-md shadow-lg　bg-white/80'>
        <CardContent className='flex flex-col items-center gap-6 py-8'>
          <ProgressBar current={current + 1} total={quizzes.length} />
          <h2 className='text-xl font-bold mb-2'>
            {LEVEL_LABELS[level]} - {current + 1}/7
          </h2>
          <PlayButton
            onClick={speak}
            size={24}
            className='mb-2'
            disabled={loading}
          />
          <div className='flex flex-col gap-3 w-full'>
            {quiz.choices.map((choice) => (
              <Button
                key={choice}
                variant={'outline'}
                size='lg'
                className={`w-full text-lg transition-all duration-150 ${
                  selected === choice
                    ? 'ring-2 ring-primary border-primary bg-primary/10 scale-105 font-bold'
                    : ''
                }`}
                onClick={() => handleSelect(choice)}
              >
                {choice}
              </Button>
            ))}
          </div>
          <Button
            className='w-full mt-4'
            onClick={handleNext}
            disabled={selected === null}
          >
            {current === quizzes.length - 1 ? '結果' : '次へ'}
          </Button>
          <Button
            variant='ghost'
            className='w-full mt-2'
            onClick={() => router.push('/drill')}
          >
            戻る
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QuizPageContent />
    </Suspense>
  );
}
