import type { NextApiRequest, NextApiResponse } from 'next';
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const { level, answers } = req.body;
  try {
    await transporter.sendMail({
      from: `Quiz App <${MAILGUN_USER}>`,
      to: 'chiha.tw@gmail.com',
      subject: 'クイズ結果サマリー',
      text: `レベル: ${level}\n回答: ${JSON.stringify(answers, null, 2)}`,
    });
    res.status(200).json({ message: 'メール送信成功' });
  } catch (error) {
    res.status(500).json({ message: 'メール送信失敗', error });
  }
}
