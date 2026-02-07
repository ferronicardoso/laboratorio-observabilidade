import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lab Observabilidade - Next.js',
  description: 'Aplicação Next.js com OpenTelemetry',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
