'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react'

export default function RecentPaymentsList() {
  const { user } = useUser()
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user?.id) return
      
      try {
        const res = await fetch(`/api/payment/history?userId=${user.id}`)
        const data = await res.json()
        setPayments(data.payments.slice(0, 3)) // Show only 3 most recent
      } catch (error) {
        console.error('Failed to fetch payments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [user?.id])

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
      </div>
    )
  }

  if (payments.length === 0) {
    return <p className="text-gray-500 text-sm py-4">No recent payments found</p>
  }

  return (
    <div className="space-y-4">
      {payments.map((payment) => (
        <div key={payment.id} className="border-b pb-4 last:border-0 last:pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                payment.type === 'sent' ? 'bg-red-100' : 'bg-green-100'
              }`}>
                {payment.type === 'sent' ? (
                  <ArrowUpRight className="h-4 w-4 text-red-600" />
                ) : (
                  <ArrowDownLeft className="h-4 w-4 text-green-600" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {payment.type === 'sent' ? 'Paid to' : 'Received from'} {payment.counterparty.name}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(payment.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-semibold ${
                payment.type === 'sent' ? 'text-red-600' : 'text-green-600'
              }`}>
                {payment.type === 'sent' ? '-' : '+'}₹{payment.amount}
              </p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                payment.status === 'success' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {payment.status}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}