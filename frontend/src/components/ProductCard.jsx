import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { getProductImageCandidates } from '../utils/productImage'

const mediaBaseUrl = import.meta.env.VITE_MEDIA_BASE_URL ?? 'http://127.0.0.1:8000'

function ProductCard({ product }) {
  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()
  const navigate = useNavigate()

  const backendImage = product.image ? `${mediaBaseUrl}${product.image}` : null
  const placeholder = 'https://placehold.co/600x400/F4F8FF/0B4FAF?text=Rajan+Dairy'

  const imageCandidates = useMemo(
    () => getProductImageCandidates(product.name, backendImage, placeholder),
    [product.name, backendImage],
  )
  const [imageIndex, setImageIndex] = useState(0)

  useEffect(() => {
    setImageIndex(0)
  }, [product.id, product.name, backendImage])

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

  const handleImageError = () => {
    setImageIndex((prev) => (prev < imageCandidates.length - 1 ? prev + 1 : prev))
  }

  return (
    <article className="card overflow-hidden">
      <img
        src={imageCandidates[imageIndex]}
        alt={product.name}
        className="h-44 w-full object-cover"
        onError={handleImageError}
      />
      <div className="space-y-3 p-4">
        <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
        <p className="text-sm text-slate-500">{product.category_name}</p>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xl font-bold text-brandBlue">INR {product.price}</p>
          <div className="flex gap-2">
            <Link to={`/products/${product.id}`} className="rounded-lg border border-brandBlue px-3 py-2 text-xs font-semibold text-brandBlue">
              Details
            </Link>
            <button type="button" onClick={onAddToCart} className="rounded-lg bg-brandRed px-3 py-2 text-xs font-semibold text-white">
              Add to Cart
            </button>
            <button type="button" onClick={() => requireAuthThenNavigate(`/subscribe/${product.id}`)} className="rounded-lg bg-brandBlue px-3 py-2 text-xs font-semibold text-white">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

export default ProductCard
