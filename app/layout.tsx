import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '台湾旅行で使えるフレーズ',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className='antialiased'
        style={{
          fontFamily:
            "'M PLUS Rounded 1c', Arial, Helvetica, 'Noto Sans', sans-serif",
          fontWeight: 300,
        }}
      >
        {children}
      </body>
    </html>
  );
}
