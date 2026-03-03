import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../utils/error'

function RegisterPage() {
  const { register, loading } = useAuth()
  const [form, setForm] = useState({
    email: '',
    password: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
  })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const onChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      await register({
        email: form.email,
        password: form.password,
        profile: {
          phone: form.phone,
          address: form.address,
          city: form.city,
          pincode: form.pincode,
        },
      })
      navigate('/login', { state: { redirectTo: '/' } })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Registration failed.'))
    }
  }

  return (
    <div className="mx-auto max-w-lg card p-6">
      <h1 className="mb-6 text-2xl font-bold text-brandBlue">Create Customer Account</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full rounded-lg border px-3 py-2" name="email" type="email" placeholder="Email" onChange={onChange} required />
        <input className="w-full rounded-lg border px-3 py-2" name="password" type="password" placeholder="Password (min 8 chars)" onChange={onChange} required />
        <input className="w-full rounded-lg border px-3 py-2" name="phone" placeholder="Phone" onChange={onChange} />
        <input className="w-full rounded-lg border px-3 py-2" name="address" placeholder="Address" onChange={onChange} />
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="w-full rounded-lg border px-3 py-2" name="city" placeholder="City" onChange={onChange} />
          <input className="w-full rounded-lg border px-3 py-2" name="pincode" placeholder="Pincode" onChange={onChange} />
        </div>
        {error && <p className="text-sm text-brandRed">{error}</p>}
        <button type="submit" disabled={loading} className="w-full rounded-lg bg-brandBlue px-4 py-2 font-semibold text-white">
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Already registered? <Link to="/login" className="font-semibold text-brandBlue">Login</Link>
      </p>
    </div>
  )
}

export default RegisterPage
