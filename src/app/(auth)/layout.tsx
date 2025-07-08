import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Authentication - Secure Auth System',
  description: 'Sign in or create an account',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        {children}
      </div>
    </div>
  )
}
