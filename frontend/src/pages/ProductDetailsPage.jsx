import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { catalogApi } from '../api/endpoints'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { getProductImageCandidates } from '../utils/productImage'

const mediaBaseUrl = import.meta.env.VITE_MEDIA_BASE_URL ?? 'http://127.0.0.1:8000'

function ProductDetailsPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [imageIndex, setImageIndex] = useState(0)
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()

  useEffect(() => {
    const fetchProduct = async () => {
      setError('')
      setLoading(true)
      try {
        const response = await catalogApi.getProduct(id)
        setProduct(response.data)
      } catch (err) {
        setError('Unable to load product details right now.')
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const requireAuthThenNavigate = (path) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { redirectTo: path } })
      return
    }
    navigate(path)
  }

  const onAddToCart = () => {
    addToCart(product, 1)
  }

  const backendImage = product?.image ? `${mediaBaseUrl}${product.image}` : null
  const placeholder = 'https://placehold.co/900x600/F4F8FF/0B4FAF?text=Rajan+Dairy'

  const imageCandidates = useMemo(
    () => getProductImageCandidates(product?.name || '', backendImage, placeholder),
    [product?.name, backendImage],
  )

  useEffect(() => {
    setImageIndex(0)
  }, [product?.id, product?.name, backendImage])

  const handleImageError = () => {
    setImageIndex((prev) => (prev < imageCandidates.length - 1 ? prev + 1 : prev))
  }

  if (loading) return <p>Loading product...</p>
  if (error) return <p className="text-brandRed">{error}</p>
  if (!product) return <p>Product not found.</p>

  return (
    <div className="card overflow-hidden lg:grid lg:grid-cols-2">
      <img
        src={imageCandidates[imageIndex]}
        alt={product.name}
        className="h-full min-h-[320px] w-full object-cover"
        onError={handleImageError}
      />
      <div className="space-y-4 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brandBlue">{product.category.name}</p>
        <h1 className="text-3xl font-bold text-slate-900">{product.name}</h1>
        <p className="text-slate-600">{product.description || 'Fresh dairy product from Rajan Dairy.'}</p>
        <p className="text-2xl font-bold text-brandBlue">INR {product.price}</p>
        <div className="flex flex-wrap gap-3">
          <button onClick={onAddToCart} className="rounded-lg bg-brandRed px-5 py-2 font-semibold text-white">
            Add to Cart
          </button>
          <button onClick={() => requireAuthThenNavigate(`/buy/${id}`)} className="rounded-lg bg-red-700 px-5 py-2 font-semibold text-white">
            Buy Now
          </button>
          <button onClick={() => requireAuthThenNavigate(`/subscribe/${id}`)} className="rounded-lg bg-brandBlue px-5 py-2 font-semibold text-white">
            Subscribe
          </button>
          <Link to="/" className="rounded-lg border border-slate-300 px-5 py-2 font-semibold text-slate-700">
            Back
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailsPage
