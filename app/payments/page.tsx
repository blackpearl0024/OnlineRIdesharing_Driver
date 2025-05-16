'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function PaymentHistory() {
  const { user, isLoaded } = useUser()
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user?.id) return
      
      try {
        const res = await fetch(`/api/payment/history?userId=${user.id}`)
        const data = await res.json()
        setPayments(data.payments || [])
      } catch (error) {
        console.error('Failed to fetch payments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [user?.id])

  if (!isLoaded || loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-160px)]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Header Section */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
            <p className="text-sm text-gray-500 mt-1">
              {payments.length} {payments.length === 1 ? 'transaction' : 'transactions'}
            </p>
          </div>
          {payments.length > 0 && (
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Make new payment
            </Link>
          )}
        </div>
      </div>

      {/* Payment List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {payments.length === 0 ? (
          <div className="text-center p-8">
            <div className="mx-auto h-16 w-16 text-gray-300 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments yet</h3>
            <p className="text-gray-500 mb-6">Your payment history will appear here</p>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Make your first payment
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {payments.map((payment) => (
              <li key={payment.id} className="px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center min-w-0">
                    <div className={`flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full ${
                      payment.type === 'sent' ? 'bg-red-100' : 'bg-green-100'
                    }`}>
                      {payment.type === 'sent' ? (
                        <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 5l7 7-7 7m-8-14l7 7-7 7" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-4 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {payment.type === 'sent' ? 'Sent to' : 'Received from'} {payment.counterparty.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(payment.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className={`text-sm font-semibold ${
                      payment.type === 'sent' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {payment.type === 'sent' ? '-' : '+'}{payment.amount} {payment.currency}
                    </p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                      payment.status === 'success' 
                        ? 'bg-green-100 text-green-800' 
                        : payment.status === 'failed' 
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}