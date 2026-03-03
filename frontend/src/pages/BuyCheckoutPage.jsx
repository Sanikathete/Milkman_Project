import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { catalogApi, orderApi } from '../api/endpoints'
import { getApiErrorMessage } from '../utils/error'

function BuyCheckoutPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      const response = await catalogApi.getProduct(productId)
      setProduct(response.data)
    }
    fetchProduct()
  }, [productId])

  const onSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await orderApi.createOrder({
        product: Number(productId),
        quantity: Number(quantity),
      })
      navigate(`/payment/order/${response.data.id}`)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Order creation failed.'))
    } finally {
      setLoading(false)
    }
  }

  if (!product) {
    return <p>Loading checkout...</p>
  }

  const total = Number(product.price) * Number(quantity || 1)

  return (
    <div className="mx-auto max-w-2xl card p-6">
      <h1 className="text-2xl font-bold text-brandBlue">Buy {product.name}</h1>
      <p className="mt-1 text-slate-600">One-time purchase checkout.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Quantity</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            className="w-full rounded-lg border px-3 py-2"
            required
          />
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
          <p><span className="font-semibold">Unit Price:</span> INR {product.price}</p>
          <p><span className="font-semibold">Total:</span> INR {total.toFixed(2)}</p>
        </div>

        {error && <p className="text-sm text-brandRed">{error}</p>}

        <button type="submit" disabled={loading} className="rounded-lg bg-brandBlue px-5 py-2 font-semibold text-white">
          {loading ? 'Creating order...' : 'Proceed to Payment'}
        </button>
      </form>
    </div>
  )
}

export default BuyCheckoutPage
