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

  const redirectTo = location.state?.redirectTo

  const onChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      const user = await login(form)
      if (redirectTo) {
        navigate(redirectTo)
        return
      }
      navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid email or password.'))
    }
  }

  return (
    <div className="mx-auto max-w-md card p-6">
      <h1 className="mb-6 text-2xl font-bold text-brandBlue">Login</h1>
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
        {error && <p className="text-sm text-brandRed">{error}</p>}
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
