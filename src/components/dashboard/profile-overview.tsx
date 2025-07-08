'use client'

import { User, UserProfile } from '@prisma/client'
import { useEffect, useState } from 'react'

interface ProfileOverviewProps {
  user: User & {
    profile?: UserProfile | null
    _count?: {
      securityLogs: number
    }
  }
}

export function ProfileOverview({ user }: ProfileOverviewProps) {
  const [mounted, setMounted] = useState(false)
  const profileCompletion = calculateProfileCompletion(user)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <ProfileOverviewSkeleton />
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-xl font-semibold text-white">
              {(user.firstName || user.name || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name || 'User'}
            </h2>
            <p className="text-gray-600">{user.email}</p>
            {user.profile?.occupation && (
              <p className="text-sm text-gray-500">{user.profile.occupation}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Profile Completion</div>
          <div className="flex items-center mt-1">
            <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${profileCompletion}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-900">{profileCompletion}%</span>
          </div>
        </div>
      </div>

      {user.bio && (
        <div className="mt-4">
          <p className="text-gray-700">{user.bio}</p>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-600 space-y-1">
        <p>📅 Joined {new Date(user.createdAt).toLocaleDateString()}</p>
        {user.location && <p>📍 Location: {user.location}</p>}
        {user.website && (
          <p>
            🔗 Website: <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{user.website}</a>
          </p>
        )}
      </div>

      {user.profile && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Professional Information</h3>
          <div className="space-y-1 text-sm text-gray-600">
            {user.profile.company && <p>🏢 Company: {user.profile.company}</p>}
            {user.profile.industry && <p>🏭 Industry: {user.profile.industry}</p>}
            {user.profile.occupation && <p>💼 Role: {user.profile.occupation}</p>}
          </div>
        </div>
      )}
    </div>
  )
}

function ProfileOverviewSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-gray-200 animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="text-right">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-2 w-24 bg-gray-200 rounded mt-2 animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}

function calculateProfileCompletion(user: User & { profile?: UserProfile | null }): number {
  const fields = [
    user.firstName,
    user.lastName,
    user.bio,
    user.avatar,
    user.location,
    user.profile?.occupation,
    user.profile?.company,
    user.phone,
    user.website
  ]

  const completed = fields.filter(field => field && String(field).trim() !== '').length
  return Math.round((completed / fields.length) * 100)
}
