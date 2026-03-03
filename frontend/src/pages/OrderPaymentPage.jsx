import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { orderApi, paymentApi } from '../api/endpoints'
import { getApiErrorMessage } from '../utils/error'

function OrderPaymentPage() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Card')
  const [details, setDetails] = useState({
    card_holder: '',
    card_last4: '',
    expiry: '',
    upi_id: '',
    bank_name: '',
    txn_ref: '',
  })

  useEffect(() => {
    const fetchOrder = async () => {
      const response = await orderApi.getOrder(orderId)
      setOrder(response.data)
    }
    fetchOrder()
  }, [orderId])

  const updateDetail = (key, value) => {
    setDetails((prev) => ({ ...prev, [key]: value }))
  }

  const getPayloadDetails = () => {
    if (paymentMethod === 'Card') {
      return {
        card_holder: details.card_holder,
        card_last4: details.card_last4,
        expiry: details.expiry,
      }
    }
    if (paymentMethod === 'UPI') {
      return {
        upi_id: details.upi_id,
        txn_ref: details.txn_ref,
      }
    }
    if (paymentMethod === 'NetBanking') {
      return {
        bank_name: details.bank_name,
        txn_ref: details.txn_ref,
      }
    }
    return {}
  }

  const handlePayment = async () => {
    setStatus('loading')
    setMessage('')

    try {
      await paymentApi.payOrder({
        order_id: Number(orderId),
        payment_method: paymentMethod,
        details: getPayloadDetails(),
      })
      setMessage('Payment successful. Your order is confirmed.')
      setStatus('success')
      const latest = await orderApi.getOrder(orderId)
      setOrder(latest.data)
    } catch (err) {
      setStatus('error')
      setMessage(getApiErrorMessage(err, 'Payment failed.'))
    }
  }

  if (!order) {
    return <p>Loading payment details...</p>
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

      {order.payment_status !== 'Paid' && (
        <div className="mt-5 space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="Card">Card</option>
              <option value="UPI">UPI</option>
              <option value="NetBanking">Net Banking</option>
              <option value="COD">Cash on Delivery</option>
            </select>
          </div>

          {paymentMethod === 'Card' && (
            <div className="grid gap-3">
              <input className="rounded-lg border px-3 py-2" placeholder="Card Holder Name" value={details.card_holder} onChange={(e) => updateDetail('card_holder', e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <input className="rounded-lg border px-3 py-2" placeholder="Last 4 digits" maxLength={4} value={details.card_last4} onChange={(e) => updateDetail('card_last4', e.target.value)} />
                <input className="rounded-lg border px-3 py-2" placeholder="MM/YY" value={details.expiry} onChange={(e) => updateDetail('expiry', e.target.value)} />
              </div>
            </div>
          )}

          {paymentMethod === 'UPI' && (
            <div className="grid gap-3">
              <input className="rounded-lg border px-3 py-2" placeholder="UPI ID" value={details.upi_id} onChange={(e) => updateDetail('upi_id', e.target.value)} />
              <input className="rounded-lg border px-3 py-2" placeholder="Transaction Reference" value={details.txn_ref} onChange={(e) => updateDetail('txn_ref', e.target.value)} />
            </div>
          )}

          {paymentMethod === 'NetBanking' && (
            <div className="grid gap-3">
              <input className="rounded-lg border px-3 py-2" placeholder="Bank Name" value={details.bank_name} onChange={(e) => updateDetail('bank_name', e.target.value)} />
              <input className="rounded-lg border px-3 py-2" placeholder="Transaction Reference" value={details.txn_ref} onChange={(e) => updateDetail('txn_ref', e.target.value)} />
            </div>
          )}
        </div>
      )}

      {order.payment_status !== 'Paid' ? (
        <button
          type="button"
          onClick={handlePayment}
          disabled={status === 'loading'}
          className="mt-6 rounded-lg bg-brandRed px-5 py-2 font-semibold text-white"
        >
          {status === 'loading' ? 'Processing...' : 'Pay Now'}
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
