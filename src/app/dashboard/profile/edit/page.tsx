import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ProfileEditForm } from '@/components/dashboard/profile-edit-form'
import { PasswordChangeForm } from '@/components/dashboard/password-change-form'
import { UserSettingsForm } from '@/components/dashboard/user-settings-form'
import { SecurityActivityLog } from '@/components/dashboard/security-activity-log'

export default async function ProfileEditPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/signin')
  }

  // Fetch user data with profile
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
        <p className="text-gray-600 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="space-y-8">
        {/* Profile Information Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
          <ProfileEditForm user={user} />
        </div>

        {/* User Settings Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Preferences & Settings</h2>
          <UserSettingsForm initialData={user} />
        </div>

        {/* Security Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PasswordChangeForm />
            <SecurityActivityLog />
          </div>
        </div>
      </div>
    </div>
  )
}
