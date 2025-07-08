'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { User, UserProfile } from '@prisma/client'

const basicInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  bio: z.string().max(500, 'Bio must be under 500 characters').optional(),
  location: z.string().max(100).optional(),
  website: z.string().url('Invalid URL format').optional().or(z.literal('')),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone format').optional().or(z.literal('')),
})

const professionalInfoSchema = z.object({
  occupation: z.string().max(100).optional(),
  company: z.string().max(100).optional(),
  industry: z.string().max(100).optional(),
  experience: z.enum(['Entry', 'Junior', 'Mid', 'Senior', 'Lead', 'Executive']).optional(),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  githubUrl: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  twitterUrl: z.string().url('Invalid Twitter URL').optional().or(z.literal('')),
})

type BasicInfoData = z.infer<typeof basicInfoSchema>
type ProfessionalInfoData = z.infer<typeof professionalInfoSchema>

interface ProfileEditFormProps {
  user: User & {
    profile?: UserProfile | null
  }
}

export function ProfileEditForm({ user }: ProfileEditFormProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'professional'>('basic')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const basicForm = useForm<BasicInfoData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      bio: user.bio || '',
      location: user.location || '',
      website: user.website || '',
      phone: user.phone || '',
    }
  })

  const professionalForm = useForm<ProfessionalInfoData>({
    resolver: zodResolver(professionalInfoSchema),
    defaultValues: {
      occupation: user.profile?.occupation || '',
      company: user.profile?.company || '',
      industry: user.profile?.industry || '',
      experience: user.profile?.experience as any || '',
      linkedinUrl: user.profile?.linkedinUrl || '',
      githubUrl: user.profile?.githubUrl || '',
      twitterUrl: user.profile?.twitterUrl || '',
    }
  })

  const onBasicSubmit = async (data: BasicInfoData) => {
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'basic',
          ...data
        }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage('Profile updated successfully!')
        setTimeout(() => {
          router.refresh()
          router.push('/dashboard/profile')
        }, 1500)
      } else {
        setMessage(result.error || 'Update failed')
      }
    } catch {
      setMessage('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const onProfessionalSubmit = async (data: ProfessionalInfoData) => {
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'professional',
          ...data
        }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage('Professional information updated successfully!')
        setTimeout(() => {
          router.refresh()
          router.push('/dashboard/profile')
        }, 1500)
      } else {
        setMessage(result.error || 'Update failed')
      }
    } catch {
      setMessage('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('basic')}
            className={`py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'basic'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            📝 Basic Information
          </button>
          <button
            onClick={() => setActiveTab('professional')}
            className={`py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'professional'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            💼 Professional
          </button>
        </nav>
      </div>

      {/* Form Content */}
      <div className="p-6">
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.includes('success')
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {activeTab === 'basic' ? (
          <form onSubmit={basicForm.handleSubmit(onBasicSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  {...basicForm.register('firstName')}
                  className={basicForm.formState.errors.firstName ? 'border-red-500' : ''}
                />
                {basicForm.formState.errors.firstName && (
                  <p className="text-sm text-red-500 mt-1">{basicForm.formState.errors.firstName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  {...basicForm.register('lastName')}
                  className={basicForm.formState.errors.lastName ? 'border-red-500' : ''}
                />
                {basicForm.formState.errors.lastName && (
                  <p className="text-sm text-red-500 mt-1">{basicForm.formState.errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                {...basicForm.register('bio')}
                rows={4}
                placeholder="Tell us about yourself..."
                className={basicForm.formState.errors.bio ? 'border-red-500' : ''}
              />
              {basicForm.formState.errors.bio && (
                <p className="text-sm text-red-500 mt-1">{basicForm.formState.errors.bio.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  {...basicForm.register('location')}
                  placeholder="City, Country"
                  className={basicForm.formState.errors.location ? 'border-red-500' : ''}
                />
                {basicForm.formState.errors.location && (
                  <p className="text-sm text-red-500 mt-1">{basicForm.formState.errors.location.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  {...basicForm.register('phone')}
                  placeholder="+1 (555) 123-4567"
                  className={basicForm.formState.errors.phone ? 'border-red-500' : ''}
                />
                {basicForm.formState.errors.phone && (
                  <p className="text-sm text-red-500 mt-1">{basicForm.formState.errors.phone.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                {...basicForm.register('website')}
                placeholder="https://yourwebsite.com"
                className={basicForm.formState.errors.website ? 'border-red-500' : ''}
              />
              {basicForm.formState.errors.website && (
                <p className="text-sm text-red-500 mt-1">{basicForm.formState.errors.website.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/profile')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !basicForm.formState.isDirty}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={professionalForm.handleSubmit(onProfessionalSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="occupation">Job Title</Label>
                <Input
                  id="occupation"
                  {...professionalForm.register('occupation')}
                  placeholder="Software Engineer"
                />
              </div>

              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  {...professionalForm.register('company')}
                  placeholder="Company Name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  {...professionalForm.register('industry')}
                  placeholder="Technology"
                />
              </div>

              <div>
                <Label htmlFor="experience">Experience Level</Label>
                <select
                  id="experience"
                  {...professionalForm.register('experience')}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select experience level</option>
                  <option value="Entry">Entry Level</option>
                  <option value="Junior">Junior</option>
                  <option value="Mid">Mid Level</option>
                  <option value="Senior">Senior</option>
                  <option value="Lead">Lead</option>
                  <option value="Executive">Executive</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Social Links</h3>
              
              <div>
                <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                <Input
                  id="linkedinUrl"
                  {...professionalForm.register('linkedinUrl')}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className={professionalForm.formState.errors.linkedinUrl ? 'border-red-500' : ''}
                />
                {professionalForm.formState.errors.linkedinUrl && (
                  <p className="text-sm text-red-500 mt-1">{professionalForm.formState.errors.linkedinUrl.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="githubUrl">GitHub URL</Label>
                <Input
                  id="githubUrl"
                  {...professionalForm.register('githubUrl')}
                  placeholder="https://github.com/yourusername"
                  className={professionalForm.formState.errors.githubUrl ? 'border-red-500' : ''}
                />
                {professionalForm.formState.errors.githubUrl && (
                  <p className="text-sm text-red-500 mt-1">{professionalForm.formState.errors.githubUrl.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="twitterUrl">Twitter URL</Label>
                <Input
                  id="twitterUrl"
                  {...professionalForm.register('twitterUrl')}
                  placeholder="https://twitter.com/yourusername"
                  className={professionalForm.formState.errors.twitterUrl ? 'border-red-500' : ''}
                />
                {professionalForm.formState.errors.twitterUrl && (
                  <p className="text-sm text-red-500 mt-1">{professionalForm.formState.errors.twitterUrl.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/profile')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !professionalForm.formState.isDirty}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
