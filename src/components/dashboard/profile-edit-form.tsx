'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { User, Briefcase, CheckCircle, AlertCircle } from 'lucide-react'

const basicInfoSchema = z.object({
  firstName: z.string().max(50, 'First name must be 50 characters or less').optional(),
  lastName: z.string().max(50, 'Last name must be 50 characters or less').optional(),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
  location: z.string().max(100, 'Location must be 100 characters or less').optional(),
  phone: z.string().max(20, 'Phone must be 20 characters or less').optional(),
  website: z.string().url('Please enter a valid URL').or(z.string().length(0)).optional(),
})

const professionalInfoSchema = z.object({
  occupation: z.string().max(100, 'Occupation must be 100 characters or less').optional(),
  company: z.string().max(100, 'Company must be 100 characters or less').optional(),
  industry: z.string().max(100, 'Industry must be 100 characters or less').optional(),
  experience: z.string().max(50, 'Experience must be 50 characters or less').optional(),
  linkedinUrl: z.string().url('Please enter a valid LinkedIn URL').or(z.string().length(0)).optional(),
  githubUrl: z.string().url('Please enter a valid GitHub URL').or(z.string().length(0)).optional(),
  twitterUrl: z.string().url('Please enter a valid Twitter URL').or(z.string().length(0)).optional(),
})

type BasicInfoFormData = z.infer<typeof basicInfoSchema>
type ProfessionalInfoFormData = z.infer<typeof professionalInfoSchema>

interface UserWithProfile {
  id: string
  firstName?: string | null
  lastName?: string | null
  bio?: string | null
  location?: string | null
  phone?: string | null
  website?: string | null
  profile?: {
    occupation?: string | null
    company?: string | null
    industry?: string | null
    experience?: string | null
    linkedinUrl?: string | null
    githubUrl?: string | null
    twitterUrl?: string | null
  } | null
}

interface ProfileEditFormProps {
  user: UserWithProfile
}

export function ProfileEditForm({ user }: ProfileEditFormProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'professional'>('basic')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const router = useRouter()

  const basicForm = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      bio: user.bio || '',
      location: user.location || '',
      phone: user.phone || '',
      website: user.website || '',
    },
    mode: 'onChange'
  })

  const professionalForm = useForm<ProfessionalInfoFormData>({
    resolver: zodResolver(professionalInfoSchema),
    defaultValues: {
      occupation: user.profile?.occupation || '',
      company: user.profile?.company || '',
      industry: user.profile?.industry || '',
      experience: user.profile?.experience || '',
      linkedinUrl: user.profile?.linkedinUrl || '',
      githubUrl: user.profile?.githubUrl || '',
      twitterUrl: user.profile?.twitterUrl || '',
    },
    mode: 'onChange'
  })

  const onSubmit = async (data: BasicInfoFormData | ProfessionalInfoFormData) => {
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: activeTab, ...data }),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
        setTimeout(() => {
          router.push('/dashboard/profile')
        }, 1500)
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update profile' })
      }
    } catch {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const currentForm = activeTab === 'basic' ? basicForm : professionalForm
  const isFormValid = currentForm.formState.isValid
  const isFormDirty = currentForm.formState.isDirty

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('basic')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'basic'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Basic Information
            </div>
          </button>
          <button
            onClick={() => setActiveTab('professional')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'professional'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <Briefcase className="h-4 w-4 mr-2" />
              Professional
            </div>
          </button>
        </nav>
      </div>

      {/* Form Content */}
      <div className="p-6">
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
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

        {/* Basic Information Tab */}
        {activeTab === 'basic' && (
          <form onSubmit={basicForm.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  {...basicForm.register('firstName')}
                  className={basicForm.formState.errors.firstName ? 'border-red-500' : ''}
                  placeholder="Enter your first name"
                />
                {basicForm.formState.errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{basicForm.formState.errors.firstName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  {...basicForm.register('lastName')}
                  className={basicForm.formState.errors.lastName ? 'border-red-500' : ''}
                  placeholder="Enter your last name"
                />
                {basicForm.formState.errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{basicForm.formState.errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                {...basicForm.register('bio')}
                className={basicForm.formState.errors.bio ? 'border-red-500' : ''}
                placeholder="Tell us about yourself"
                rows={4}
              />
              {basicForm.formState.errors.bio && (
                <p className="mt-1 text-sm text-red-600">{basicForm.formState.errors.bio.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  {...basicForm.register('location')}
                  className={basicForm.formState.errors.location ? 'border-red-500' : ''}
                  placeholder="City, Country"
                />
                {basicForm.formState.errors.location && (
                  <p className="mt-1 text-sm text-red-600">{basicForm.formState.errors.location.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  {...basicForm.register('phone')}
                  className={basicForm.formState.errors.phone ? 'border-red-500' : ''}
                  placeholder="+1 (555) 123-4567"
                />
                {basicForm.formState.errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{basicForm.formState.errors.phone.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                {...basicForm.register('website')}
                className={basicForm.formState.errors.website ? 'border-red-500' : ''}
                placeholder="https://yourwebsite.com"
              />
              {basicForm.formState.errors.website && (
                <p className="mt-1 text-sm text-red-600">{basicForm.formState.errors.website.message}</p>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={!isFormValid || !isFormDirty || isLoading}
                className="min-w-[120px]"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        )}

        {/* Professional Information Tab */}
        {activeTab === 'professional' && (
          <form onSubmit={professionalForm.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  {...professionalForm.register('occupation')}
                  className={professionalForm.formState.errors.occupation ? 'border-red-500' : ''}
                  placeholder="Software Developer"
                />
                {professionalForm.formState.errors.occupation && (
                  <p className="mt-1 text-sm text-red-600">{professionalForm.formState.errors.occupation.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  {...professionalForm.register('company')}
                  className={professionalForm.formState.errors.company ? 'border-red-500' : ''}
                  placeholder="Company Name"
                />
                {professionalForm.formState.errors.company && (
                  <p className="mt-1 text-sm text-red-600">{professionalForm.formState.errors.company.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  {...professionalForm.register('industry')}
                  className={professionalForm.formState.errors.industry ? 'border-red-500' : ''}
                  placeholder="Technology"
                />
                {professionalForm.formState.errors.industry && (
                  <p className="mt-1 text-sm text-red-600">{professionalForm.formState.errors.industry.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="experience">Experience</Label>
                <Input
                  id="experience"
                  {...professionalForm.register('experience')}
                  className={professionalForm.formState.errors.experience ? 'border-red-500' : ''}
                  placeholder="5+ years"
                />
                {professionalForm.formState.errors.experience && (
                  <p className="mt-1 text-sm text-red-600">{professionalForm.formState.errors.experience.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">Social Links</h4>
              
              <div>
                <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                <Input
                  id="linkedinUrl"
                  {...professionalForm.register('linkedinUrl')}
                  className={professionalForm.formState.errors.linkedinUrl ? 'border-red-500' : ''}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
                {professionalForm.formState.errors.linkedinUrl && (
                  <p className="mt-1 text-sm text-red-600">{professionalForm.formState.errors.linkedinUrl.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="githubUrl">GitHub URL</Label>
                <Input
                  id="githubUrl"
                  {...professionalForm.register('githubUrl')}
                  className={professionalForm.formState.errors.githubUrl ? 'border-red-500' : ''}
                  placeholder="https://github.com/yourusername"
                />
                {professionalForm.formState.errors.githubUrl && (
                  <p className="mt-1 text-sm text-red-600">{professionalForm.formState.errors.githubUrl.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="twitterUrl">Twitter URL</Label>
                <Input
                  id="twitterUrl"
                  {...professionalForm.register('twitterUrl')}
                  className={professionalForm.formState.errors.twitterUrl ? 'border-red-500' : ''}
                  placeholder="https://twitter.com/yourusername"
                />
                {professionalForm.formState.errors.twitterUrl && (
                  <p className="mt-1 text-sm text-red-600">{professionalForm.formState.errors.twitterUrl.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={!isFormValid || !isFormDirty || isLoading}
                className="min-w-[120px]"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
