import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { orderApi, paymentApi } from '../api/endpoints'
import { getApiErrorMessage } from '../utils/error'

function OrderPaymentPage() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOrder = async () => {
      setError('')
      try {
        const response = await orderApi.getOrder(orderId)
        setOrder(response.data)
      } catch (err) {
        setError(getApiErrorMessage(err, 'Unable to load payment details.'))
        setOrder(null)
      }
    }
    fetchOrder()
  }, [orderId])

  const handlePayment = async () => {
    setStatus('loading')
    setMessage('')

    try {
      const response = await paymentApi.payOrder({
        order_id: Number(orderId),
      })
      const checkoutUrl = response.data?.checkout_url
      if (checkoutUrl) {
        window.location.assign(checkoutUrl)
        return
      }
      setMessage('Unable to start checkout. Please try again.')
      setStatus('error')
    } catch (err) {
      setStatus('error')
      setMessage(getApiErrorMessage(err, 'Payment failed.'))
    }
  }

  if (!order && !error) {
    return <p>Loading payment details...</p>
  }

  if (error) {
    return <p className="text-brandRed">{error}</p>
  }

  return (
    <div className="mx-auto max-w-xl card p-6">
      <h1 className="text-2xl font-bold text-brandBlue">Order Payment</h1>
      <div className="mt-4 space-y-2 text-sm">
        <p><span className="font-semibold">Product:</span> {order.product_name}</p>
        <p><span className="font-semibold">Quantity:</span> {order.quantity}</p>
        <p><span className="font-semibold">Total:</span> INR {order.total_price}</p>
        <p><span className="font-semibold">Payment Status:</span> {order.payment_status}</p>
      </div>

      {order.payment_status !== 'Paid' ? (
        <button
          type="button"
          onClick={handlePayment}
          disabled={status === 'loading'}
          className="mt-6 rounded-lg bg-brandRed px-5 py-2 font-semibold text-white"
        >
          {status === 'loading' ? 'Redirecting...' : 'Pay with Stripe'}
        </button>
      ) : (
        <p className="mt-6 font-semibold text-green-700">Order already paid via {order.payment_method || 'N/A'}.</p>
      )}

      {message && (
        <p className={`mt-4 text-sm ${status === 'success' ? 'text-green-700' : 'text-brandRed'}`}>
          {message}
        </p>
      )}

      <Link to="/dashboard" className="mt-5 inline-block text-sm font-semibold text-brandBlue">
        Go to Dashboard
      </Link>
    </div>
  )
}

export default OrderPaymentPage
