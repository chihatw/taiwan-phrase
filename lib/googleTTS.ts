// speakWithGoogleTTS 関数は、Google TTS (Text-to-Speech) API を使用して指定されたテキストを音声として再生します。
// 1. 指定されたテキストを '/api/tts' エンドポイントに POST リクエストとして送信します。
// 2. レスポンスが正常でない場合、エラーをログに記録し、例外をスローします。
// 3. 正常なレスポンスの場合、音声データを Blob として取得し、Audio オブジェクトを作成します。
// 4. Audio オブジェクトを使用して音声を再生し、再生終了時やエラー時にリソースを解放します。
export const speakWithGoogleTTS = async (text: string) => {
  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('TTS API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(
        `TTS API request failed: ${response.status} ${response.statusText}`
      );
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
    };

    audio.onerror = () => {
      URL.revokeObjectURL(audioUrl);
    };

    await audio.play();
  } catch (error) {
    console.error('Google TTS playback error:', error);
  }
};
