import React from 'react';

interface ProgressBarProps {
  current: number; // 1〜7
  total?: number; // デフォルト7
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total = 7,
}) => {
  const percent = (Math.min(Math.max(current, 0), total) / total) * 100;
  return (
    <div className='w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-6'>
      <div
        className='h-full bg-blue-500 transition-all duration-500'
        style={{ width: `${percent}%` }}
      />
    </div>
  );
};
