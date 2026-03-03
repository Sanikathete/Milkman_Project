import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { catalogApi, subscriptionApi } from '../api/endpoints'
import { getApiErrorMessage } from '../utils/error'

function SubscriptionFormPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [form, setForm] = useState({
    frequency: 'Daily',
    start_date: '',
    end_date: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      const response = await catalogApi.getProduct(productId)
      setProduct(response.data)
    }
    fetchProduct()
  }, [productId])

  const onChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload = {
        product: Number(productId),
        frequency: form.frequency,
        start_date: form.start_date,
      }
      if (form.end_date) {
        payload.end_date = form.end_date
      }

      const response = await subscriptionApi.createSubscription(payload)
      navigate(`/payment/subscription/${response.data.id}`)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Subscription creation failed.'))
    } finally {
      setLoading(false)
    }
  }

  if (!product) {
    return <p>Loading subscription form...</p>
  }

  return (
    <div className="mx-auto max-w-2xl card p-6">
      <h1 className="text-2xl font-bold text-brandBlue">Subscribe to {product.name}</h1>
      <p className="mt-1 text-slate-600">Choose delivery frequency and start date.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Frequency</label>
          <select name="frequency" value={form.frequency} onChange={onChange} className="w-full rounded-lg border px-3 py-2">
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Start Date</label>
            <input type="date" name="start_date" value={form.start_date} onChange={onChange} className="w-full rounded-lg border px-3 py-2" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">End Date (Optional)</label>
            <input type="date" name="end_date" value={form.end_date} onChange={onChange} className="w-full rounded-lg border px-3 py-2" />
          </div>
        </div>

        {error && <p className="text-sm text-brandRed">{error}</p>}

        <button type="submit" disabled={loading} className="rounded-lg bg-brandBlue px-5 py-2 font-semibold text-white">
          {loading ? 'Creating subscription...' : 'Proceed to Payment'}
        </button>
      </form>
    </div>
  )
}

export default SubscriptionFormPage
