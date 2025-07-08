import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const basicInfoSchema = z.object({
  type: z.literal('basic'),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional().or(z.literal('')),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/).optional().or(z.literal('')),
})

const professionalInfoSchema = z.object({
  type: z.literal('professional'),
  occupation: z.string().max(100).optional(),
  company: z.string().max(100).optional(),
  industry: z.string().max(100).optional(),
  experience: z.enum(['Entry', 'Junior', 'Mid', 'Senior', 'Lead', 'Executive']).optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  twitterUrl: z.string().url().optional().or(z.literal('')),
})

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    if (body.type === 'basic') {
      const { firstName, lastName, bio, location, website, phone } = basicInfoSchema.parse(body)

      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          firstName,
          lastName,
          bio: bio || null,
          location: location || null,
          website: website || null,
          phone: phone || null,
          name: `${firstName} ${lastName}`,
        },
      })

      // Simple security logging without complex JSON
      await prisma.securityLog.create({
        data: {
          userId: session.user.id,
          action: 'PROFILE_UPDATED',
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Basic information updated successfully',
        user: updatedUser
      })
    }

    if (body.type === 'professional') {
      const { occupation, company, industry, experience, linkedinUrl, githubUrl, twitterUrl } = professionalInfoSchema.parse(body)

      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          profile: {
            upsert: {
              create: {
                occupation: occupation || null,
                company: company || null,
                industry: industry || null,
                experience: experience || null,
                linkedinUrl: linkedinUrl || null,
                githubUrl: githubUrl || null,
                twitterUrl: twitterUrl || null,
              },
              update: {
                occupation: occupation || null,
                company: company || null,
                industry: industry || null,
                experience: experience || null,
                linkedinUrl: linkedinUrl || null,
                githubUrl: githubUrl || null,
                twitterUrl: twitterUrl || null,
              }
            }
          }
        },
      })

      // Simple security logging
      await prisma.securityLog.create({
        data: {
          userId: session.user.id,
          action: 'PROFILE_UPDATED',
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Professional information updated successfully'
      })
    }

    return NextResponse.json({ success: false, error: 'Invalid update type' }, { status: 400 })

  } catch (error) {
    console.error('Profile update error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid input',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
