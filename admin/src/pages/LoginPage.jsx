import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { API_BASE_URL, API_BASE_URL_LOOKS_LOCAL } from '../services/api'

function LoginPage() {
  const { login, loading, isAuthenticated, logout } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = location.state?.redirectTo
      navigate(redirectTo || '/orders', { replace: true })
    }
  }, [isAuthenticated, navigate, location.state])

  const onChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      const loggedInUser = await login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      })

      if (loggedInUser?.role !== 'ADMIN') {
        logout()
        setError('Admin access required.')
        return
      }

      const redirectTo = location.state?.redirectTo || '/'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError('Invalid email or password.')
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <img src="/logo.png" alt="Ranjan Logo" onError={(event) => { event.currentTarget.style.display = 'none' }} />
          <span>Ranjan</span>
        </div>
      </header>

      <main style={{ padding: '28px 16px 44px' }}>
        <section className="content" style={{ maxWidth: '520px', margin: '0 auto' }}>
          <h1 style={{ marginTop: 0 }}>Admin Login</h1>
          <p className="notice">Use your admin credentials to continue.</p>

          {import.meta.env.PROD && API_BASE_URL_LOOKS_LOCAL && (
            <p className="error" style={{ marginTop: '12px' }}>
              Deployment config issue: API URL is set to <code>{API_BASE_URL}</code>. Set <code>VITE_API_BASE_URL</code>{' '}
              and reload.
            </p>
          )}

          <form className="form" onSubmit={onSubmit}>
            <input
              className="input"
              name="email"
              type="text"
              placeholder="Username or email"
              value={form.email}
              onChange={onChange}
              required
            />
            <input
              className="input"
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={onChange}
              required
            />
            {error && <p className="error">{error}</p>}
            <button type="submit" className="button" disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>
        </section>
      </main>
    </div>
  )
}

export default LoginPage
