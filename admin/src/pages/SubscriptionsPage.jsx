import { useEffect, useState } from 'react'

import api from '../services/api'

function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([])
  const [productPrices, setProductPrices] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSubscriptions = async () => {
      setLoading(true)
      setError('')
      try {
        const [subsResponse, productsResponse] = await Promise.all([
          api.get('/subscriptions/admin/all/'),
          api.get('/products/'),
        ])
        const prices = {}
        productsResponse.data.forEach((product) => {
          prices[product.id] = Number(product.price)
        })
        setProductPrices(prices)
        setSubscriptions(subsResponse.data)
      } catch (err) {
        setError('Unable to load subscriptions.')
      } finally {
        setLoading(false)
      }
    }

    fetchSubscriptions()
  }, [])

  return (
    <div>
      <h1>Subscriptions</h1>
      {error && <p className="error">{error}</p>}
      {loading && <p className="notice">Loading subscriptions...</p>}
      {!loading && (
        <table className="table">
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Customer Name</th>
              <th>Item</th>
              <th>Total Value</th>
              <th>Starting Date</th>
              <th>Ending Date</th>
              <th>Subscription Status</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((subscription) => (
              <tr key={subscription.id}>
                <td>{subscription.user}</td>
                <td>{subscription.user_email}</td>
                <td>{subscription.product_name}</td>
                <td>INR {(productPrices[subscription.product] || 0).toFixed(2)}</td>
                <td>{new Date(subscription.start_date).toLocaleDateString()}</td>
                <td>{subscription.end_date ? new Date(subscription.end_date).toLocaleDateString() : '—'}</td>
                <td>
                  <span className="badge">{subscription.is_active ? 'Active' : 'Inactive'}</span>
                </td>
              </tr>
            ))}
            {subscriptions.length === 0 && (
              <tr>
                <td colSpan={7} className="notice">No subscriptions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default SubscriptionsPage