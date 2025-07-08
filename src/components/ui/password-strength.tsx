'use client'

import { Check, X } from 'lucide-react'

interface PasswordStrengthProps {
  password: string
  className?: string
}

export function PasswordStrength({ password, className = '' }: PasswordStrengthProps) {
  const requirements = [
    {
      label: 'At least 8 characters',
      test: (pwd: string) => pwd.length >= 8,
    },
    {
      label: 'Contains uppercase letter',
      test: (pwd: string) => /[A-Z]/.test(pwd),
    },
    {
      label: 'Contains lowercase letter',
      test: (pwd: string) => /[a-z]/.test(pwd),
    },
    {
      label: 'Contains number',
      test: (pwd: string) => /\d/.test(pwd),
    },
  ]

  const passed = requirements.filter(req => req.test(password)).length
  const strength = password.length === 0 ? 0 : passed

  const getStrengthColor = () => {
    if (strength === 0) return 'bg-gray-200'
    if (strength <= 1) return 'bg-red-500'
    if (strength <= 2) return 'bg-yellow-500'
    if (strength <= 3) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getStrengthText = () => {
    if (strength === 0) return ''
    if (strength <= 1) return 'Weak'
    if (strength <= 2) return 'Fair'
    if (strength <= 3) return 'Good'
    return 'Strong'
  }

  if (!password) return null

  return (
    <div className={className}>
      <div className="mb-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Password strength</span>
          <span className={`font-medium ${
            strength <= 1 ? 'text-red-600' :
            strength <= 2 ? 'text-yellow-600' :
            strength <= 3 ? 'text-blue-600' :
            'text-green-600'
          }`}>
            {getStrengthText()}
          </span>
        </div>
        <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${(strength / 4) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-1">
        {requirements.map((requirement, index) => {
          const isValid = requirement.test(password)
          return (
            <div key={index} className="flex items-center text-sm">
              {isValid ? (
                <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
              ) : (
                <X className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
              )}
              <span className={isValid ? 'text-green-700' : 'text-gray-500'}>
                {requirement.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
