import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ProfileEditForm } from '@/components/dashboard/profile-edit-form'

export const metadata = {
  title: 'Edit Profile | Dashboard',
  description: 'Edit your personal information and preferences',
}

export default async function ProfileEditPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/signin')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true
    }
  })

  if (!user) {
    redirect('/signin')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-gray-600">Update your personal information and preferences</p>
        </div>
      </div>

      <ProfileEditForm user={user} />
    </div>
  )
}
