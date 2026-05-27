import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Ikhora Fluent — AI-Powered English & IELTS Learning Platform',
    template: '%s | Ikhora Fluent',
  },
  description:
    'Master IELTS and CEFR English proficiency with AI-powered writing coaching, speaking feedback, curated practice and expert scoring. For students, teachers and institutes.',
  keywords: ['IELTS preparation', 'CEFR', 'English learning', 'AI tutor', 'IELTS writing', 'IELTS speaking'],
  openGraph: {
    type: 'website',
    title: 'Ikhora Fluent — AI-Powered English & IELTS Learning',
    description: 'Practice, measure and improve English with IELTS/CEFR AI scoring, feedback and analytics.',
    siteName: 'Ikhora Fluent',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
