import { User, UserProfile, SecurityLog } from '@prisma/client'

// Enhanced User type with relations
export interface UserWithProfile extends User {
  profile?: UserProfile | null
  securityLogs?: SecurityLog[]
  _count?: {
    securityLogs: number
    accounts?: number
    sessions?: number
  }
}

// Profile update data types
export interface ProfileUpdateData {
  type: 'basic' | 'professional' | 'preferences' | 'privacy'
  data: Record<string, unknown>
}

// Security logging types
export interface SecurityLogData {
  action: string
  details?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  success?: boolean
}

// Profile completion calculation type
export interface ProfileCompletionItem {
  label: string
  completed: boolean
  action: string
  weight?: number
}

// User preferences type
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  emailNotifications: boolean
  pushNotifications: boolean
  marketingEmails: boolean
  profilePublic: boolean
  emailVisible: boolean
}

// Professional information type
export interface ProfessionalInfo {
  occupation?: string
  company?: string
  industry?: string
  experience?: 'Entry' | 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Executive'
  linkedinUrl?: string
  githubUrl?: string
  twitterUrl?: string
}

// Basic profile information type
export interface BasicProfileInfo {
  firstName?: string
  lastName?: string
  bio?: string
  phone?: string
  avatar?: string
  dateOfBirth?: Date
  location?: string
  website?: string
}
