import { createTextToSpeechClient } from '@/utils/tts';
import { NextRequest } from 'next/server';

// 利用可能な音声オプション
// const availableVoices = [
//   'cmn-TW-Standard-A',
//   'cmn-TW-Standard-B',
//   'cmn-TW-Standard-C',
//   'cmn-TW-Wavenet-A',
//   'cmn-TW-Wavenet-B',
//   'cmn-TW-Wavenet-C',
// ];
// 2025/07/19 現在 中国語（台湾） には Neural2 音声がないため、Wavenet音声を使用

const DEFAULT_GENDER = 'FEMALE';
const DEFAULT_VOICE = 'cmn-TW-Wavenet-A';

const client = createTextToSpeechClient();

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return new Response('Text is required', { status: 400 });
    }

    console.log(
      'Attempting to synthesize speech for text:',
      text,
      'with voice:',
      DEFAULT_VOICE
    );

    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: {
        languageCode: 'cmn-TW', // 台湾中国語
        name: DEFAULT_VOICE,
        ssmlGender: DEFAULT_GENDER,
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 0.9, // 少しゆっくり
        pitch: 0.0,
        volumeGainDb: 0.0,
      },
    });

    console.log('Speech synthesis successful');

    return new Response(response.audioContent, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400', // 24時間キャッシュ
      },
    });
  } catch (error) {
    console.error('Google TTS Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error,
    });

    return new Response(
      JSON.stringify({
        error: 'Error generating speech',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
