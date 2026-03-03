import { useEffect, useState } from 'react'

import { catalogApi } from '../api/endpoints'
import { getApiErrorMessage } from '../utils/error'

function ManageProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    category: '',
    name: '',
    description: '',
    price: '',
    is_available: true,
    image: null,
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        catalogApi.getProducts(),
        catalogApi.getCategories(),
      ])
      setProducts(productsResponse.data)
      setCategories(categoriesResponse.data)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load products.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleInput = (event) => {
    const { name, value, type, checked, files } = event.target
    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }))
      return
    }
    if (type === 'file') {
      setForm((prev) => ({ ...prev, [name]: files?.[0] || null }))
      return
    }
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const createPayload = () => {
    const payload = new FormData()
    payload.append('category', form.category)
    payload.append('name', form.name)
    payload.append('description', form.description)
    payload.append('price', form.price)
    payload.append('is_available', String(form.is_available))
    if (form.image) {
      payload.append('image', form.image)
    }
    return payload
  }

  const resetForm = () => {
    setEditingId(null)
    setForm({ category: '', name: '', description: '', price: '', is_available: true, image: null })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      const payload = createPayload()
      if (editingId) {
        await catalogApi.updateProduct(editingId, payload)
      } else {
        await catalogApi.createProduct(payload)
      }

      resetForm()
      await loadData()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Product save failed.'))
    }
  }

  const onEdit = async (id) => {
    setError('')
    try {
      const response = await catalogApi.getProduct(id)
      const product = response.data

      setEditingId(product.id)
      setForm({
        category: String(product.category.id),
        name: product.name,
        description: product.description || '',
        price: product.price,
        is_available: product.is_available,
        image: null,
      })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load product details.'))
    }
  }

  const onDelete = async (id) => {
    setError('')
    try {
      await catalogApi.deleteProduct(id)
      await loadData()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Product delete failed.'))
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brandBlue">Manage Products</h1>
      {error && <p className="text-sm text-brandRed">{error}</p>}

      <form onSubmit={handleSubmit} className="card grid gap-3 p-4 md:grid-cols-2">
        <select name="category" value={form.category} onChange={handleInput} className="rounded-lg border px-3 py-2" required>
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        <input name="name" value={form.name} onChange={handleInput} className="rounded-lg border px-3 py-2" placeholder="Product Name" required />
        <input name="price" type="number" min="1" step="0.01" value={form.price} onChange={handleInput} className="rounded-lg border px-3 py-2" placeholder="Price" required />
        <input name="image" type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleInput} className="rounded-lg border px-3 py-2" />
        <textarea name="description" value={form.description} onChange={handleInput} className="rounded-lg border px-3 py-2 md:col-span-2" placeholder="Description" />
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="is_available" checked={form.is_available} onChange={handleInput} />
          Product available
        </label>
        <button type="submit" className="w-fit rounded-lg bg-brandBlue px-4 py-2 font-semibold text-white">
          {editingId ? 'Update Product' : 'Create Product'}
        </button>
      </form>

      <div className="grid gap-3">
        {loading && <p className="text-slate-500">Loading products...</p>}
        {!loading && products.length === 0 && <p className="text-slate-500">No products found.</p>}
        {products.map((product) => (
          <article key={product.id} className="card flex items-center justify-between p-4">
            <div>
              <h2 className="text-lg font-semibold">{product.name}</h2>
              <p className="text-sm text-slate-600">INR {product.price} | {product.category_name}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onEdit(product.id)} className="rounded-md bg-brandBlue px-3 py-1 text-xs font-semibold text-white">Edit</button>
              <button onClick={() => onDelete(product.id)} className="rounded-md bg-brandRed px-3 py-1 text-xs font-semibold text-white">Delete</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default ManageProductsPage
