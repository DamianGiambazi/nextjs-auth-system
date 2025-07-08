'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings, Globe, Bell, Shield, CheckCircle, AlertCircle } from 'lucide-react'

const userSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  language: z.string().min(2, 'Language is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  marketingEmails: z.boolean(),
  securityAlerts: z.boolean(),
  profileVisibility: z.enum(['private', 'public', 'friends']),
  showEmail: z.boolean(),
  showPhone: z.boolean(),
  showLocation: z.boolean(),
})

type UserSettingsFormData = z.infer<typeof userSettingsSchema>

interface UserSettingsFormProps {
  initialData: {
    theme?: string | null
    language?: string | null
    timezone?: string | null
    profile?: {
      emailNotifications?: boolean | null
      pushNotifications?: boolean | null
      marketingEmails?: boolean | null
      securityAlerts?: boolean | null
      profileVisibility?: string | null
      showEmail?: boolean | null
      showPhone?: boolean | null
      showLocation?: boolean | null
    } | null
  }
}

export function UserSettingsForm({ initialData }: UserSettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
  } = useForm<UserSettingsFormData>({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: {
      theme: (initialData.theme as 'light' | 'dark' | 'system') || 'system',
      language: initialData.language || 'en',
      timezone: initialData.timezone || 'UTC',
      emailNotifications: initialData.profile?.emailNotifications ?? true,
      pushNotifications: initialData.profile?.pushNotifications ?? true,
      marketingEmails: initialData.profile?.marketingEmails ?? false,
      securityAlerts: initialData.profile?.securityAlerts ?? true,
      profileVisibility: (initialData.profile?.profileVisibility as 'private' | 'public' | 'friends') || 'private',
      showEmail: initialData.profile?.showEmail ?? false,
      showPhone: initialData.profile?.showPhone ?? false,
      showLocation: initialData.profile?.showLocation ?? true,
    },
    mode: 'onChange'
  })

  const onSubmit = async (data: UserSettingsFormData) => {
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Settings updated successfully!' })
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update settings' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4 mr-2" />
            ) : (
              <AlertCircle className="h-4 w-4 mr-2" />
            )}
            {message.text}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Appearance Settings */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center mb-4">
            <Settings className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Appearance</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="theme">Theme</Label>
              <select
                id="theme"
                {...register('theme')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
              {errors.theme && (
                <p className="mt-1 text-sm text-red-600">{errors.theme.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="language">Language</Label>
              <select
                id="language"
                {...register('language')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
              {errors.language && (
                <p className="mt-1 text-sm text-red-600">{errors.language.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                {...register('timezone')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Asia/Tokyo">Tokyo</option>
              </select>
              {errors.timezone && (
                <p className="mt-1 text-sm text-red-600">{errors.timezone.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center mb-4">
            <Bell className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="emailNotifications"
                type="checkbox"
                {...register('emailNotifications')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor="emailNotifications" className="ml-3">
                Email notifications
              </Label>
            </div>

            <div className="flex items-center">
              <input
                id="pushNotifications"
                type="checkbox"
                {...register('pushNotifications')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor="pushNotifications" className="ml-3">
                Push notifications
              </Label>
            </div>

            <div className="flex items-center">
              <input
                id="marketingEmails"
                type="checkbox"
                {...register('marketingEmails')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor="marketingEmails" className="ml-3">
                Marketing emails
              </Label>
            </div>

            <div className="flex items-center">
              <input
                id="securityAlerts"
                type="checkbox"
                {...register('securityAlerts')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor="securityAlerts" className="ml-3">
                Security alerts (recommended)
              </Label>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center mb-4">
            <Shield className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Privacy</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="profileVisibility">Profile visibility</Label>
              <select
                id="profileVisibility"
                {...register('profileVisibility')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="private">Private</option>
                <option value="friends">Friends only</option>
                <option value="public">Public</option>
              </select>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Show in profile:</p>
              
              <div className="flex items-center">
                <input
                  id="showEmail"
                  type="checkbox"
                  {...register('showEmail')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <Label htmlFor="showEmail" className="ml-3">
                  Email address
                </Label>
              </div>

              <div className="flex items-center">
                <input
                  id="showPhone"
                  type="checkbox"
                  {...register('showPhone')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <Label htmlFor="showPhone" className="ml-3">
                  Phone number
                </Label>
              </div>

              <div className="flex items-center">
                <input
                  id="showLocation"
                  type="checkbox"
                  {...register('showLocation')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <Label htmlFor="showLocation" className="ml-3">
                  Location
                </Label>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!isValid || !isDirty || isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  )
}
