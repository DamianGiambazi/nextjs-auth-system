import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // Fetch security logs for the user
    const securityLogs = await prisma.securityLog.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: Math.min(limit, 50), // Maximum 50 records per request
      skip: offset,
      select: {
        id: true,
        action: true,
        details: true,
        success: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
      }
    })

    // Get total count for pagination
    const totalCount = await prisma.securityLog.count({
      where: {
        userId: session.user.id
      }
    })

    return NextResponse.json({
      success: true,
      data: securityLogs,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + securityLogs.length < totalCount
      }
    })

  } catch (error) {
    console.error('Security logs fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
