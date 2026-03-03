import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { orderApi } from '../api/endpoints'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { getApiErrorMessage } from '../utils/error'

function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const checkout = async (goToPayment) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { redirectTo: '/cart' } })
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const createdOrders = []

      for (const item of items) {
        const response = await orderApi.createOrder({
          product: item.product.id,
          quantity: item.quantity,
        })
        createdOrders.push(response.data)
      }

      clearCart()

      if (goToPayment && createdOrders.length > 0) {
        navigate(`/payment/order/${createdOrders[0].id}`)
        return
      }

      setMessage('Orders placed successfully. Please complete payment from dashboard.')
      navigate('/dashboard')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Checkout failed.'))
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl card p-6">
        <h1 className="text-2xl font-bold text-brandBlue">My Cart</h1>
        <p className="mt-3 text-slate-600">Your cart is empty.</p>
        <Link to="/" className="mt-4 inline-block rounded-lg bg-brandBlue px-4 py-2 font-semibold text-white">
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <h1 className="text-2xl font-bold text-brandBlue">My Cart</h1>

      {items.map((item) => (
        <article key={item.product.id} className="card flex items-center justify-between gap-4 p-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{item.product.name}</h2>
            <p className="text-sm text-slate-600">INR {item.product.price} each</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(event) => updateQuantity(item.product.id, Number(event.target.value))}
              className="w-20 rounded-lg border px-2 py-1"
            />
            <p className="font-semibold text-brandBlue">INR {(Number(item.product.price) * item.quantity).toFixed(2)}</p>
            <button
              type="button"
              onClick={() => removeFromCart(item.product.id)}
              className="rounded-md bg-brandRed px-3 py-1 text-xs font-semibold text-white"
            >
              Remove
            </button>
          </div>
        </article>
      ))}

      <div className="card p-4">
        <p className="text-lg font-bold text-slate-900">Cart Total: INR {cartTotal.toFixed(2)}</p>
        {error && <p className="mt-2 text-sm text-brandRed">{error}</p>}
        {message && <p className="mt-2 text-sm text-green-700">{message}</p>}

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => checkout(true)}
            className="rounded-lg bg-brandBlue px-4 py-2 font-semibold text-white"
          >
            {loading ? 'Processing...' : 'Proceed with Payment'}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => checkout(false)}
            className="rounded-lg border border-brandBlue px-4 py-2 font-semibold text-brandBlue"
          >
            Place Order (Pay Later)
          </button>
          <button
            type="button"
            onClick={clearCart}
            className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700"
          >
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  )
}

export default CartPage
