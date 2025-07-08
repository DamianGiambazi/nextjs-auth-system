import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

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

// Helper function to extract IP address from Next.js request
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP.trim()
  }
  
  return 'unknown'
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const settingsData = userSettingsSchema.parse(body)

    // Separate user-level and profile-level settings
    const { theme, language, timezone, ...profileSettings } = settingsData

    // Update user-level settings
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        theme,
        language,
        timezone,
        updatedAt: new Date()
      }
    })

    // Update or create profile settings
    await prisma.userProfile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        ...profileSettings
      },
      update: {
        ...profileSettings,
        updatedAt: new Date()
      }
    })

    // Log the settings change
    await prisma.securityLog.create({
      data: {
        userId: session.user.id,
        action: 'settings_updated',
        details: { 
          changes: Object.keys(settingsData),
          timestamp: new Date().toISOString() 
        },
        success: true,
        ipAddress: getClientIP(request),
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Settings updated successfully' 
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Settings update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user settings with profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        theme: true,
        language: true,
        timezone: true,
        profile: {
          select: {
            emailNotifications: true,
            pushNotifications: true,
            marketingEmails: true,
            securityAlerts: true,
            profileVisibility: true,
            showEmail: true,
            showPhone: true,
            showLocation: true,
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      data: user 
    })

  } catch (err) {
    console.error('Settings fetch error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
