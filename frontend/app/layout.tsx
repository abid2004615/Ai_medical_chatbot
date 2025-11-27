import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { LeftSidebar } from '@/components/layout/LeftSidebar'
import { MinimalHeader } from '@/components/layout/MinimalHeader'
import { Footer } from '@/components/layout/Footer'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({ 
  weight: ['500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MediChat - AI Health Assistant',
  description: 'Your personal AI health assistant for symptom analysis and health guidance',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen bg-background text-foreground overflow-x-hidden" suppressHydrationWarning>
        <ThemeProvider>
          <LeftSidebar />
          <MinimalHeader />
          <main className="ml-64 pt-16 min-h-screen relative">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
