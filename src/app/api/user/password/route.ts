import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as bcrypt from 'bcryptjs'
import { z } from 'zod'

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must contain uppercase, lowercase, and number'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
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
    const { currentPassword, newPassword } = passwordChangeSchema.parse(body)

    // Get user with current password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, password_hash: true }
    })

    if (!user || !user.password_hash) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify current password using SYNC method for Windows compatibility
    const currentPasswordValid = bcrypt.compareSync(currentPassword, user.password_hash)
    if (!currentPasswordValid) {
      // Log failed password change attempt
      await prisma.securityLog.create({
        data: {
          userId: user.id,
          action: 'password_change_failed',
          details: { reason: 'invalid_current_password' },
          success: false,
          ipAddress: getClientIP(request),
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      })

      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }

    // Hash new password using SYNC method for Windows compatibility
    const newPasswordHash = bcrypt.hashSync(newPassword, 12)

    // Update password in database
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        password_hash: newPasswordHash,
        updatedAt: new Date()
      }
    })

    // Log successful password change
    await prisma.securityLog.create({
      data: {
        userId: user.id,
        action: 'password_changed',
        details: { timestamp: new Date().toISOString() },
        success: true,
        ipAddress: getClientIP(request),
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Password updated successfully' 
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Password change error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
