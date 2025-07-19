import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { NextRequest } from 'next/server';

// 認証情報を環境変数から取得
let client: TextToSpeechClient;

try {
  // Base64でエンコードされた認証情報をデコード
  const encodedCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (encodedCredentials && !encodedCredentials.startsWith('/')) {
    // Base64エンコードされたJSONの場合
    const decodedCredentials = Buffer.from(
      encodedCredentials,
      'base64'
    ).toString('utf-8');
    const credentials = JSON.parse(decodedCredentials);

    client = new TextToSpeechClient({
      projectId: credentials.project_id,
      credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key,
      },
    });
  } else {
    // ファイルパスの場合
    client = new TextToSpeechClient({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
  }
} catch (error) {
  console.error('Failed to initialize Google Cloud client:', error);
  // フォールバック: 認証なしで初期化（エラーは実行時に処理）
  client = new TextToSpeechClient();
}

export async function POST(request: NextRequest) {
  try {
    const { text, voice = 'cmn-TW-Wavenet-A' } = await request.json();

    if (!text) {
      return new Response('Text is required', { status: 400 });
    }

    console.log(
      'Attempting to synthesize speech for text:',
      text,
      'with voice:',
      voice
    );

    // 利用可能な音声オプション
    const availableVoices = [
      'cmn-TW-Standard-A',
      'cmn-TW-Standard-B',
      'cmn-TW-Standard-C',
      'cmn-TW-Wavenet-A',
      'cmn-TW-Wavenet-B',
      'cmn-TW-Wavenet-C',
      'cmn-TW-Neural2-A',
      'cmn-TW-Neural2-B',
      'cmn-TW-Neural2-C',
      'cmn-TW-Journey-D',
      'cmn-TW-Journey-F',
    ];

    // 音声の妥当性チェック
    const selectedVoice = availableVoices.includes(voice)
      ? voice
      : 'cmn-TW-Wavenet-A';
    const gender =
      selectedVoice.includes('-A') || selectedVoice.includes('-F')
        ? 'FEMALE'
        : 'MALE';

    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: {
        languageCode: 'cmn-TW', // 台湾中国語
        name: selectedVoice,
        ssmlGender: gender,
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 0.9, // 標準の速度
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
