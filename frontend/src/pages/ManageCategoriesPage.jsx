import { useEffect, useState } from 'react'

import { catalogApi } from '../api/endpoints'
import { getApiErrorMessage } from '../utils/error'

function ManageCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({ name: '', description: '' })
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadCategories = async () => {
    setLoading(true)
    try {
      const response = await catalogApi.getCategories()
      setCategories(response.data)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load categories.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      if (editingId) {
        await catalogApi.updateCategory(editingId, form)
      } else {
        await catalogApi.createCategory(form)
      }

      setForm({ name: '', description: '' })
      setEditingId(null)
      await loadCategories()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Category save failed.'))
    }
  }

  const onEdit = (category) => {
    setEditingId(category.id)
    setForm({ name: category.name, description: category.description })
  }

  const onDelete = async (id) => {
    setError('')
    try {
      await catalogApi.deleteCategory(id)
      await loadCategories()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Category delete failed.'))
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brandBlue">Manage Categories</h1>
      {error && <p className="text-sm text-brandRed">{error}</p>}

      <form onSubmit={handleSubmit} className="card grid gap-3 p-4">
        <input
          className="rounded-lg border px-3 py-2"
          placeholder="Category Name"
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          required
        />
        <textarea
          className="rounded-lg border px-3 py-2"
          placeholder="Description"
          value={form.description}
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
        />
        <button type="submit" className="w-fit rounded-lg bg-brandBlue px-4 py-2 font-semibold text-white">
          {editingId ? 'Update Category' : 'Create Category'}
        </button>
      </form>

      <div className="space-y-3">
        {loading && <p className="text-slate-500">Loading categories...</p>}
        {!loading && categories.length === 0 && <p className="text-slate-500">No categories found.</p>}
        {categories.map((category) => (
          <article key={category.id} className="card flex items-start justify-between p-4">
            <div>
              <h2 className="text-lg font-semibold">{category.name}</h2>
              <p className="text-sm text-slate-600">{category.description}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => onEdit(category)} className="rounded-md bg-brandBlue px-3 py-1 text-xs font-semibold text-white">
                Edit
              </button>
              <button type="button" onClick={() => onDelete(category.id)} className="rounded-md bg-brandRed px-3 py-1 text-xs font-semibold text-white">
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default ManageCategoriesPage
