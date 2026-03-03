import { useEffect, useMemo, useState } from 'react'

import { catalogApi } from '../api/endpoints'
import CategoryFilter from '../components/CategoryFilter'
import ProductCard from '../components/ProductCard'

function HomePage() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [categoriesResponse, productsResponse] = await Promise.all([
          catalogApi.getCategories(),
          catalogApi.getProducts(),
        ])
        setCategories(categoriesResponse.data)
        setProducts(productsResponse.data)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') {
      return products
    }
    return products.filter((product) => product.category === activeCategory)
  }, [activeCategory, products])

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-r from-brandBlue to-blue-700 px-6 py-10 text-white sm:px-10">
        <img
          src="/Images/logo.png"
          alt="Rajan Dairy Logo"
          className="mb-4 h-16 w-auto rounded-md bg-white p-2"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
        <p className="text-sm uppercase tracking-[0.2em] text-blue-100">Sangamner, Ahmednagar</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Buy Once or Subscribe for Daily Delivery</h1>
        <p className="mt-3 max-w-3xl text-blue-100">
          Rajan Dairy lets families place one-time dairy orders or start reliable daily, weekly, and monthly subscriptions.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold text-slate-900">Shop by Category</h2>
        <CategoryFilter categories={categories} activeCategory={activeCategory} onSelect={setActiveCategory} />
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold text-slate-900">Products</h2>
        {loading ? (
          <p className="text-slate-500">Loading products...</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default HomePage
