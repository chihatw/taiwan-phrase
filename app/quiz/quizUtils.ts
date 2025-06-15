// 中国語数字生成・選択肢生成ユーティリティ

// 数字→中国語表記
export function numberToChinese(num: number): string {
  if (num === 200) return '兩百'; // 台湾でよく使う
  const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  let str = '';
  if (num >= 100) {
    str += digits[Math.floor(num / 100)] + '百';
    num %= 100;
    // 十の位が0かつ一の位が0でない場合は零を挿入
    if (num < 10 && num > 0) {
      str += '零';
    }
  }
  if (num >= 10) {
    str += digits[Math.floor(num / 10)] + '十';
    num %= 10;
  }
  if (num > 0) {
    str += digits[num];
  }
  if (str.endsWith('零')) str = str.slice(0, -1);
  return str;
}

// レベルごとの出題範囲
export function getNumberRange(level: 'easy' | 'medium' | 'hard'): number[] {
  if (level === 'easy') {
    return Array.from({ length: 9 }, (_, i) => (i + 1) * 100); // 100, 200, ... 900
  }
  if (level === 'medium') {
    const arr = [];
    for (let h = 1; h <= 9; h++) {
      arr.push(h * 100);
      for (let t = 1; t < 10; t++) {
        arr.push(h * 100 + t * 10);
      }
    }
    return arr;
  }
  // hard
  const arr = [];
  for (let h = 1; h <= 9; h++) {
    arr.push(h * 100);
    for (let t = 0; t < 10; t++) {
      for (let o = 1; o < 10; o++) {
        arr.push(h * 100 + t * 10 + o);
      }
    }
  }
  return arr.filter((n) => n <= 999);
}

// 問題セット生成
export function generateQuizSet(level: 'easy' | 'medium' | 'hard', count = 7) {
  const pool = getNumberRange(level);
  const used = new Set<number>();
  const questions = [];
  while (questions.length < count && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    const answer = pool[idx];
    if (used.has(answer)) continue;
    used.add(answer);
    // 選択肢生成
    const choices = [answer];
    while (choices.length < 4) {
      const c = pool[Math.floor(Math.random() * pool.length)];
      if (!choices.includes(c)) choices.push(c);
    }

    questions.push({
      answer,
      choices: shuffleArray(choices),
    });
  }
  return questions;
}

function shuffleArray<T>(arr: T[]): T[] {
  return arr
    .map((v) => [Math.random(), v] as [number, T])
    .sort((a, b) => a[0] - b[0])
    .map(([, v]) => v);
}
