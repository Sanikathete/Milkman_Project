import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../utils/error'

function LoginPage() {
  const { login, loading } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const adminAppUrl = import.meta.env.VITE_ADMIN_APP_URL ?? 'http://127.0.0.1:5174'

  const redirectTo = location.state?.redirectTo
  const successMessage = location.state?.message

  const onChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      const user = await login({
        ...form,
        email: form.email.trim().toLowerCase(),
      })
      if (redirectTo) {
        navigate(redirectTo)
        return
      }
      if (user.role === 'ADMIN') {
        window.location.assign(`${adminAppUrl}/orders`)
        return
      }
      navigate('/dashboard')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid email or password.'))
    }
  }

  return (
    <div className="mx-auto max-w-md card p-6">
      <h1 className="mb-6 text-2xl font-bold text-brandBlue">Login</h1>
      <div className="mb-4 rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">Admin?</p>
        <p className="mt-1 text-slate-600">Use the admin dashboard login.</p>
        <a
          className="mt-2 inline-block rounded-lg bg-brandBlue px-3 py-2 text-xs font-semibold text-white"
          href={`${adminAppUrl}/login`}
        >
          Go to Admin Login
        </a>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={onChange}
          required
        />
        <input
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={onChange}
          required
        />
        {successMessage && <p className="text-sm text-green-700">{successMessage}</p>}
        {error && <p className="text-sm text-brandRed">{error}</p>}
        <div className="text-right">
          <Link to="/forgot-password" className="text-sm font-semibold text-brandBlue">
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brandBlue px-4 py-2 font-semibold text-white disabled:opacity-70"
        >
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        New customer?{' '}
        <Link to="/register" className="font-semibold text-brandBlue">
          Create account
        </Link>
      </p>
    </div>
  )
}

export default LoginPage
