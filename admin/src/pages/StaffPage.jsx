import { useEffect, useState } from 'react'

import api from '../services/api'

function toDisplayName(email) {
  if (!email) return 'Staff'
  const namePart = email.split('@')[0]
  return namePart.replace(/[._-]+/g, ' ')
}

function StaffPage() {
  const [staff, setStaff] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    email: '',
    password: '',
    position: '',
    salary: '',
    joining_date: '',
    is_active: true,
  })

  const fetchStaff = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/staff/')
      setStaff(response.data)
    } catch (err) {
      setError('Unable to load staff data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStaff()
  }, [])

  const resetForm = () => {
    setEditingId(null)
    setForm({
      email: '',
      password: '',
      position: '',
      salary: '',
      joining_date: '',
      is_active: true,
    })
    setFormError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    setSaving(true)

    try {
      if (editingId) {
        const payload = {
          email: form.email,
          is_active: form.is_active,
          staff_profile: {
            position: form.position,
            salary: form.salary ? Number(form.salary) : null,
            joining_date: form.joining_date || null,
          },
        }
        await api.patch(`/staff/${editingId}/`, payload)
      } else {
        const payload = {
          email: form.email,
          password: form.password,
          is_active: form.is_active,
          staff_profile: {
            position: form.position,
            salary: form.salary ? Number(form.salary) : null,
            joining_date: form.joining_date || null,
          },
        }
        await api.post('/staff/', payload)
      }

      resetForm()
      await fetchStaff()
    } catch (err) {
      setFormError('Unable to save staff member. Please check the details.')
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (member) => {
    setEditingId(member.id)
    setForm({
      email: member.email,
      password: '',
      position: member.staff_profile?.position || '',
      salary: member.staff_profile?.salary || '',
      joining_date: member.staff_profile?.joining_date || '',
      is_active: Boolean(member.is_active),
    })
  }

  const removeStaff = async (id) => {
    setFormError('')
    setSaving(true)
    try {
      await api.delete(`/staff/${id}/`)
      await fetchStaff()
    } catch (err) {
      setFormError('Unable to delete staff member.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1>Staff</h1>
      <form className="form" onSubmit={handleSubmit}>
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          required
        />
        {!editingId && (
          <input
            className="input"
            type="password"
            placeholder="Temporary Password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            required
          />
        )}
        <input
          className="input"
          type="text"
          placeholder="Position"
          value={form.position}
          onChange={(event) => setForm((prev) => ({ ...prev, position: event.target.value }))}
        />
        <input
          className="input"
          type="number"
          min="0"
          step="0.01"
          placeholder="Salary"
          value={form.salary}
          onChange={(event) => setForm((prev) => ({ ...prev, salary: event.target.value }))}
        />
        <input
          className="input"
          type="date"
          value={form.joining_date}
          onChange={(event) => setForm((prev) => ({ ...prev, joining_date: event.target.value }))}
        />
        <label className="notice">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(event) => setForm((prev) => ({ ...prev, is_active: event.target.checked }))}
          />
          {' '}Active Staff
        </label>
        {formError && <p className="error">{formError}</p>}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button type="submit" className="button" disabled={saving}>
            {saving ? 'Saving...' : editingId ? 'Update Staff' : 'Add Staff'}
          </button>
          {editingId && (
            <button type="button" className="button secondary" onClick={resetForm} disabled={saving}>
              Cancel
            </button>
          )}
        </div>
      </form>
      {error && <p className="error">{error}</p>}
      {loading && <p className="notice">Loading staff...</p>}
      {!loading && (
        <table className="table">
          <thead>
            <tr>
              <th>Staff ID</th>
              <th>Name</th>
              <th>Position</th>
              <th>Salary</th>
              <th>Joining Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => (
              <tr key={member.id}>
                <td>{member.id}</td>
                <td>{toDisplayName(member.email)}</td>
                <td>{member.staff_profile?.position || 'Administrator'}</td>
                <td>{member.staff_profile?.salary ? `INR ${Number(member.staff_profile.salary).toFixed(2)}` : '—'}</td>
                <td>{new Date(member.staff_profile?.joining_date || member.date_joined).toLocaleDateString()}</td>
                <td>
                  <span className="badge">{member.is_active ? 'Active' : 'Inactive'}</span>
                </td>
                <td>
                  <button type="button" className="button secondary" onClick={() => startEdit(member)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="button"
                    style={{ marginLeft: '8px' }}
                    onClick={() => removeStaff(member.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {staff.length === 0 && (
              <tr>
                <td colSpan={7} className="notice">No staff records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
      <p className="notice" style={{ marginTop: '16px' }}>
        Populate staff position and salary in the backend to see them here.
      </p>
    </div>
  )
}

export default StaffPage
