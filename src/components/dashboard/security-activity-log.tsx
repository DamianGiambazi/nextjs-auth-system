'use client'

import { useEffect, useState } from 'react'
import { Shield, Clock, MapPin, Monitor, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react'

interface SecurityEvent {
  id: string
  action: string
  details: any
  success: boolean
  ipAddress?: string
  userAgent?: string
  createdAt: string
}

interface SecurityActivityLogProps {
  className?: string
}

export function SecurityActivityLog({ className = '' }: SecurityActivityLogProps) {
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSecurityEvents()
  }, [])

  const fetchSecurityEvents = async () => {
    try {
      const response = await fetch('/api/user/security-logs')
      const result = await response.json()

      if (response.ok) {
        setEvents(result.data || [])
      } else {
        setError(result.error || 'Failed to load security events')
      }
    } catch (error) {
      setError('Failed to load security events')
    } finally {
      setIsLoading(false)
    }
  }

  const getEventIcon = (action: string, success: boolean) => {
    if (!success) {
      return <XCircle className="h-4 w-4 text-red-500" />
    }

    switch (action) {
      case 'password_changed':
        return <Shield className="h-4 w-4 text-blue-500" />
      case 'settings_updated':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'profile_updated':
        return <Info className="h-4 w-4 text-blue-500" />
      case 'password_change_failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getEventTitle = (action: string, success: boolean) => {
    if (!success && action === 'password_change_failed') {
      return 'Failed password change attempt'
    }

    switch (action) {
      case 'password_changed':
        return 'Password changed'
      case 'settings_updated':
        return 'Settings updated'
      case 'profile_updated':
        return 'Profile updated'
      default:
        return action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60))
      return diffMins < 1 ? 'Just now' : `${diffMins} minutes ago`
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getBrowserInfo = (userAgent?: string) => {
    if (!userAgent) return 'Unknown browser'
    
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    return 'Unknown browser'
  }

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="flex items-center mb-4">
          <Shield className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="h-4 w-4 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-1" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="flex items-center mb-4">
          <Shield className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="text-center py-4">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <span className="text-sm text-gray-500">{events.length} events</span>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-8">
          <Shield className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No security events found</p>
          <p className="text-sm text-gray-400 mt-1">Your account activity will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.slice(0, 10).map((event) => (
            <div key={event.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0 mt-0.5">
                {getEventIcon(event.action, event.success)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {getEventTitle(event.action, event.success)}
                  </p>
                  <time className="text-xs text-gray-500">
                    {formatDate(event.createdAt)}
                  </time>
                </div>
                
                <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                  {event.ipAddress && (
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {event.ipAddress}
                    </div>
                  )}
                  {event.userAgent && (
                    <div className="flex items-center">
                      <Monitor className="h-3 w-3 mr-1" />
                      {getBrowserInfo(event.userAgent)}
                    </div>
                  )}
                </div>

                {event.details && typeof event.details === 'object' && (
                  <div className="mt-2 text-xs text-gray-400">
                    {event.details.reason && (
                      <span>Reason: {event.details.reason}</span>
                    )}
                    {event.details.changes && Array.isArray(event.details.changes) && (
                      <span>Changed: {event.details.changes.join(', ')}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {events.length > 10 && (
            <div className="text-center pt-4 border-t">
              <button className="text-sm text-blue-600 hover:text-blue-800">
                View all activity
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
