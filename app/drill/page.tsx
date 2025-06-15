import { Button } from '@/components/ui/button';
import Link from 'next/link';

const levels = [
  { label: '初級', value: 'easy' },
  { label: '中級', value: 'medium' },
  { label: '上級', value: 'hard' },
];

export default function Home() {
  return (
    <main className='flex flex-col items-center justify-center min-h-screen gap-8'>
      <div className='rounded-xl bg-white/80 p-8 shadow-md flex flex-col items-center'>
        <h1 className='text-3xl font-bold tracking-tight mb-2'>
          「多少錢？」聞き取り特訓🔥
        </h1>
        <div className='flex flex-col gap-4 w-72'>
          {levels.map((level) => (
            <Button asChild key={level.value} size='lg' className='w-full'>
              <Link href={`/quiz?level=${level.value}`}>{level.label}</Link>
            </Button>
          ))}
        </div>
        <Button asChild size='lg' variant='secondary' className='w-full mt-6'>
          <Link href='/'>特訓終了</Link>
        </Button>
      </div>
    </main>
  );
}
