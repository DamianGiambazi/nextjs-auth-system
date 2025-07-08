import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ProfileOverview } from '@/components/dashboard/profile-overview'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata = {
  title: 'Profile | Dashboard',
  description: 'View and manage your profile information',
}

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/signin')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true,
      _count: {
        select: { securityLogs: true }
      }
    }
  })

  if (!user) {
    redirect('/signin')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your personal information and preferences</p>
        </div>
        <Link href="/dashboard/profile/edit">
          <Button>
            Edit Profile
          </Button>
        </Link>
      </div>

      <ProfileOverview user={user} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{user._count.securityLogs}</div>
          <div className="text-sm text-gray-600">Security Events</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {new Date(user.createdAt).toLocaleDateString()}
          </div>
          <div className="text-sm text-gray-600">Member Since</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">
            {user.lastActiveAt ? 'Recently' : 'Now'}
          </div>
          <div className="text-sm text-gray-600">Last Active</div>
        </div>
      </div>
    </div>
  )
}
