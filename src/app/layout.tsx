import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'A Safe Passage | Public Governance Engine',
  description: 'A conversational mobility engine and empirical policy co-creation platform for African integration.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0B0F19" />
      </head>
      <body>{children}</body>
    </html>
  );
}
