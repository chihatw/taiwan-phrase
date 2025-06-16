import nodemailer from 'nodemailer';

// Mailgun SMTP情報を環境変数から取得
const { MAILGUN_USER, MAILGUN_PASS } = process.env;

const transporter = nodemailer.createTransport({
  host: 'smtp.mailgun.org',
  port: 587,
  auth: {
    user: MAILGUN_USER,
    pass: MAILGUN_PASS,
  },
});

export async function POST(req: Request) {
  try {
    const { level, answers } = await req.json();
    await transporter.sendMail({
      from: `Quiz App <${MAILGUN_USER}>`,
      to: 'chiha.tw@gmail.com',
      subject: 'クイズ結果サマリー',
      text: `レベル: ${level}\n回答: ${JSON.stringify(answers, null, 2)}`,
    });
    return new Response(JSON.stringify({ message: 'メール送信成功' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'メール送信失敗', error }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
